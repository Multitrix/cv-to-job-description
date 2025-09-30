const API_BASE_URL = 'http://localhost:8000';

export interface CVRequest {
  user_id: string;
  job_description: string;
}

export interface CVGenerationRequest {
  user_id: string;
  cv_id: string;
}

export interface CVResponse {
  message: string;
  cv_id: string;
  tailored_profile: any;
}

export interface CVGenerationResponse {
  message: string;
  pdf_path: string;
  cv_id: string;
  download_url: string;
}

export interface CVListItem {
  id: string;
  job_description: string;
  status: string;
  created_at: any;
  generated_at?: any;
  pdf_filename?: string;
}

export interface CVListResponse {
  cvs: CVListItem[];
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    return response.json();
  }

  // Test API connection
  async testConnection(): Promise<{ message: string }> {
    return this.request('/test');
  }

  // Submit job description and get tailored profile
  async submitJobDescription(data: CVRequest): Promise<CVResponse> {
    return this.request('/job-description', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Generate CV PDF from tailored profile
  async generateCV(data: CVGenerationRequest): Promise<CVGenerationResponse> {
    return this.request('/generate-cv', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get user's CV list
  async getUserCVs(userId: string): Promise<CVListResponse> {
    return this.request(`/user/${userId}/cvs`);
  }

  // Download CV PDF
  async downloadCV(cvId: string, userId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/cv/${cvId}?user_id=${userId}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    return response.blob();
  }

  // Helper to trigger download in browser
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const apiService = new ApiService();