import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Bookings() {
  const [searchType, setSearchType] = useState('flights');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!formData.to) return;
    
    // Generate mock results based on search type
    let mockResults = [];
    
      if (searchType === 'flights') {
      mockResults = [
        { 
          provider: 'MakeMyTrip Airlines', 
          title: `Flight from ${formData.from || 'Anywhere'} to ${formData.to}`,
          price: '₹35,000', 
          time: '08:00 AM - 11:30 AM',
          link: `https://www.makemytrip.com/flight/search?itinerary=${formData.from}-${formData.to}-${formData.date}`
        },
        { 
          provider: 'Google Flights', 
          title: `Flight from ${formData.from || 'Anywhere'} to ${formData.to}`,
          price: '₹42,000', 
          time: '02:15 PM - 05:45 PM',
          link: `https://www.google.com/travel/flights?q=flights+from+${formData.from}+to+${formData.to}+on+${formData.date}`
        }
      ];
    } else if (searchType === 'hotels') {
      mockResults = [
        { 
          provider: 'Grand Plaza Hotel', 
          title: `Luxury Stay in ${formData.to}`,
          price: '₹12,000 / night', 
          rating: '4.8/5',
          link: `https://www.booking.com/searchresults.html?ss=${formData.to}&checkin=${formData.date}`
        },
        { 
          provider: 'City Center Inn', 
          title: `Budget Friendly in ${formData.to}`,
          price: '₹6,500 / night', 
          rating: '4.2/5',
          link: `https://www.hotels.com/search.do?destination-id=${formData.to}&q-check-in=${formData.date}`
        }
      ];
    } else if (searchType === 'trains') {
      mockResults = [
        { 
          provider: 'Express Rail', 
          title: `High-Speed Train to ${formData.to}`,
          price: '₹4,500', 
          time: '09:00 AM',
          link: `https://www.thetrainline.com/book/results?origin=${formData.from}&destination=${formData.to}&outwardDate=${formData.date}`
        },
        { 
          provider: 'MegaBus', 
          title: `Comfort Bus to ${formData.to}`,
          price: '₹2,500', 
          time: '10:30 AM',
          link: `https://www.busbud.com/en/search/${formData.from}/${formData.to}/${formData.date}`
        }
      ];
    } else if (searchType === 'cabs') {
      mockResults = [
        { 
          provider: 'Uber Intercity', 
          title: `Premium Sedan from ${formData.from || 'Origin'} to ${formData.to}`,
          price: '₹3,200', 
          time: 'Anytime',
          link: `https://www.uber.com/global/en/price-estimate/`
        },
        { 
          provider: 'Ola Outstation', 
          title: `SUV (6 Seater) from ${formData.from || 'Origin'} to ${formData.to}`,
          price: '₹4,800', 
          time: 'Anytime',
          link: `https://www.olacabs.com/`
        }
      ];
    } else if (searchType === 'food') {
      mockResults = [
        { 
          provider: 'Zomato Dining', 
          title: `Top Rated Restaurants in ${formData.to}`,
          price: 'Book a Table', 
          rating: '4.9/5',
          link: `https://www.zomato.com/`
        },
        { 
          provider: 'Uber Eats / Local Delivery', 
          title: `Fast Food Delivery in ${formData.to}`,
          price: 'Order Now', 
          rating: '4.5/5',
          link: `https://www.ubereats.com/`
        }
      ];
    }
    
    setSearchResults(mockResults);
    setIsSearched(true);
  };

  const handleRedirect = (link) => {
    // Basic formatting for external links to avoid broken local routing if formats fail
    // This provides the affiliate/external redirect functionality requested
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto mt-10"
    >
      <div className="text-center mb-10 text-white">
        <h2 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Book Your Travel</h2>
        <p className="text-xl font-medium drop-shadow-md">Build comprehensive itineraries, manage budgets, and discover stunning destinations with Explorify.</p>
      </div>

      <div className="glass p-8 mb-12 bg-white/70 backdrop-blur-xl">
        <div className="flex gap-4 border-b pb-4 mb-6">
          <button 
            onClick={() => { setSearchType('flights'); setIsSearched(false); }}
            className={`font-bold pb-2 px-2 transition ${searchType === 'flights' ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-gray-900'}`}
          >Flights</button>
          <button 
            onClick={() => { setSearchType('hotels'); setIsSearched(false); }}
            className={`font-bold pb-2 px-2 transition ${searchType === 'hotels' ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-gray-900'}`}
          >Hotels</button>
          <button 
            onClick={() => { setSearchType('trains'); setIsSearched(false); }}
            className={`font-bold pb-2 px-2 transition ${searchType === 'trains' ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-gray-900'}`}
          >Buses/Trains</button>
          <button 
            onClick={() => { setSearchType('cabs'); setIsSearched(false); }}
            className={`font-bold pb-2 px-2 transition ${searchType === 'cabs' ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-gray-900'}`}
          >Cabs</button>
          <button 
            onClick={() => { setSearchType('food'); setIsSearched(false); }}
            className={`font-bold pb-2 px-2 transition ${searchType === 'food' ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-gray-900'}`}
          >Food</button>
        </div>
        
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleSearch}>
          {searchType !== 'hotels' && (
            <div className="col-span-1">
              <label className="block text-sm font-bold text-gray-900 mb-1">From</label>
              <input type="text" name="from" list="booking-cities" value={formData.from} onChange={onChange} placeholder="Origin City" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 border text-gray-900 font-medium" required />
            </div>
          )}
          <div className={`col-span-1 ${searchType === 'hotels' ? 'md:col-span-2' : ''}`}>
            <label className="block text-sm font-bold text-gray-900 mb-1">To / Destination</label>
            <input type="text" name="to" list="booking-cities" value={formData.to} onChange={onChange} placeholder="Destination City" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 border text-gray-900 font-medium" required />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-900 mb-1">Date</label>
            <input type="date" name="date" value={formData.date} onChange={onChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 border text-gray-900 font-medium" required />
          </div>
          <datalist id="booking-cities">
            <option value="New Delhi, India" />
            <option value="Mumbai, India" />
            <option value="Bangalore, India" />
            <option value="Chennai, India" />
            <option value="Kolkata, India" />
            <option value="Goa, India" />
            <option value="Jaipur, India" />
            <option value="Kerala, India" />
            <option value="New York City, USA" />
            <option value="Los Angeles, USA" />
            <option value="London, UK" />
            <option value="Paris, France" />
            <option value="Tokyo, Japan" />
            <option value="Dubai, UAE" />
            <option value="Singapore" />
            <option value="Bangkok, Thailand" />
            <option value="Bali, Indonesia" />
            <option value="Sydney, Australia" />
            <option value="Rome, Italy" />
            <option value="Istanbul, Turkey" />
            <option value="Barcelona, Spain" />
            <option value="Amsterdam, Netherlands" />
            <option value="Toronto, Canada" />
            <option value="Berlin, Germany" />
            <option value="Seoul, South Korea" />
          </datalist>
          <div className="col-span-1 flex items-end">
            <button type="submit" className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition font-bold shadow-md">
              Search {searchType}
            </button>
          </div>
        </form>
      </div>

      {isSearched ? (
        <div className="mb-12">
          <h3 className="text-3xl font-bold mb-6 text-white drop-shadow-md">Search Results</h3>
          <div className="space-y-4">
            {searchResults.map((result, idx) => (
              <div key={idx} className="glass p-6 flex flex-col md:flex-row justify-between items-center hover:-translate-y-1 transition bg-white/70 backdrop-blur-xl">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{result.title}</h4>
                  <p className="text-gray-700 font-medium mt-1">{result.provider}</p>
                  {result.time && <p className="text-sm font-medium mt-2 text-gray-900">{result.time}</p>}
                  {result.rating && <p className="text-sm font-medium text-secondary mt-2">Rating: {result.rating}</p>}
                </div>
                <div className="mt-4 md:mt-0 text-center md:text-right">
                  <p className="text-2xl font-bold text-primary mb-2">{result.price}</p>
                  <button 
                    onClick={() => handleRedirect(result.link)}
                    className="bg-secondary text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-600 transition shadow-md"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-3xl font-bold mb-6 text-white drop-shadow-md">Top Deals Today</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { dest: 'Paris, France', price: '₹45,000', img: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80' },
              { dest: 'Tokyo, Japan', price: '₹85,000', img: 'https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-temple-161401.jpeg?auto=compress&cs=tinysrgb&w=600' },
              { dest: 'Bali, Indonesia', price: '₹60,000', img: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=600' },
            ].map((deal, index) => (
              <Link to={`/destination/${deal.dest}`} key={index} className="glass overflow-hidden cursor-pointer hover:-translate-y-1 transition transform duration-300 group block bg-white/70 backdrop-blur-xl">
                <div className="h-48 w-full overflow-hidden">
                  <img src={deal.img} alt={deal.dest} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                </div>
                <div className="p-4">
                  <h4 className="text-xl font-bold text-gray-900">{deal.dest}</h4>
                  <p className="text-gray-700 font-medium text-sm mb-2 mt-1">Round trip flight</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-secondary">From {deal.price}</span>
                    <span className="text-sm font-bold text-primary group-hover:underline">Explore Destination</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default Bookings;
