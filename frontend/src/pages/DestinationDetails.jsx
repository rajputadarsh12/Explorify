import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addSavedDestination, removeSavedDestination, getProfile } from '../redux/slices/authSlice';
import { useEffect } from 'react';

const destinationData = {
  'Paris, France': {
    description: 'Paris, France\'s capital, is a major European city and a global center for art, fashion, gastronomy and culture.',
    famousPlaces: [
      { name: 'Eiffel Tower', location: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris', desc: 'Wrought-iron lattice tower on the Champ de Mars.', img: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Louvre Museum', location: 'Rue de Rivoli, 75001 Paris', desc: 'The world\'s largest art museum and a historic monument in Paris.', img: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=600' },
      { name: 'Cathédrale Notre-Dame', location: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris', desc: 'Medieval Catholic cathedral on the Île de la Cité.', img: 'https://images.unsplash.com/photo-1551634979-2b11f8c946fe?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  'Tokyo, Japan': {
    description: 'Tokyo, Japan’s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.',
    famousPlaces: [
      { name: 'Senso-ji', location: '2 Chome-3-1 Asakusa, Taito City, Tokyo 111-0032', desc: 'Tokyo\'s oldest temple, and one of its most significant.', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80' },
      { name: 'Tokyo Skytree', location: '1 Chome-1-2 Oshiage, Sumida City, Tokyo 131-0045', desc: 'Broadcasting and observation tower with city views.', img: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=600&q=80' },
      { name: 'Meiji Jingu', location: '1-1 Yoyogikamizonocho, Shibuya City, Tokyo 151-8557', desc: 'Shinto shrine dedicated to the deified spirits of Emperor Meiji.', img: 'https://images.pexels.com/photos/4151484/pexels-photo-4151484.jpeg?auto=compress&cs=tinysrgb&w=600' }
    ]
  },
  'Bali, Indonesia': {
    description: 'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.',
    famousPlaces: [
      { name: 'Uluwatu Temple', location: 'Pecatu, South Kuta, Badung Regency, Bali', desc: 'Balinese Hindu sea temple located in Uluwatu.', img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=600&q=80' },
      { name: 'Sacred Monkey Forest Sanctuary', location: 'Jl. Monkey Forest, Ubud, Gianyar Regency, Bali', desc: 'Nature reserve and Hindu temple complex in Ubud.', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
      { name: 'Tegallalang Rice Terrace', location: 'Jl. Raya Tegallalang, Tegallalang, Gianyar Regency, Bali', desc: 'Famous scenic rice terraces using the traditional Balinese subak system.', img: 'https://images.unsplash.com/photo-1559628233-eb1b1a45564b?auto=format&fit=crop&w=600&q=80' }
    ]
  }
};

function DestinationDetails() {
  const { name } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profile } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && !profile) {
      dispatch(getProfile());
    }
  }, [user, profile, dispatch]);

  const isSaved = profile?.savedDestinations?.includes(name);

  const toggleSave = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isSaved) {
      dispatch(removeSavedDestination(name));
    } else {
      dispatch(addSavedDestination(name));
    }
  };
  
  // Get specific data or use generic fallback
  const data = destinationData[name] || {
    description: `Explore the beautiful sights and culture of ${name}. Plan your perfect itinerary and discover hidden gems.`,
    famousPlaces: [
      { name: 'City Center Plaza', location: `Central District, ${name}`, desc: 'The bustling heart of the city with shopping and dining.', img: 'https://images.unsplash.com/photo-1477959858617-6c0852ba0428?auto=format&fit=crop&w=600&q=80' },
      { name: 'Historic Old Town', location: `Old Quarter, ${name}`, desc: 'Wander through historical streets and ancient architecture.', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80' },
      { name: 'National Museum', location: `Museum Row, ${name}`, desc: 'Discover the rich history and art of the region.', img: 'https://images.unsplash.com/photo-1518998053401-a4149e6cb60e?auto=format&fit=crop&w=600&q=80' }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto mt-6"
    >
      <div className="mb-6">
        <Link to="/bookings" className="text-primary hover:underline flex items-center gap-1 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Bookings
        </Link>
      </div>

      <div className="bg-primary text-white p-10 rounded-2xl mb-8 shadow-lg bg-cover bg-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-5xl font-extrabold mb-4">{name}</h1>
            <p className="text-xl max-w-2xl">{data.description}</p>
          </div>
          <button 
            onClick={toggleSave}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg ${isSaved ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
          >
            <svg className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            {isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <h3 className="text-3xl font-bold border-b pb-2">Famous Places to Visit</h3>
          <div className="space-y-6">
            {data.famousPlaces.map((place, index) => (
              <div key={index} className="glass overflow-hidden hover:-translate-y-1 transition flex flex-col sm:flex-row group">
                <div className="sm:w-1/3 h-48 sm:h-auto overflow-hidden shrink-0">
                  <img src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                </div>
                <div className="p-6 sm:w-2/3 flex flex-col justify-center">
                  <h4 className="text-xl font-bold text-primary mb-2">{place.name}</h4>
                  <p className="text-gray-600 mb-4">{place.desc}</p>
                  <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-auto">
                    <svg className="w-5 h-5 text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="font-medium">{place.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-3xl font-bold border-b pb-2">Location Map</h3>
          <div className="glass p-2 h-[500px] rounded-2xl overflow-hidden shadow-md">
            {/* Using Google Maps Embed API without an API key by using standard search embed */}
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              style={{ border: 0, borderRadius: '0.75rem' }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(name)}&t=&z=13&ie=UTF8&iwloc=&output=embed`} 
              allowFullScreen
              title={`Google Map for ${name}`}
            ></iframe>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-full text-blue-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             </div>
             <p className="text-sm text-blue-800">
               This interactive Google Map shows the exact location of <strong>{name}</strong>. You can zoom in to find the famous places listed!
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DestinationDetails;
