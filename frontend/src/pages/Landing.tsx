import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
  const { currentUser } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
      {/* Header */}
      <header className="px-6 py-4 md:px-12">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-navy-800 rounded-lg"></div>
            <span className="text-2xl font-bold text-navy-800">CVCraft</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="text-gray-600 hover:text-navy-800 transition-colors">
              Learn more
            </Link>
            {currentUser ? (
              <Link 
                to="/profile" 
                className="px-6 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-6 py-2 border border-coral-500 text-coral-500 rounded-lg hover:bg-coral-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/login" 
                  className="px-6 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12 md:px-12">
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-7xl font-bold text-navy-800 mb-6 leading-tight">
                Craft Your
                <span className="block text-coral-500">Perfect CV</span>
                <span className="block text-sage-500 text-4xl md:text-5xl">Effortlessly</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                Transform your career story into an ATS-friendly CV with our AI-powered platform. 
                Tailored to your experience, optimized for success.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link 
                  to="/login"
                  className="px-8 py-4 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors text-center font-medium text-lg"
                >
                  Start Creating
                </Link>
                <Link 
                  to="/demo"
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium text-lg"
                >
                  View Demo
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-coral-500 mb-1">1000+</div>
                  <div className="text-sm text-gray-600">CVs Created</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-sage-500 mb-1">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-navy-800 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">AI Support</div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Geometric Design */}
            <motion.div variants={itemVariants} className="relative">
              <div className="relative w-full h-96 md:h-[500px]">
                {/* Background Shapes */}
                <motion.div 
                  className="absolute top-10 right-20 w-32 h-32 bg-navy-800 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute top-32 left-16 w-24 h-24 bg-sage-500 rounded-lg transform rotate-45"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute bottom-20 right-12 w-40 h-40 bg-coral-500 rounded-full opacity-80"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute bottom-32 left-20 w-20 h-20 bg-cream-200 rounded-lg"
                  animate={{ rotate: [0, 180, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Central Feature */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-64 bg-white rounded-xl shadow-2xl p-6 transform rotate-3">
                    <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mb-4"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded mb-2"></div>
                      <div className="w-16 h-2 bg-gray-200 rounded mb-4"></div>
                      <div className="w-24 h-1 bg-gray-200 rounded mb-1"></div>
                      <div className="w-20 h-1 bg-gray-200 rounded mb-1"></div>
                      <div className="w-22 h-1 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;