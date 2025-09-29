import { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserDocument {
  address?: string;
  certifications?: Array<{
    name?: string;
    year?: number;
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    year?: number;
  }>;
  email?: string;
  experience?: Array<{
    company?: string;
    role?: string;
    years?: number;
    github?: string;
  }>;
  languages?: Array<string>;
  linkedin?: string;
  name?: string;
  phone?: string;
  portfolio?: string;
  projects?: Array<{
    description?: string;
    title?: string;
  }>;
  skills?: Array<string>;
}

export const createOrUpdateUserDocument = async (user: User): Promise<void> => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);

  try {
    // Check if user document already exists
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user document with known information
      const userData: UserDocument = {
        email: user.email || '',
        name: user.displayName || '',
        // Initialize empty arrays and leave other fields undefined
        certifications: [],
        education: [],
        experience: [],
        languages: [],
        projects: [],
        skills: [],
        // Leave these fields empty for user to fill later
        address: '',
        linkedin: '',
        phone: '',
        portfolio: ''
      };

      await setDoc(userRef, userData);
      console.log('User document created successfully for:', user.email);
    } else {
      // User document exists, optionally update email/name if they changed
      const existingData = userSnap.data() as UserDocument;
      const updates: Partial<UserDocument> = {};

      if (user.email && existingData.email !== user.email) {
        updates.email = user.email;
      }

      if (user.displayName && existingData.name !== user.displayName) {
        updates.name = user.displayName;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await setDoc(userRef, updates, { merge: true });
        console.log('User document updated successfully for:', user.email);
      } else {
        console.log('User document already exists and is up to date for:', user.email);
      }
    }
  } catch (error) {
    console.error('Error creating/updating user document:', error);
    throw error;
  }
};