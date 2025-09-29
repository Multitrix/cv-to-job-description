import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LearnMore: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Transform values for parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const StepCard: React.FC<{
    step: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    delay: number;
  }> = ({ step, title, description, icon, delay }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, delay }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
            {step}
          </div>
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-text-header mb-4">{title}</h3>
        <p className="text-text-body leading-relaxed">{description}</p>
      </motion.div>
    );
  };

  const FeatureHighlight: React.FC<{
    title: string;
    description: string;
    isLeft: boolean;
  }> = ({ title, description, isLeft }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`flex items-center gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
      >
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-text-header mb-4">{title}</h3>
          <p className="text-lg text-text-body leading-relaxed">{description}</p>
        </div>
        <div className="flex-1">
          <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
            <div className="w-32 h-32 bg-white rounded-lg shadow-lg transform rotate-3 flex items-center justify-center">
              <div className="space-y-2">
                <div className="w-20 h-2 bg-primary rounded"></div>
                <div className="w-16 h-1 bg-text-body/40 rounded"></div>
                <div className="w-18 h-1 bg-text-body/40 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-12 bg-background/80 backdrop-blur-sm"
      >
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="text-2xl font-bold text-text-header">CVTailor</span>
          </Link>
          <div className="flex items-center space-x-6">
            {currentUser ? (
              <>
                <span className="text-text-body">
                  Welcome, {currentUser.displayName?.split(' ')[0] || currentUser.email}
                </span>
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
                  className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-12 relative overflow-hidden">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 -z-10"
        >
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full"></div>
          <div className="absolute bottom-32 right-32 w-48 h-48 bg-accent/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-success/10 rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-text-header mb-8 leading-tight">
            How It
            <span className="block text-accent">Works</span>
          </h1>
          <p className="text-xl text-text-body mb-12 max-w-2xl mx-auto leading-relaxed">
            Creating your perfect CV has never been easier. Our AI-powered system guides you through
            a simple 3-step process to generate tailored resumes that get you noticed.
          </p>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <svg className="w-8 h-8 text-accent mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-text-header mb-6">
              Simple. Smart. Effective.
            </h2>
            <p className="text-xl text-text-body max-w-2xl mx-auto">
              Follow these three easy steps to create a professional CV that matches any job description
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              title="Tell Us About You"
              description="Share your professional experience, education, skills, and achievements. Our intuitive form makes it easy to input all your career highlights."
              delay={0.1}
              icon={
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <StepCard
              step={2}
              title="Paste Job Description"
              description="Simply copy and paste the job description you're applying for. Our AI analyzes the requirements and identifies key skills and qualifications."
              delay={0.3}
              icon={
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />

            <StepCard
              step={3}
              title="Get Your Tailored CV"
              description="Watch as our AI crafts a perfectly tailored CV that highlights your most relevant experience and skills for the specific job."
              delay={0.5}
              icon={
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-12 bg-white/50">
        <div className="max-w-7xl mx-auto space-y-32">
          <FeatureHighlight
            title="AI-Powered Matching"
            description="Our advanced AI analyzes job descriptions and matches them with your experience, ensuring your most relevant skills are highlighted prominently."
            isLeft={true}
          />

          <FeatureHighlight
            title="ATS-Friendly Format"
            description="All our CVs are optimized for Applicant Tracking Systems (ATS), ensuring your resume passes through automated filters and reaches human recruiters."
            isLeft={false}
          />

          <FeatureHighlight
            title="Professional Templates"
            description="Choose from a variety of clean, modern templates designed by professionals to make a great first impression with any employer."
            isLeft={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-r from-primary to-accent">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h2 className="text-5xl font-bold mb-6">Ready to Land Your Dream Job?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who have successfully landed interviews with our AI-powered CV generator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary transition-colors font-medium text-lg"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 bg-text-header text-white">
        <div className="max-w-7xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="text-2xl font-bold">CVTailor</span>
          </Link>
          <p className="text-gray-400">
            © 2024 CVTailor. All rights reserved. AI-Powered CVs tailored to your dream job.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LearnMore;