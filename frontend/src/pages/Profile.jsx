import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profile, isLoading } = useSelector((state) => state.auth);
  const [preferences, setPreferences] = useState({ budget: 'Medium', travelers: 1 });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getProfile());
    }
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (profile?.preferences) {
      setPreferences(profile.preferences);
    }
  }, [profile]);



  if (isLoading || !profile) {
    return <div className="text-center mt-20 text-white text-2xl font-bold">Loading Profile...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto mt-10"
    >
      <div className="max-w-md mx-auto">
        
        {/* Profile Card */}
        <div className="glass p-8 text-center bg-white/70 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[50px] z-[-1]"></div>
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white">
            <span className="text-5xl font-black text-white">{profile.name.charAt(0)}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
          <p className="text-gray-600 font-medium mb-6">{profile.email}</p>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Travel Preferences</h3>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-bold text-gray-700">Default Budget</label>
                <select 
                  value={preferences.budget}
                  onChange={(e) => setPreferences({...preferences, budget: e.target.value})}
                  className="w-full mt-1 p-3 rounded-xl border border-gray-300 bg-white/50 focus:ring-primary focus:border-primary font-medium text-gray-900"
                >
                  <option value="Budget-friendly">Budget-friendly</option>
                  <option value="Medium">Medium</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Usual Travelers</label>
                <input 
                  type="number" 
                  min="1"
                  value={preferences.travelers}
                  onChange={(e) => setPreferences({...preferences, travelers: e.target.value})}
                  className="w-full mt-1 p-3 rounded-xl border border-gray-300 bg-white/50 focus:ring-primary focus:border-primary font-medium text-gray-900"
                />
              </div>
              <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition shadow-md mt-4">
                Update Preferences
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default Profile;
