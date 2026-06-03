import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCommunityTrips, resetTripState } from '../redux/slices/tripSlice';
import { motion } from 'framer-motion';

function Community() {
  const dispatch = useDispatch();
  const { trips, isLoading } = useSelector((state) => state.trip);

  useEffect(() => {
    dispatch(getCommunityTrips());
    return () => {
      dispatch(resetTripState());
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto mt-6 px-4"
    >
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Community Feed</h2>
        <p className="text-gray-600">Discover and clone AI-generated itineraries shared by other travelers!</p>
      </div>

      {trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip._id} className="glass p-6 hover:-translate-y-1 hover:shadow-lg transition flex flex-col">
              <h3 className="text-2xl font-bold mb-1 line-clamp-1" title={trip.destination}>{trip.destination}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Shared by: <span className="font-bold text-gray-700">{trip.user?.name || 'Anonymous'}</span>
              </p>
              
              <div className="mt-auto space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded">{trip.travelers}</span>
                  <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">{trip.budget}</span>
                </div>
                
                <Link to={`/trip/shared/${trip._id}`} className="block text-center w-full bg-primary hover:bg-cyan-600 text-white py-2 rounded-lg font-bold transition">
                  View & Clone
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass">
          <p className="text-xl text-gray-500">No community trips found. Be the first to share one!</p>
        </div>
      )}
    </motion.div>
  );
}

export default Community;
