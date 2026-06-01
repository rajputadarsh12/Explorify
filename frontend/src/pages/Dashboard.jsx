import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getTrips } from '../redux/slices/tripSlice';
import { getProfile, removeSavedDestination } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, profile } = useSelector((state) => state.auth);
  const { trips, isLoading } = useSelector((state) => state.trip);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getTrips());
      if (!profile) {
        dispatch(getProfile());
      }
    }
  }, [user, navigate, dispatch, profile]);

  const handleRemoveDestination = (dest) => {
    dispatch(removeSavedDestination(dest));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-10 text-white"
    >
      <h2 className="text-4xl font-bold mb-8 drop-shadow-md">Welcome, {user && user.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link to="/plan" className="glass p-6 text-center hover:-translate-y-1 transition transform duration-300 cursor-pointer block bg-white/70 backdrop-blur-xl">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Create New Trip</h3>
          <p className="text-gray-600 text-sm">Build and customize your own perfect itinerary from scratch.</p>
        </Link>

        <a href="#recent-trips" className="glass p-6 text-center hover:-translate-y-1 transition transform duration-300 cursor-pointer block bg-white/70 backdrop-blur-xl">
          <div className="w-16 h-16 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Saved Trips</h3>
          <p className="text-gray-600 text-sm">View and manage your upcoming itineraries.</p>
        </a>

        <Link to="/profile" className="glass p-6 text-center hover:-translate-y-1 transition transform duration-300 cursor-pointer block bg-white/70 backdrop-blur-xl">
          <div className="w-16 h-16 bg-purple-500/20 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Preferences</h3>
          <p className="text-gray-600 text-sm">Update your travel preferences for tailored search results.</p>
        </Link>
      </div>

      <h3 id="recent-trips" className="text-2xl font-bold mb-4 drop-shadow-md text-white scroll-mt-24">Your Recent Trips</h3>
      {isLoading ? (
        <p>Loading trips...</p>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <Link to={`/trip/${trip._id}`} key={trip._id} className="glass p-6 block hover:-translate-y-1 transition bg-white/70 backdrop-blur-xl">
              <h4 className="text-xl font-bold text-gray-900">{trip.destination}</h4>
              <p className="text-gray-600 mt-2 text-sm font-medium">
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </p>
              <p className="mt-4 font-bold text-secondary text-lg">Est: ₹{trip.estimatedCost?.total || 0}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass p-10 text-center text-gray-900 bg-white/70 backdrop-blur-xl">
          <h4 className="text-xl font-bold mb-2">You haven't planned any trips yet.</h4>
          <Link to="/plan" className="text-primary font-bold hover:underline">Start planning your first adventure now!</Link>
        </div>
      )}

      {/* Saved Destinations Wishlist */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold drop-shadow-md text-white">My Travel Wishlist</h3>
          <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm border border-white/20">
            {profile?.savedDestinations?.length || 0} Saved Places
          </span>
        </div>

        {profile?.savedDestinations && profile.savedDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.savedDestinations.map((dest, idx) => (
              <div key={idx} className="glass overflow-hidden bg-white/70 backdrop-blur-xl group hover:-translate-y-1 transition duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <button 
                      onClick={() => handleRemoveDestination(dest)}
                      className="text-gray-400 hover:text-red-500 transition p-2 bg-white/50 rounded-full hover:bg-red-50 shadow-sm"
                      title="Remove from Wishlist"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{dest}</h4>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/destination/${dest}`} className="flex-1 bg-secondary text-white text-sm text-center font-bold py-2 rounded-lg hover:bg-emerald-600 transition shadow-md">
                      Explore
                    </Link>
                    <Link to="/plan" state={{ destination: dest }} className="flex-1 border-2 border-primary text-primary text-sm text-center font-bold py-2 rounded-lg hover:bg-primary hover:text-white transition shadow-sm">
                      Plan Trip
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-8 text-center bg-white/70 backdrop-blur-xl">
            <h4 className="text-xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h4>
            <p className="text-gray-600 mb-4 text-sm">Discover amazing places and save them here for future trips!</p>
            <Link to="/bookings" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition shadow-md inline-block">
              Discover Destinations
            </Link>
          </div>
        )}
      </div>

    </motion.div>
  );
}

export default Dashboard;
