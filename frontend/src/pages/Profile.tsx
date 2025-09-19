import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PersonalInfo {
  name: string;
  email: string;
  address: string;
  portfolio: string;
  phone: string;
  linkedIn: string;
  github: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  languages: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
    link?: string;
  }>;
}

const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: currentUser?.email || '',
    address: '',
    portfolio: '',
    phone: '',
    linkedIn: '',
    github: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    projects: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const handleInputChange = (field: keyof PersonalInfo, value: any) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setPersonalInfo(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setPersonalInfo(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setPersonalInfo(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setPersonalInfo(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        startDate: '',
        endDate: '',
        gpa: ''
      }]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    setPersonalInfo(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        description: '',
        technologies: '',
        link: ''
      }]
    }));
  };

  const updateProject = (index: number, field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const removeProject = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setPersonalInfo(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        date: ''
      }]
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('');
    
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/personal-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalInfo),
      });

      if (response.ok) {
        setSaveStatus('Profile saved successfully!');
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      setSaveStatus('Error saving profile. Please try again.');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-navy-800 rounded-lg"></div>
              <span className="text-xl font-bold text-navy-800">CVCraft</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser?.displayName}
              </span>
              <button 
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy-800 mb-2">Your Profile</h1>
            <p className="text-gray-600">Build your professional CV by filling out your information below.</p>
          </div>

          {saveStatus && (
            <motion.div 
              className={`mb-6 px-4 py-3 rounded-lg ${
                saveStatus.includes('success') 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {saveStatus}
            </motion.div>
          )}

          <div className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-navy-800 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={personalInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                    placeholder="City, State, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={personalInfo.linkedIn}
                    onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL (optional)</label>
                  <input
                    type="url"
                    value={personalInfo.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL (optional)</label>
                  <input
                    type="url"
                    value={personalInfo.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-navy-800 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {personalInfo.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-sage-100 text-sage-800"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-sage-600 hover:text-sage-800"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                  placeholder="Add a skill"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-navy-800 mb-4">Languages</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {personalInfo.languages.map((language, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-navy-100 text-navy-800"
                  >
                    {language}
                    <button
                      onClick={() => removeLanguage(index)}
                      className="ml-2 text-navy-600 hover:text-navy-800"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                  placeholder="Add a language"
                />
                <button
                  onClick={addLanguage}
                  className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-navy-800">Work Experience</h2>
                <button
                  onClick={addExperience}
                  className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Experience
                </button>
              </div>
              {personalInfo.experience.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => removeExperience(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500 h-24"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-navy-800">Education</h2>
                <button
                  onClick={addEducation}
                  className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Education
                </button>
              </div>
              {personalInfo.education.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GPA (optional)</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                        placeholder="3.8/4.0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-navy-800">Projects</h2>
                <button
                  onClick={addProject}
                  className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Project
                </button>
              </div>
              {personalInfo.projects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => removeProject(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                      <input
                        type="text"
                        value={project.technologies}
                        onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500 h-20"
                        placeholder="Describe what this project does and your role in it..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                      <input
                        type="url"
                        value={project.link}
                        onChange={(e) => updateProject(index, 'link', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-navy-800">Certifications</h2>
                <button
                  onClick={addCertification}
                  className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Certification
                </button>
              </div>
              {personalInfo.certifications.map((cert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={cert.date}
                        onChange={(e) => updateCertification(index, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coral-500 focus:border-coral-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;