import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message); // Simple alert for now, can be replaced with a toast
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  if (isLoading) {
    return <div className="text-center mt-20 text-xl font-bold">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/40 rounded-full blur-[50px] z-[-1]"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary/40 rounded-full blur-[50px] z-[-1]"></div>

        <div className="glass p-10 rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] bg-white/10 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-gray-300 font-light">Sign in to continue your adventure.</p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={email} 
                onChange={onChange} 
                placeholder="you@example.com"
                className="block w-full rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary p-4 transition outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Password</label>
              <input 
                type="password" 
                name="password" 
                value={password} 
                onChange={onChange} 
                placeholder="••••••••"
                className="block w-full rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary p-4 transition outline-none" 
                required 
              />
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-cyan-500 text-white py-4 px-4 rounded-xl hover:from-cyan-500 hover:to-primary transition-all duration-300 font-bold shadow-[0_0_15px_rgba(8,145,178,0.5)] hover:shadow-[0_0_25px_rgba(8,145,178,0.7)] transform hover:-translate-y-1 flex justify-center items-center gap-2 text-lg"
              >
                Sign In 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-300">
            Don't have an account? <Link to="/register" className="text-secondary font-bold hover:text-emerald-400 hover:underline transition">Create one now</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
