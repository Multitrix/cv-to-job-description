import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { apiService, CVListItem } from '../utils/apiService';
import { UserDocument } from '../utils/userService';

const CVGenerator: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  // CV Generation states
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tailoredProfile, setTailoredProfile] = useState<any>(null);
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // CV History states
  const [cvHistory, setCvHistory] = useState<CVListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Profile validation states
  const [userProfile, setUserProfile] = useState<UserDocument | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadUserProfile();
    loadCVHistory();
  }, [currentUser, navigate]);

  const loadUserProfile = async () => {
    if (!currentUser) return;

    setProfileLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const profileData = userSnap.data() as UserDocument;
        setUserProfile(profileData);
        setIsProfileComplete(validateProfileComplete(profileData));
      } else {
        setUserProfile(null);
        setIsProfileComplete(false);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
      setIsProfileComplete(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const validateProfileComplete = (profile: UserDocument): boolean => {
    // Check required fields for CV generation
    const hasBasicInfo = !!(profile.name && profile.email);
    const hasExperience = !!(profile.experience && profile.experience.length > 0);
    const hasEducation = !!(profile.education && profile.education.length > 0);
    const hasSkills = !!(profile.skills && profile.skills.length > 0);

    return hasBasicInfo && hasExperience && hasEducation && hasSkills;
  };

  const loadCVHistory = async () => {
    if (!currentUser) return;

    setHistoryLoading(true);
    try {
      const response = await apiService.getUserCVs(currentUser.uid);
      setCvHistory(response.cvs);
    } catch (error) {
      console.error('Error loading CV history:', error);
      setMessage('Error loading CV history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleJobDescriptionSubmit = async () => {
    if (!currentUser || !jobDescription.trim()) {
      setMessage('Please enter a job description');
      return;
    }

    // Check if profile is complete before proceeding
    if (!isProfileComplete) {
      setMessage('Please complete your profile before generating a CV');
      return;
    }

    setIsProcessing(true);
    setMessage('');
    setCurrentStep(2);

    try {
      const response = await apiService.submitJobDescription({
        user_id: currentUser.uid,
        job_description: jobDescription.trim()
      });

      setTailoredProfile(response.tailored_profile);
      setCurrentCvId(response.cv_id);
      setCurrentStep(3);
      setMessage('Profile tailored successfully! Review and generate your CV.');
    } catch (error) {
      console.error('Error submitting job description:', error);
      setMessage('Error processing job description. Please try again.');
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateCV = async () => {
    if (!currentUser || !currentCvId) return;

    setIsGenerating(true);
    setMessage('');

    try {
      const response = await apiService.generateCV({
        user_id: currentUser.uid,
        cv_id: currentCvId
      });

      setMessage('CV generated successfully!');
      setCurrentStep(4);

      // Refresh history to show new CV
      await loadCVHistory();
    } catch (error) {
      console.error('Error generating CV:', error);
      setMessage('Error generating CV. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCV = async (cvId: string, filename?: string) => {
    if (!currentUser) return;

    try {
      const blob = await apiService.downloadCV(cvId, currentUser.uid);
      apiService.downloadFile(blob, filename || `CV_${cvId}.pdf`);
    } catch (error) {
      console.error('Error downloading CV:', error);
      setMessage('Error downloading CV. Please try again.');
    }
  };

  const resetWorkflow = () => {
    setJobDescription('');
    setCurrentStep(1);
    setTailoredProfile(null);
    setCurrentCvId(null);
    setMessage('');
    setIsProcessing(false);
    setIsGenerating(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add window focus listener to refresh profile when user returns from profile page
  useEffect(() => {
    const handleFocus = () => {
      if (!profileLoading && currentUser) {
        loadUserProfile();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [profileLoading, currentUser]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'tailored': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 md:px-12 bg-white shadow-sm">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="text-2xl font-bold text-text-header">CVTailor</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/profile" className="text-text-body hover:text-primary transition-colors">
              My Profile
            </Link>
            <Link to="/learn-more" className="text-text-body hover:text-primary transition-colors">
              Learn more
            </Link>
            <span className="text-text-body">
              Welcome, {currentUser?.displayName?.split(' ')[0] || currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-text-header mb-8">CV Generator</h1>

          {/* Loading State for Profile Check */}
          {profileLoading && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-body">Checking your profile...</p>
            </div>
          )}

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-lg ${
                  message.includes('Error')
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-green-50 border border-green-200 text-green-700'
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content - Only show when profile is loaded */}
          {!profileLoading && (
            <>
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'generate'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-body hover:text-primary'
              }`}
            >
              Generate CV
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-body hover:text-primary'
              }`}
            >
              CV History
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          currentStep >= step
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step}
                      </div>
                      {step < 4 && (
                        <div
                          className={`h-1 w-24 mx-2 ${
                            currentStep > step ? 'bg-primary' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center mb-6">
                  <div className="text-sm text-text-body space-x-8">
                    <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>
                      Job Description
                    </span>
                    <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>
                      Processing
                    </span>
                    <span className={currentStep >= 3 ? 'text-primary font-medium' : ''}>
                      Review & Generate
                    </span>
                    <span className={currentStep >= 4 ? 'text-primary font-medium' : ''}>
                      Download
                    </span>
                  </div>
                </div>

                {/* Profile Completeness Check */}
                {!profileLoading && !isProfileComplete && (
                  <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-amber-800 mb-2">
                          Complete Your Profile First
                        </h3>
                        <p className="text-amber-700 mb-4">
                          To generate a tailored CV, you need to complete your profile with the following information:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className={`w-4 h-4 rounded-full ${userProfile?.name && userProfile?.email ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className="text-sm">Basic Information (Name, Email)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-4 h-4 rounded-full ${userProfile?.experience && userProfile.experience.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className="text-sm">Work Experience</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-4 h-4 rounded-full ${userProfile?.education && userProfile.education.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className="text-sm">Education</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-4 h-4 rounded-full ${userProfile?.skills && userProfile.skills.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className="text-sm">Skills</span>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          Complete Profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Content */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-text-header mb-6">
                      Enter Job Description
                    </h2>
                    <p className="text-text-body mb-6">
                      Paste the job description you want to tailor your CV for. Our AI will analyze the requirements and customize your profile accordingly.
                    </p>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={12}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                        isProfileComplete
                          ? 'border-gray-300 focus:ring-accent'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      placeholder={isProfileComplete ? "Paste the job description here..." : "Complete your profile first to enable CV generation"}
                      disabled={!isProfileComplete}
                    />
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={handleJobDescriptionSubmit}
                        disabled={!jobDescription.trim() || isProcessing || !isProfileComplete}
                        className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Analyze & Tailor Profile
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-text-header mb-4">
                      Processing Job Description
                    </h2>
                    <p className="text-text-body">
                      Our AI is analyzing the job requirements and tailoring your profile...
                    </p>
                  </div>
                )}

                {currentStep === 3 && tailoredProfile && (
                  <div>
                    <h2 className="text-2xl font-bold text-text-header mb-6">
                      Tailored Profile Preview
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tailoredProfile.skills && (
                          <div>
                            <h3 className="font-semibold text-text-header mb-2">Highlighted Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {tailoredProfile.skills.slice(0, 6).map((skill: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-primary text-white rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {tailoredProfile.experiences && (
                          <div>
                            <h3 className="font-semibold text-text-header mb-2">Relevant Experience</h3>
                            <p className="text-text-body text-sm">
                              {tailoredProfile.experiences.length} experience(s) tailored for this role
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={resetWorkflow}
                        className="px-6 py-3 border border-gray-300 text-text-body rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Start Over
                      </button>
                      <button
                        onClick={handleGenerateCV}
                        disabled={isGenerating}
                        className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isGenerating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                        {isGenerating ? 'Generating CV...' : 'Generate CV PDF'}
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-text-header mb-4">
                      CV Generated Successfully!
                    </h2>
                    <p className="text-text-body mb-6">
                      Your tailored CV is ready for download. Check the CV History tab to access all your generated CVs.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setActiveTab('history')}
                        className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                      >
                        View CV History
                      </button>
                      <button
                        onClick={resetWorkflow}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Generate Another CV
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-text-header">CV History</h2>
                  <button
                    onClick={loadCVHistory}
                    disabled={historyLoading}
                    className="px-4 py-2 border border-gray-300 text-text-body rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {historyLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {historyLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-body">Loading CV history...</p>
                  </div>
                ) : cvHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-text-body mb-4">No CVs generated yet.</p>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Generate Your First CV
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cvHistory.map((cv) => (
                      <div key={cv.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-text-header">
                                CV #{cv.id.slice(-8)}
                              </h3>
                              {getStatusBadge(cv.status)}
                            </div>
                            <p className="text-text-body text-sm mb-2">
                              <strong>Job Description:</strong> {cv.job_description}
                            </p>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Created: {formatDate(cv.created_at)}</p>
                              {cv.generated_at && (
                                <p>Generated: {formatDate(cv.generated_at)}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {cv.status === 'completed' && cv.pdf_filename && (
                              <button
                                onClick={() => handleDownloadCV(cv.id, cv.pdf_filename)}
                                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm"
                              >
                                Download PDF
                              </button>
                            )}
                            {cv.status === 'tailored' && (
                              <button
                                onClick={() => handleGenerateCV()}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                              >
                                Generate PDF
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CVGenerator;