import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById, clearCurrentTrip, toggleShareTrip, deleteTrip, updateTrip, chatUpdateTrip, generatePackingList, uploadTripImage, fetchLiveDeals } from '../redux/slices/tripSlice';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { io } from 'socket.io-client';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ coords, mainCoord }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lon]));
      if (mainCoord) bounds.extend(mainCoord);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (mainCoord) {
      map.setView(mainCoord, 13);
    }
  }, [coords, mainCoord, map]);
  return null;
}

function TripDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { currentTrip, isLoading, isError, message, liveDeals, isDealsLoading } = useSelector(
    (state) => state.trip
  );

  const [coordinates, setCoordinates] = useState([51.505, -0.09]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editedItinerary, setEditedItinerary] = useState([]);
  const [selectedDayForMap, setSelectedDayForMap] = useState(1);
  const [dayActivitiesCoords, setDayActivitiesCoords] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [activeActivityTitle, setActiveActivityTitle] = useState(null);
  
  const [isEditingExpenses, setIsEditingExpenses] = useState(false);
  const [actualExpenses, setActualExpenses] = useState({ flights: 0, hotels: 0, food: 0, activities: 0, total: 0 });
  const [weather, setWeather] = useState(null);
  
  const [chatPrompt, setChatPrompt] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isPackingLoading, setIsPackingLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    dispatch(getTripById(id));

    return () => {
      dispatch(clearCurrentTrip());
    };
  }, [id, user, navigate, dispatch]);

  const socketRef = useRef();
  useEffect(() => {
    socketRef.current = io(`${import.meta.env.VITE_API_URL || ""}`);
    if (id) {
      socketRef.current.emit('join-trip', id);
    }
    
    socketRef.current.on('trip-updated', () => {
      dispatch(getTripById(id));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (currentTrip?.destination) {
      // Fetch coordinates from Nominatim OpenStreetMap API
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(currentTrip.destination)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            setMapLoaded(true);
          }
        })
        .catch(err => console.error("Geocoding error:", err));
        
      setEditedItinerary(JSON.parse(JSON.stringify(currentTrip.itinerary || [])));
      if (currentTrip.actualCost) {
        setActualExpenses(currentTrip.actualCost);
      }
    }
  }, [currentTrip]);

  useEffect(() => {
    if (coordinates && coordinates[0] !== 51.505) {
      // Fetch weather forecast
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coordinates[0]}&longitude=${coordinates[1]}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`)
        .then(res => res.json())
        .then(data => {
          if (data && data.daily) {
             setWeather(data.daily);
          }
        })
        .catch(err => console.error("Weather error:", err));
    }
  }, [coordinates]);

  // Geocode activities for the selected day
  useEffect(() => {
    if (!currentTrip || !currentTrip.itinerary) return;
    
    const dayPlan = currentTrip.itinerary.find(d => d.day === selectedDayForMap);
    if (!dayPlan || !dayPlan.activities || dayPlan.activities.length === 0) {
      setDayActivitiesCoords([]);
      return;
    }

    const geocodeActivities = async () => {
      setIsGeocoding(true);
      const coords = [];
      for (const activity of dayPlan.activities) {
        if (!activity.location) {
          continue;
        }
        
        try {
          // Combine location and destination for better accuracy
          const query = `${activity.location}, ${currentTrip.destination}`;
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            coords.push({
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
              title: activity.title,
              time: activity.time
            });
          }
          // Sleep to respect Nominatim limits
          await new Promise(r => setTimeout(r, 600));
        } catch (error) {
          console.error("Geocoding activity error:", error);
        }
      }
      setDayActivitiesCoords(coords);
      setIsGeocoding(false);
    };

    geocodeActivities();
  }, [selectedDayForMap, currentTrip]);

  const handleDeleteTrip = () => {
    if (window.confirm("Are you sure you want to delete this itinerary? This action cannot be undone.")) {
      dispatch(deleteTrip(id));
      navigate('/dashboard');
    }
  };

  const handleSaveItinerary = () => {
    dispatch(updateTrip({ id, tripData: { itinerary: editedItinerary } }));
    socketRef.current?.emit('edit-trip', { tripId: id, data: 'updated' });
    setEditingDayIndex(null);
  };

  const handleActivityChange = (dayIndex, activityIndex, field, value) => {
    const updated = [...editedItinerary];
    updated[dayIndex].activities[activityIndex][field] = value;
    setEditedItinerary(updated);
  };

  const removeActivity = (dayIndex, activityIndex) => {
    const updated = [...editedItinerary];
    updated[dayIndex].activities.splice(activityIndex, 1);
    setEditedItinerary(updated);
  };

  const addActivity = (dayIndex) => {
    const updated = [...editedItinerary];
    updated[dayIndex].activities.push({
      time: "10:00 AM",
      title: "New Activity",
      description: "",
      location: "",
      cost: 0
    });
    setEditedItinerary(updated);
  };

  const handleSaveExpenses = () => {
    const total = Number(actualExpenses.flights) + Number(actualExpenses.hotels) + Number(actualExpenses.food) + Number(actualExpenses.activities);
    const updatedExpenses = { ...actualExpenses, total };
    setActualExpenses(updatedExpenses);
    dispatch(updateTrip({ id, tripData: { actualCost: updatedExpenses } }));
    socketRef.current?.emit('edit-trip', { tripId: id, data: 'updated' });
    setIsEditingExpenses(false);
  };

  const handleChatSubmit = async () => {
    if (!chatPrompt.trim()) return;
    setIsChatLoading(true);
    await dispatch(chatUpdateTrip({ id, prompt: chatPrompt }));
    socketRef.current?.emit('edit-trip', { tripId: id, data: 'updated' });
    setChatPrompt('');
    setIsChatLoading(false);
  };

  const handleGeneratePackingList = async () => {
    setIsPackingLoading(true);
    await dispatch(generatePackingList(id));
    socketRef.current?.emit('edit-trip', { tripId: id, data: 'updated' });
    setIsPackingLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    await dispatch(uploadTripImage({ id, file }));
    socketRef.current?.emit('edit-trip', { tripId: id, data: 'updated' });
    setIsUploading(false);
  };

  const exportToICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Explorify//EN\n";
    
    currentTrip.itinerary.forEach(day => {
      const d = new Date(currentTrip.startDate);
      d.setDate(d.getDate() + (day.day - 1));
      const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
      
      day.activities.forEach(activity => {
        let timeStr = "";
        try {
          const match = activity.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (match) {
            let hours = parseInt(match[1]);
            const mins = match[2];
            const ampm = match[3].toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            timeStr = `T${hours.toString().padStart(2, '0')}${mins}00`;
          }
        } catch(e) {}
        
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `DTSTART:${dateStr}${timeStr}\n`;
        icsContent += `SUMMARY:${activity.title}\n`;
        icsContent += `DESCRIPTION:${activity.description}\n`;
        icsContent += `LOCATION:${activity.location}\n`;
        icsContent += "END:VEVENT\n";
      });
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTrip.destination.replace(/\s+/g, '_')}_Itinerary.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById('itinerary-content');
    if (!input) return;
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${currentTrip.destination.replace(/\s+/g, '_')}_Itinerary.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };

  const handleFetchDeals = () => {
    dispatch(fetchLiveDeals(id));
  };

  if (isLoading || !currentTrip) {
    return (
      <div className="flex justify-center items-center h-64">
         <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto mt-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900">{currentTrip.destination}</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-500">
              {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}
            </p>
            <button 
              onClick={() => {
                dispatch(toggleShareTrip(currentTrip._id));
                if (!currentTrip.isShared) {
                  navigator.clipboard.writeText(`${window.location.origin}/trip/shared/${currentTrip._id}`);
                  alert('Share link copied to clipboard!');
                }
              }}
              className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm transition ${currentTrip.isShared ? 'bg-secondary text-white hover:bg-emerald-600' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
            >
              {currentTrip.isShared ? 'Shared (Click to Unshare)' : 'Share Trip'}
            </button>
            <button
              onClick={exportToICS}
              className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm transition text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Export
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm transition text-gray-700"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              PDF
            </button>
            <div className="bg-emerald-100/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-100 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Auto-Saved
            </div>
            <button 
              onClick={handleDeleteTrip}
              className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm backdrop-blur-md transition"
              title="Delete this Trip"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Delete
            </button>
            {currentTrip.isShared && (
              <a href={`/trip/shared/${currentTrip._id}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                View Public Link
              </a>
            )}
          </div>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-sm text-gray-500">Estimated Total</p>
          <p className="text-2xl font-bold text-secondary">₹{currentTrip.estimatedCost?.total || 0}</p>
        </div>
      </div>

      <div id="itinerary-content" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 p-4 -m-4 bg-[#f8fafc]">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 border-2 border-primary/20 bg-primary/5">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              AI Itinerary Assistant
            </h3>
            <p className="text-sm text-gray-600 mb-4">Want to change something? Just ask! Example: "Swap day 1 afternoon activity with a museum visit"</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={chatPrompt} 
                onChange={e => setChatPrompt(e.target.value)} 
                placeholder="Message AI Assistant..." 
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
              />
              <button 
                onClick={handleChatSubmit} 
                disabled={!chatPrompt.trim() || isChatLoading}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-cyan-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isChatLoading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold border-b pb-2 mb-6">Itinerary</h3>
          
          {(editedItinerary.length > 0 ? editedItinerary : currentTrip.itinerary)?.map((dayPlan, dayIndex) => (
            <div key={dayPlan.day} className="glass p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold text-primary">Day {dayPlan.day}</h4>
                {editingDayIndex !== dayIndex ? (
                  <button onClick={() => setEditingDayIndex(dayIndex)} className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1 rounded-lg text-sm font-bold transition border border-primary/20 shadow-sm">
                    Edit Day
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingDayIndex(null); setEditedItinerary(JSON.parse(JSON.stringify(currentTrip.itinerary || []))); }} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-300 transition">
                      Cancel
                    </button>
                    <button onClick={handleSaveItinerary} className="bg-secondary text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-emerald-600 transition shadow-md">
                      Save Day
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {dayPlan.activities?.map((activity, activityIndex) => (
                  <div 
                    key={activityIndex} 
                    className={`flex gap-4 border-l-2 pl-4 relative transition-colors ${activeActivityTitle === activity.title ? 'border-secondary bg-emerald-50/50' : 'border-primary'}`}
                    onMouseEnter={() => setActiveActivityTitle(activity.title)}
                    onMouseLeave={() => setActiveActivityTitle(null)}
                  >
                    <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-2 ${activeActivityTitle === activity.title ? 'bg-secondary' : 'bg-primary'}`}></div>
                    
                    {editingDayIndex !== dayIndex ? (
                      <>
                        <div className="text-sm font-bold w-20 text-gray-500 shrink-0 mt-1">{activity.time}</div>
                        <div>
                          <h5 className="font-bold text-lg">{activity.title}</h5>
                          <p className="text-gray-600 mb-1">{activity.description}</p>
                          <div className="flex gap-4 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>{activity.location}</span>
                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>₹{activity.cost}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full space-y-2 bg-white/50 p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-start">
                          <input type="text" value={activity.time} onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'time', e.target.value)} className="w-24 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Time" />
                          <button onClick={() => removeActivity(dayIndex, activityIndex)} className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-2 py-1 rounded">Remove</button>
                        </div>
                        <input type="text" value={activity.title} onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'title', e.target.value)} className="w-full font-bold text-lg text-gray-900 bg-white border border-gray-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Activity Title" />
                        <textarea value={activity.description} onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'description', e.target.value)} className="w-full text-sm text-gray-700 bg-white border border-gray-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none" rows="2" placeholder="Description"></textarea>
                        <div className="flex gap-2">
                          <input type="text" value={activity.location} onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'location', e.target.value)} className="flex-1 text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Location" />
                          <input type="number" value={activity.cost} onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'cost', e.target.value)} className="w-24 text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Cost (₹)" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {editingDayIndex === dayIndex && (
                <button onClick={() => addActivity(dayIndex)} className="mt-6 text-primary hover:text-white border-2 border-primary hover:bg-primary px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1 w-full border-dashed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Activity
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold border-b pb-2">Interactive Map</h3>
               <select 
                 value={selectedDayForMap} 
                 onChange={(e) => setSelectedDayForMap(Number(e.target.value))}
                 className="bg-white border border-gray-300 text-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
               >
                 {currentTrip.itinerary?.map(d => (
                   <option key={d.day} value={d.day}>Day {d.day}</option>
                 ))}
               </select>
            </div>
            {isGeocoding && <div className="text-xs text-primary mb-2 animate-pulse">Plotting routes on map... (this may take a few seconds)</div>}
            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
              {mapLoaded ? (
                <MapContainer center={coordinates} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController coords={dayActivitiesCoords} mainCoord={coordinates} />
                  
                  {dayActivitiesCoords.length === 0 && (
                    <Marker position={coordinates}>
                      <Popup>{currentTrip.destination}</Popup>
                    </Marker>
                  )}
                  
                  {dayActivitiesCoords.map((coord, idx) => (
                    <Marker 
                      key={idx} 
                      position={[coord.lat, coord.lon]}
                      eventHandlers={{
                        mouseover: () => setActiveActivityTitle(coord.title),
                        mouseout: () => setActiveActivityTitle(null),
                      }}
                    >
                      <Popup>
                        <strong>{coord.time}</strong><br/>
                        {coord.title}
                      </Popup>
                    </Marker>
                  ))}
                  
                  {dayActivitiesCoords.length > 1 && (
                    <Polyline 
                      positions={dayActivitiesCoords.map(c => [c.lat, c.lon])} 
                      color="#10b981" 
                      weight={3} 
                      dashArray="5, 10" 
                    />
                  )}
                </MapContainer>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Loading Map...</div>
              )}
            </div>
          </div>

          <div className="glass p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold border-b pb-2">Expenses</h3>
              {isEditingExpenses ? (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingExpenses(false)} className="text-gray-500 text-sm font-bold hover:text-gray-700">Cancel</button>
                  <button onClick={handleSaveExpenses} className="text-secondary text-sm font-bold hover:text-emerald-600">Save</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingExpenses(true)} className="text-primary text-sm font-bold hover:text-cyan-600">Track Actuals</button>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">
                <span>Category</span>
                <div className="flex w-1/2 justify-between">
                  <span>Est.</span>
                  <span>Actual</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 w-1/2">Flights</span>
                <div className="flex w-1/2 justify-between items-center">
                  <span className="text-gray-400">₹{currentTrip.estimatedCost?.flights || 0}</span>
                  {isEditingExpenses ? <input type="number" value={actualExpenses.flights} onChange={e => setActualExpenses({...actualExpenses, flights: e.target.value})} className="w-20 px-2 py-1 text-right text-sm rounded bg-white border border-gray-300" /> : <span className="font-bold">₹{actualExpenses.flights}</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 w-1/2">Hotels</span>
                <div className="flex w-1/2 justify-between items-center">
                  <span className="text-gray-400">₹{currentTrip.estimatedCost?.hotels || 0}</span>
                  {isEditingExpenses ? <input type="number" value={actualExpenses.hotels} onChange={e => setActualExpenses({...actualExpenses, hotels: e.target.value})} className="w-20 px-2 py-1 text-right text-sm rounded bg-white border border-gray-300" /> : <span className="font-bold">₹{actualExpenses.hotels}</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 w-1/2">Food</span>
                <div className="flex w-1/2 justify-between items-center">
                  <span className="text-gray-400">₹{currentTrip.estimatedCost?.food || 0}</span>
                  {isEditingExpenses ? <input type="number" value={actualExpenses.food} onChange={e => setActualExpenses({...actualExpenses, food: e.target.value})} className="w-20 px-2 py-1 text-right text-sm rounded bg-white border border-gray-300" /> : <span className="font-bold">₹{actualExpenses.food}</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 w-1/2">Activities</span>
                <div className="flex w-1/2 justify-between items-center">
                  <span className="text-gray-400">₹{currentTrip.estimatedCost?.activities || 0}</span>
                  {isEditingExpenses ? <input type="number" value={actualExpenses.activities} onChange={e => setActualExpenses({...actualExpenses, activities: e.target.value})} className="w-20 px-2 py-1 text-right text-sm rounded bg-white border border-gray-300" /> : <span className="font-bold">₹{actualExpenses.activities}</span>}
                </div>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className="font-bold w-1/2">Total</span>
                <div className="flex w-1/2 justify-between items-center">
                  <span className="text-gray-400">₹{currentTrip.estimatedCost?.total || 0}</span>
                  <span className={`font-bold ${actualExpenses.total > (currentTrip.estimatedCost?.total || 0) ? 'text-red-500' : 'text-primary'}`}>₹{actualExpenses.total || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          {weather && (
            <div className="glass p-6">
               <h3 className="text-xl font-bold border-b pb-2 mb-4">7-Day Forecast</h3>
               <div className="grid grid-cols-4 gap-2">
                 {weather.time.slice(0, 4).map((time, idx) => (
                   <div key={idx} className="bg-white/40 p-2 rounded-lg text-center shadow-sm">
                     <p className="text-xs font-bold text-gray-600 mb-1">{new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                     <p className="text-sm font-black">{Math.round(weather.temperature_2m_max[idx])}°</p>
                     <p className="text-xs text-gray-500">{Math.round(weather.temperature_2m_min[idx])}°</p>
                   </div>
                 ))}
               </div>
            </div>
          )}
          
          <div className="glass p-6">
             <h3 className="text-xl font-bold border-b pb-2 mb-4">Trip Info</h3>
             <ul className="text-gray-600 space-y-2">
               <li><span className="font-medium text-gray-900">Travelers:</span> {currentTrip.travelers}</li>
               <li><span className="font-medium text-gray-900">Budget Level:</span> {currentTrip.budget}</li>
               <li><span className="font-medium text-gray-900">Preferences:</span> {currentTrip.preferences?.join(', ') || 'None'}</li>
             </ul>
          </div>

          <div className="glass p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold border-b pb-2">Smart Packing List</h3>
               {(!currentTrip.packingList || currentTrip.packingList.length === 0) && (
                 <button onClick={handleGeneratePackingList} disabled={isPackingLoading} className="text-primary text-sm font-bold hover:text-cyan-600">
                   {isPackingLoading ? 'Generating...' : 'Generate with AI'}
                 </button>
               )}
             </div>
             {currentTrip.packingList && currentTrip.packingList.length > 0 ? (
               <ul className="text-gray-600 space-y-2 text-sm">
                 {currentTrip.packingList.map((item, idx) => (
                   <li key={idx} className="flex items-start gap-2">
                     <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                     <span>{item}</span>
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="text-sm text-gray-400 italic">No packing list generated yet.</p>
             )}
          </div>
          
          <div className="glass p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold border-b pb-2">Live Travel Deals</h3>
               <button onClick={handleFetchDeals} disabled={isDealsLoading} className="text-primary text-sm font-bold hover:text-cyan-600 flex items-center gap-1">
                 {isDealsLoading ? 'Searching...' : (liveDeals ? 'Refresh' : 'Find Deals')}
               </button>
             </div>
             
             {liveDeals ? (
               <div className="space-y-4">
                 <div>
                   <p className="font-bold text-gray-900 mb-2">Flights</p>
                   {liveDeals.flights.map((flight, idx) => (
                     <div key={idx} className="bg-white/50 p-3 rounded-lg border border-gray-100 mb-2 text-sm">
                       <div className="flex justify-between font-bold">
                         <span>{flight.airline}</span>
                         <span className="text-secondary">${flight.price}</span>
                       </div>
                       <div className="flex justify-between text-gray-500">
                         <span>{flight.time}</span>
                         <span>{flight.stops}</span>
                       </div>
                     </div>
                   ))}
                 </div>
                 <div>
                   <p className="font-bold text-gray-900 mb-2">Hotels</p>
                   {liveDeals.hotels.map((hotel, idx) => (
                     <div key={idx} className="bg-white/50 p-3 rounded-lg border border-gray-100 mb-2 text-sm flex justify-between items-center">
                       <div>
                         <p className="font-bold">{hotel.name}</p>
                         <p className="text-gray-500">⭐ {hotel.rating}</p>
                       </div>
                       <span className="text-secondary font-bold">${hotel.pricePerNight}/nt</span>
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
               <p className="text-sm text-gray-400 italic">Click "Find Deals" to see real-time prices for your destination.</p>
             )}
          </div>
        </div>
      </div>

      <div className="glass p-6 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold border-b pb-2">Memory Board</h3>
          <div>
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload} 
              disabled={isUploading}
            />
            <label 
              htmlFor="image-upload" 
              className={`bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-md cursor-pointer hover:bg-cyan-600 transition flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? 'Uploading...' : 'Add Photo'}
            </label>
          </div>
        </div>

        {currentTrip.images && currentTrip.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentTrip.images.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
                <img src={`${import.meta.env.VITE_API_URL || ""}${img}`} alt={`Trip Memory ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No photos yet. Upload memories from your trip!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default TripDetails;
