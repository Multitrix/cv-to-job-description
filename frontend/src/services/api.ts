const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export interface PersonalInfo {
  name: string;
  email: string;
  address?: string;
  portfolio?: string;
  phone: string;
  linkedIn: string;
  github?: string;
  skills: string[];
  experience?: Array<{
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
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  languages: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string;
    link?: string;
  }>;
}

class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async savePersonalInfo(personalInfo: PersonalInfo) {
    const response = await fetch(`${this.baseURL}/personal-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personalInfo),
    });

    if (!response.ok) {
      throw new Error('Failed to save personal information');
    }

    return response.json();
  }

  async getPersonalInfo(documentId: string) {
    const response = await fetch(`${this.baseURL}/personal-info/${documentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch personal information');
    }

    return response.json();
  }

  async testConnection() {
    const response = await fetch(`${this.baseURL}/test`);
    if (!response.ok) {
      throw new Error('Backend connection failed');
    }
    return response.json();
  }
}

export const apiService = new APIService();
export default APIService;