import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { UserDocument } from '../utils/userService';

const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<UserDocument>({});
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [currentUser, navigate]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      // Always start with auth data as base
      const baseUserData: UserDocument = {
        email: currentUser.email || '',
        name: currentUser.displayName || '',
        certifications: [],
        education: [],
        experience: [],
        languages: [],
        projects: [],
        skills: [],
        address: '',
        linkedin: '',
        phone: '',
        portfolio: ''
      };

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const firestoreData = userSnap.data() as UserDocument;
        // Merge Firestore data with auth data, prioritizing auth for email/name
        setUserData({
          ...firestoreData,
          email: currentUser.email || firestoreData.email || '',
          name: currentUser.displayName || firestoreData.name || '',
          // Ensure arrays exist even if not in Firestore
          certifications: firestoreData.certifications || [],
          education: firestoreData.education || [],
          experience: firestoreData.experience || [],
          languages: firestoreData.languages || [],
          projects: firestoreData.projects || [],
          skills: firestoreData.skills || []
        });
      } else {
        // No Firestore document exists, use base data
        setUserData(baseUserData);
        // Optionally create the document in Firestore
        try {
          await setDoc(userRef, baseUserData);
          console.log('Created new user document');
        } catch (createError) {
          console.log('Could not create user document, will save on first update');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't show error, just use auth data
      setUserData({
        email: currentUser.email || '',
        name: currentUser.displayName || '',
        certifications: [],
        education: [],
        experience: [],
        languages: [],
        projects: [],
        skills: [],
        address: '',
        linkedin: '',
        phone: '',
        portfolio: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    setMessage('');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      // Ensure we always include auth data when saving
      const dataToSave = {
        ...userData,
        email: currentUser.email || userData.email || '',
        name: currentUser.displayName || userData.name || ''
      };

      await setDoc(userRef, dataToSave, { merge: true });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving user data:', error);
      setMessage('Error saving profile. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateField = (field: keyof UserDocument, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof UserDocument, item: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[] || []), item]
    }));
  };

  const removeArrayItem = (field: keyof UserDocument, index: number) => {
    setUserData(prev => ({
      ...prev,
      [field]: (prev[field] as any[])?.filter((_, i) => i !== index) || []
    }));
  };

  const updateArrayItem = (field: keyof UserDocument, index: number, item: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: (prev[field] as any[])?.map((existing, i) => i === index ? item : existing) || []
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'certifications', label: 'Certifications', icon: '🏆' }
  ];

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
            <Link to="/cv-generator" className="text-text-body hover:text-primary transition-colors">
              CV Generator
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
          <h1 className="text-4xl font-bold text-text-header mb-8">My Profile</h1>

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

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="lg:w-64">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-text-body hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'personal' && (
                    <motion.div
                      key="personal"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold text-text-header mb-6">Personal Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-text-body mb-2">Full Name</label>
                          <input
                            type="text"
                            value={userData.name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-body mb-2">Email</label>
                          <input
                            type="email"
                            value={userData.email || ''}
                            onChange={(e) => updateField('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                            placeholder="Enter your email"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-body mb-2">Phone</label>
                          <input
                            type="tel"
                            value={userData.phone || ''}
                            onChange={(e) => updateField('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-body mb-2">Address</label>
                          <input
                            type="text"
                            value={userData.address || ''}
                            onChange={(e) => updateField('address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                            placeholder="Enter your address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-body mb-2">LinkedIn</label>
                          <input
                            type="url"
                            value={userData.linkedin || ''}
                            onChange={(e) => updateField('linkedin', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                            placeholder="https://linkedin.com/in/yourprofile"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-body mb-2">Portfolio</label>
                          <input
                            type="url"
                            value={userData.portfolio || ''}
                            onChange={(e) => updateField('portfolio', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'experience' && (
                    <motion.div
                      key="experience"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-text-header">Work Experience</h2>
                        <button
                          onClick={() => addArrayItem('experience', { company: '', role: '', years: 0, github: '' })}
                          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                        >
                          Add Experience
                        </button>
                      </div>
                      <div className="space-y-6">
                        {userData.experience?.map((exp, index) => (
                          <div key={index} className="p-6 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-semibold">Experience {index + 1}</h3>
                              <button
                                onClick={() => removeArrayItem('experience', index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Company</label>
                                <input
                                  type="text"
                                  value={exp.company || ''}
                                  onChange={(e) => updateArrayItem('experience', index, { ...exp, company: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="Company name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Role</label>
                                <input
                                  type="text"
                                  value={exp.role || ''}
                                  onChange={(e) => updateArrayItem('experience', index, { ...exp, role: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="Job title"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Years</label>
                                <input
                                  type="number"
                                  value={exp.years || ''}
                                  onChange={(e) => updateArrayItem('experience', index, { ...exp, years: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="Years of experience"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">GitHub (optional)</label>
                                <input
                                  type="url"
                                  value={exp.github || ''}
                                  onChange={(e) => updateArrayItem('experience', index, { ...exp, github: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="https://github.com/yourprofile"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!userData.experience || userData.experience.length === 0) && (
                          <p className="text-text-body text-center py-8">No work experience added yet. Click "Add Experience" to get started.</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'education' && (
                    <motion.div
                      key="education"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-text-header">Education</h2>
                        <button
                          onClick={() => addArrayItem('education', { degree: '', institution: '', year: 0 })}
                          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                        >
                          Add Education
                        </button>
                      </div>
                      <div className="space-y-6">
                        {userData.education?.map((edu, index) => (
                          <div key={index} className="p-6 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-semibold">Education {index + 1}</h3>
                              <button
                                onClick={() => removeArrayItem('education', index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Degree</label>
                                <input
                                  type="text"
                                  value={edu.degree || ''}
                                  onChange={(e) => updateArrayItem('education', index, { ...edu, degree: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="e.g., Bachelor of Science"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Institution</label>
                                <input
                                  type="text"
                                  value={edu.institution || ''}
                                  onChange={(e) => updateArrayItem('education', index, { ...edu, institution: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="University name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Year</label>
                                <input
                                  type="number"
                                  value={edu.year || ''}
                                  onChange={(e) => updateArrayItem('education', index, { ...edu, year: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="Graduation year"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!userData.education || userData.education.length === 0) && (
                          <p className="text-text-body text-center py-8">No education added yet. Click "Add Education" to get started.</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'skills' && (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold text-text-header mb-6">Skills & Languages</h2>
                      <div className="space-y-8">
                        {/* Skills */}
                        <div>
                          <label className="block text-lg font-medium text-text-header mb-4">Skills</label>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {userData.skills?.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary text-white rounded-full text-sm flex items-center gap-2"
                              >
                                {skill}
                                <button
                                  onClick={() => removeArrayItem('skills', index)}
                                  className="text-white hover:text-red-200"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              id="newSkill"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                              placeholder="Add a skill and press Enter"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement;
                                  if (input.value.trim()) {
                                    addArrayItem('skills', input.value.trim());
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Languages */}
                        <div>
                          <label className="block text-lg font-medium text-text-header mb-4">Languages</label>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {userData.languages?.map((language, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-accent text-white rounded-full text-sm flex items-center gap-2"
                              >
                                {language}
                                <button
                                  onClick={() => removeArrayItem('languages', index)}
                                  className="text-white hover:text-red-200"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              id="newLanguage"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                              placeholder="Add a language and press Enter"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement;
                                  if (input.value.trim()) {
                                    addArrayItem('languages', input.value.trim());
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'projects' && (
                    <motion.div
                      key="projects"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-text-header">Projects</h2>
                        <button
                          onClick={() => addArrayItem('projects', { title: '', description: '' })}
                          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                        >
                          Add Project
                        </button>
                      </div>
                      <div className="space-y-6">
                        {userData.projects?.map((project, index) => (
                          <div key={index} className="p-6 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-semibold">Project {index + 1}</h3>
                              <button
                                onClick={() => removeArrayItem('projects', index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Project Title</label>
                                <input
                                  type="text"
                                  value={project.title || ''}
                                  onChange={(e) => updateArrayItem('projects', index, { ...project, title: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="Project name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Description</label>
                                <textarea
                                  value={project.description || ''}
                                  onChange={(e) => updateArrayItem('projects', index, { ...project, description: e.target.value })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="Describe your project..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!userData.projects || userData.projects.length === 0) && (
                          <p className="text-text-body text-center py-8">No projects added yet. Click "Add Project" to get started.</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'certifications' && (
                    <motion.div
                      key="certifications"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-text-header">Certifications</h2>
                        <button
                          onClick={() => addArrayItem('certifications', { name: '', year: 0 })}
                          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                        >
                          Add Certification
                        </button>
                      </div>
                      <div className="space-y-6">
                        {userData.certifications?.map((cert, index) => (
                          <div key={index} className="p-6 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-semibold">Certification {index + 1}</h3>
                              <button
                                onClick={() => removeArrayItem('certifications', index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Certification Name</label>
                                <input
                                  type="text"
                                  value={cert.name || ''}
                                  onChange={(e) => updateArrayItem('certifications', index, { ...cert, name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="Certification title"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Year Obtained</label>
                                <input
                                  type="number"
                                  value={cert.year || ''}
                                  onChange={(e) => updateArrayItem('certifications', index, { ...cert, year: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  placeholder="Year"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!userData.certifications || userData.certifications.length === 0) && (
                          <p className="text-text-body text-center py-8">No certifications added yet. Click "Add Certification" to get started.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save Button */}
                <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;