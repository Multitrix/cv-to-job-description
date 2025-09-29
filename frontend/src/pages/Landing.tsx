import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 md:px-12">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="text-2xl font-bold text-text-header">CVTailor</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              to="/learn-more"
              className="text-text-body hover:text-primary transition-colors"
            >
              Learn more
            </Link>
            {currentUser ? (
              <>
                <span className="text-text-body">
                  Welcome, {currentUser.displayName?.split(' ')[0] || currentUser.email}
                </span>
                <Link
                  to="/profile"
                  className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-accent-dark transition-colors"
                  title="My Profile"
                >
                  {(currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
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
              <h1 className="text-5xl md:text-6xl font-bold text-text-header mb-6 leading-tight">
                Land Your
                <span className="block text-primary">Dream Job with</span>
                <span className="block text-accent text-4xl md:text-5xl">AI-Powered</span>
                <span className="block text-success text-4xl md:text-5xl">CVs</span>
              </h1>

              <p className="text-lg text-text-body mb-8 leading-relaxed max-w-lg">
                Transform your career prospects with our intelligent CV generator that tailors
                your resume to match any job description, maximizing your chances of getting hired.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/login"
                  className="px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-center font-medium text-lg"
                >
                  Create Your CV
                </Link>
                <button className="px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-center font-medium text-lg">
                  See Examples
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-accent mb-1">95%</div>
                  <div className="text-sm text-text-body">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">50+</div>
                  <div className="text-sm text-text-body">Industries</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success mb-1">1000+</div>
                  <div className="text-sm text-text-body">CVs Generated</div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Geometric Design */}
            <motion.div variants={itemVariants} className="relative">
              <div className="relative w-full h-96 md:h-[500px]">
                {/* Background Shapes */}
                <motion.div
                  className="absolute top-10 right-20 w-32 h-32 bg-primary rounded-full opacity-80"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute top-32 left-16 w-24 h-24 bg-accent rounded-lg transform rotate-45"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute bottom-20 right-12 w-40 h-40 bg-success rounded-full opacity-60"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute bottom-32 left-20 w-20 h-20 bg-background border-2 border-primary rounded-lg"
                  animate={{ rotate: [0, 180, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Central Feature - Design Preview */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-64 bg-white rounded-xl shadow-2xl p-6 transform rotate-3 border border-gray-100">
                    <div className="h-full flex flex-col">
                      <div className="w-12 h-12 bg-accent rounded-full mb-3"></div>
                      <div className="w-20 h-2 bg-primary rounded mb-1"></div>
                      <div className="w-16 h-1 bg-text-body rounded mb-4 opacity-60"></div>

                      <div className="w-full h-1 bg-gray-200 rounded mb-3"></div>

                      <div className="space-y-2">
                        <div className="w-24 h-1 bg-text-body rounded opacity-40"></div>
                        <div className="w-20 h-1 bg-text-body rounded opacity-40"></div>
                        <div className="w-22 h-1 bg-text-body rounded opacity-40"></div>
                      </div>

                      <div className="mt-4 w-full h-1 bg-gray-200 rounded mb-2"></div>
                      <div className="space-y-1">
                        <div className="w-28 h-1 bg-text-body rounded opacity-40"></div>
                        <div className="w-24 h-1 bg-text-body rounded opacity-40"></div>
                      </div>
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