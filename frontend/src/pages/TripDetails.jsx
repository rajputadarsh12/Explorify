import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById, clearCurrentTrip, toggleShareTrip, deleteTrip, updateTrip } from '../redux/slices/tripSlice';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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

function TripDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { currentTrip, isLoading, isError, message } = useSelector(
    (state) => state.trip
  );

  const [coordinates, setCoordinates] = useState([51.505, -0.09]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editedItinerary, setEditedItinerary] = useState([]);

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
    }
  }, [currentTrip]);

  const handleDeleteTrip = () => {
    if (window.confirm("Are you sure you want to delete this itinerary? This action cannot be undone.")) {
      dispatch(deleteTrip(id));
      navigate('/dashboard');
    }
  };

  const handleSaveItinerary = () => {
    dispatch(updateTrip({ id, tripData: { itinerary: editedItinerary } }));
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 space-y-6">
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
                  <div key={activityIndex} className="flex gap-4 border-l-2 border-primary pl-4 relative">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-2"></div>
                    
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
                        <input type="text" value={activity.title} onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'title', e.target.value)} className="w-full font-bold text-lg bg-white border border-gray-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Activity Title" />
                        <textarea value={activity.description} onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'description', e.target.value)} className="w-full text-sm text-gray-700 bg-white border border-gray-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none" rows="2" placeholder="Description"></textarea>
                        <div className="flex gap-2">
                          <input type="text" value={activity.location} onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'location', e.target.value)} className="flex-1 text-sm bg-white border border-gray-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Location" />
                          <input type="number" value={activity.cost} onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'cost', e.target.value)} className="w-24 text-sm bg-white border border-gray-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Cost (₹)" />
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
            <h3 className="text-xl font-bold border-b pb-2 mb-4">Interactive Map</h3>
            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
              {mapLoaded ? (
                <MapContainer center={coordinates} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={coordinates}>
                    <Popup>
                      {currentTrip.destination}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Loading Map...</div>
              )}
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="text-xl font-bold border-b pb-2 mb-4">Budget Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Flights</span>
                <span className="font-bold">₹{currentTrip.estimatedCost?.flights || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hotels</span>
                <span className="font-bold">₹{currentTrip.estimatedCost?.hotels || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Food</span>
                <span className="font-bold">₹{currentTrip.estimatedCost?.food || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activities</span>
                <span className="font-bold">₹{currentTrip.estimatedCost?.activities || 0}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">₹{currentTrip.estimatedCost?.total || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-6">
             <h3 className="text-xl font-bold border-b pb-2 mb-4">Trip Info</h3>
             <ul className="text-gray-600 space-y-2">
               <li><span className="font-medium text-gray-900">Travelers:</span> {currentTrip.travelers}</li>
               <li><span className="font-medium text-gray-900">Budget Level:</span> {currentTrip.budget}</li>
               <li><span className="font-medium text-gray-900">Preferences:</span> {currentTrip.preferences?.join(', ') || 'None'}</li>
             </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TripDetails;
