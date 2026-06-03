import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = ({ user }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <div className="mt-20 flex flex-col lg:flex-row items-center justify-between gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 text-left"
              >
                <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                  <span className="text-secondary font-bold">✨ Custom Travel Builder</span>
                </div>
                <h1 className="text-6xl font-black mb-6 leading-tight text-white drop-shadow-lg">
                  Discover The World,<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Designed By You.</span>
                </h1>
                <p className="text-xl text-gray-200 mb-10 max-w-xl font-light drop-shadow-md">
                  Experience custom itineraries, intelligent budget tracking, and breathtaking destinations. Your ultimate premium travel hub.
                </p>
                
                <div className="flex gap-4">
                  <Link to={user ? "/plan" : "/login"} className="bg-secondary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-500 transition shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-2">
                    Start Exploring
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                  <Link to="/bookings" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition flex items-center gap-2">
                    View Top Deals
                  </Link>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 relative"
              >
                {/* Floating Glass Search Card */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="glass p-8 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl relative z-10 mx-auto max-w-md bg-white/10"
                >
                  <h3 className="text-2xl font-bold mb-6 text-white text-center">Where to next?</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                      <input type="text" placeholder="Destination, city, or region" className="w-full pl-10 pr-4 py-4 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary backdrop-blur-md transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="date" className="w-full px-4 py-4 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" />
                      <select className="w-full px-4 py-4 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:border-secondary transition appearance-none">
                        <option className="text-black" value="1">1 Traveler</option>
                        <option className="text-black" value="2">2 Travelers</option>
                        <option className="text-black" value="3">3+ Travelers</option>
                      </select>
                    </div>
                    <Link to={user ? "/plan" : "/login"} className="block w-full bg-primary text-white text-center px-4 py-4 rounded-xl font-bold text-lg hover:bg-cyan-500 transition shadow-lg mt-2">
                      Search Destinations
                    </Link>
                  </div>
                </motion.div>
                
                {/* Decorative glowing orb behind the card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/30 rounded-full blur-[100px] z-0 pointer-events-none"></div>
              </motion.div>
            </div>
          </PageTransition>
        } />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/plan" element={<PageTransition><PlanTrip /></PageTransition>} />
        <Route path="/trip/:id" element={<PageTransition><TripDetails /></PageTransition>} />
        <Route path="/trip/shared/:id" element={<PageTransition><SharedTrip /></PageTransition>} />
        <Route path="/bookings" element={<PageTransition><Bookings /></PageTransition>} />
        <Route path="/destination/:name" element={<PageTransition><DestinationDetails /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from './redux/slices/authSlice';

import DynamicBackground from './components/DynamicBackground';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlanTrip from './pages/PlanTrip';
import TripDetails from './pages/TripDetails';
import SharedTrip from './pages/SharedTrip';
import Bookings from './pages/Bookings';
import DestinationDetails from './pages/DestinationDetails';
import Profile from './pages/Profile';
import Community from './pages/Community';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
  };

  return (
    <Router>
      <div className="min-h-screen relative text-white">
        <DynamicBackground />
        
        <nav className="p-6 bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Explorify
            </Link>
            <div className="flex items-center justify-end gap-6">
              {user ? (
                <>
                  <Link to="/community" className="text-white/90 hover:text-white font-bold transition whitespace-nowrap">Community</Link>
                  <Link to="/bookings" className="text-white/90 hover:text-white font-bold transition whitespace-nowrap">Bookings</Link>
                  <Link to="/dashboard" className="text-white/90 hover:text-white font-bold transition whitespace-nowrap">Dashboard</Link>
                  <Link to="/profile" className="text-white/90 hover:text-white font-bold transition flex items-center gap-1 whitespace-nowrap">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Profile
                  </Link>
                  <button onClick={onLogout} className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold transition shadow-md backdrop-blur-md whitespace-nowrap ml-2">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-white/90 hover:text-white font-bold transition whitespace-nowrap">Login</Link>
                  <Link to="/register" className="bg-primary/90 hover:bg-primary text-white px-6 py-2 rounded-full font-bold transition shadow-md backdrop-blur-md inline-block whitespace-nowrap">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-6 relative z-10">
<AnimatedRoutes user={user} />
        </main>
      </div>
    </Router>
  );
}

export default App;
