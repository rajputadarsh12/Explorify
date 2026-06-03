import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTripItinerary, resetTripState, suggestDestination, generateTrip } from '../redux/slices/tripSlice';
import { motion } from 'framer-motion';

function PlanTrip() {
  const [travelerType, setTravelerType] = useState('experienced');
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 'Medium',
    travelers: 1,
    preferences: [],
  });

  const { destination, startDate, endDate, budget, travelers, preferences } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentTrip, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.trip
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    
    if (isError) {
      alert(message);
    }

    if (isSuccess && currentTrip) {
      navigate(`/trip/${currentTrip._id}`);
      dispatch(resetTripState());
    }
  }, [user, currentTrip, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onCheckboxChange = (e) => {
    const value = e.target.value;
    setFormData((prevState) => {
      const newPreferences = prevState.preferences.includes(value)
        ? prevState.preferences.filter((p) => p !== value)
        : [...prevState.preferences, value];
      return { ...prevState, preferences: newPreferences };
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (travelerType === 'beginner') {
      dispatch(generateTrip(formData));
    } else {
      dispatch(createTripItinerary(formData));
    }
  };

  const prefOptions = ['Adventure', 'Relaxation', 'Culture', 'Food', 'Nature', 'Nightlife', 'Shopping'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto mt-10"
    >
      <div className="text-center mb-10">
        <h2 className="text-5xl font-extrabold mb-4">Create New Trip</h2>
        <p className="text-xl font-medium">Build a personalized itinerary for your next adventure.</p>
      </div>
      <div className="glass p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Traveler Type</label>
            <div className="flex gap-4">
              <label className={`flex-1 text-center py-3 px-4 rounded-xl border cursor-pointer transition ${travelerType === 'experienced' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                <input type="radio" className="hidden" name="travelerType" value="experienced" checked={travelerType === 'experienced'} onChange={(e) => setTravelerType(e.target.value)} />
                Experienced
              </label>
              <label className={`flex-1 text-center py-3 px-4 rounded-xl border cursor-pointer transition ${travelerType === 'beginner' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                <input type="radio" className="hidden" name="travelerType" value="beginner" checked={travelerType === 'beginner'} onChange={(e) => setTravelerType(e.target.value)} />
                Beginner
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Destination</label>
            <input 
              type="text" 
              name="destination" 
              list="popular-destinations"
              value={destination} 
              onChange={onChange} 
              placeholder="e.g. Tokyo, Japan"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 border" 
              required 
            />
            <datalist id="popular-destinations">
              <option value="Paris, France" />
              <option value="Tokyo, Japan" />
              <option value="Bali, Indonesia" />
              <option value="New York City, USA" />
              <option value="London, UK" />
              <option value="Rome, Italy" />
              <option value="Dubai, UAE" />
              <option value="Sydney, Australia" />
              <option value="Cape Town, South Africa" />
              <option value="Rio de Janeiro, Brazil" />
              <option value="Bangkok, Thailand" />
              <option value="Istanbul, Turkey" />
              <option value="Barcelona, Spain" />
              <option value="Amsterdam, Netherlands" />
              <option value="Singapore" />
              <option value="Kyoto, Japan" />
              <option value="Maldives" />
              <option value="Santorini, Greece" />
              <option value="Prague, Czech Republic" />
              <option value="Seoul, South Korea" />
              <option value="Mumbai, India" />
              <option value="Goa, India" />
              <option value="Jaipur, India" />
              <option value="Kerala, India" />
            </datalist>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                value={startDate} 
                onChange={onChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 border" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input 
                type="date" 
                name="endDate" 
                value={endDate} 
                onChange={onChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 border" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget Level</label>
              <select name="budget" value={budget} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 border">
                <option value="Budget-friendly">Budget-friendly</option>
                <option value="Medium">Medium</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Travelers</label>
              <input 
                type="number" 
                name="travelers" 
                min="1"
                value={travelers} 
                onChange={onChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 border" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferences (Select up to 3)</label>
            <div className="flex flex-wrap gap-2">
              {prefOptions.map(pref => (
                <label key={pref} className={`px-4 py-2 rounded-full border cursor-pointer transition ${preferences.includes(pref) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  <input type="checkbox" className="hidden" value={pref} onChange={onCheckboxChange} disabled={!preferences.includes(pref) && preferences.length >= 3} />
                  {pref}
                </label>
              ))}
            </div>
          </div>

          {travelerType === 'experienced' ? (
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-xl hover:bg-blue-600 transition font-bold text-lg shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] disabled:opacity-50"
            >
              {isLoading ? 'Creating Trip Shell...' : 'Start Planning'}
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-secondary text-white py-4 rounded-xl hover:bg-emerald-600 transition font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isLoading ? 'Generating Itinerary...' : 'Generate AI Itinerary'}
              {!isLoading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
            </button>
          )}
        </form>
      </div>
    </motion.div>
  );
}

export default PlanTrip;
