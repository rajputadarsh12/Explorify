import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updatePreferences } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profile, isLoading } = useSelector((state) => state.auth);
  const [preferences, setPreferences] = useState({ budget: 'Medium', travelers: 1 });
  const [gender, setGender] = useState('Prefer not to say');

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
    if (profile?.gender) {
      setGender(profile.gender);
    }
  }, [profile]);

  const handleUpdate = () => {
    dispatch(updatePreferences({ preferences, gender }));
  };



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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Traveler Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div className="bg-primary/10 p-4 rounded-xl">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Points</p>
                <p className="text-3xl font-black text-primary">{profile.points || 0}</p>
              </div>
              <div className="bg-secondary/10 p-4 rounded-xl">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Trips Shared</p>
                <p className="text-3xl font-black text-secondary">{profile.tripsShared || 0}</p>
              </div>
            </div>
            
            {profile.badges && profile.badges.length > 0 && (
              <div className="mb-6 text-left">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Badges Unlocked</p>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, idx) => (
                    <span key={idx} className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L5.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 014 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L8 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd"></path></svg>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
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
              <div>
                <label className="block text-sm font-bold text-gray-700">Gender</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-gray-300 bg-white/50 focus:ring-primary focus:border-primary font-medium text-gray-900"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button onClick={handleUpdate} className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition shadow-md mt-4">
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
