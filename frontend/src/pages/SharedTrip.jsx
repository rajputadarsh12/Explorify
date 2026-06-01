import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSharedTrip, clearCurrentTrip, saveSharedTrip } from '../redux/slices/tripSlice';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function SharedTrip() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentTrip, isLoading, isError, message } = useSelector(
    (state) => state.trip
  );
  
  // Get auth state to check if user is logged in
  const { user } = useSelector((state) => state.auth);

  const [coordinates, setCoordinates] = useState([51.505, -0.09]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    dispatch(getSharedTrip(id));

    return () => {
      dispatch(clearCurrentTrip());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (currentTrip?.destination) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(currentTrip.destination)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            setMapLoaded(true);
          }
        })
        .catch(err => console.error("Geocoding error:", err));
    }
  }, [currentTrip]);

  if (isLoading || !currentTrip) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        {isError ? (
            <div className="text-center">
                <p className="text-xl text-red-500 font-bold mb-4">{message}</p>
                <Link to="/" className="text-primary hover:underline">Go to Explorify Home</Link>
            </div>
        ) : (
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto mt-6"
    >
      <div className="bg-primary text-white p-4 rounded-xl mb-8 flex flex-col md:flex-row justify-between items-center shadow-md gap-4">
        <p className="font-medium text-center md:text-left">You are viewing a shared trip planned with Explorify.</p>
        <div className="flex gap-3">
          {user ? (
            <button 
              onClick={() => {
                dispatch(saveSharedTrip(currentTrip._id));
                alert("Trip successfully saved to your Dashboard!");
                navigate('/dashboard');
              }}
              className="bg-secondary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition"
            >
              Save to My Trips
            </button>
          ) : (
            <Link to="/login" className="bg-secondary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition">Login to Save Trip</Link>
          )}
          <Link to="/" className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition">Plan Your Own Trip</Link>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900">{currentTrip.destination}</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-500">
              {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}
            </p>
            {currentTrip.user && (
                <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    Created by {currentTrip.user.name}
                </span>
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
          <h3 className="text-2xl font-bold border-b pb-2">Itinerary</h3>
          {currentTrip.itinerary?.map((dayPlan) => (
            <div key={dayPlan.day} className="glass p-6">
              <h4 className="text-xl font-bold text-primary mb-4">Day {dayPlan.day}</h4>
              <div className="space-y-4">
                {dayPlan.activities?.map((activity, index) => (
                  <div key={index} className="flex gap-4 border-l-2 border-primary pl-4 relative">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-2"></div>
                    <div className="text-sm font-bold w-20 text-gray-500 shrink-0 mt-1">{activity.time}</div>
                    <div>
                      <h5 className="font-bold text-lg">{activity.title}</h5>
                      <p className="text-gray-600 mb-1">{activity.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>{activity.location}</span>
                        <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>₹{activity.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        </div>
      </div>
    </motion.div>
  );
}

export default SharedTrip;
