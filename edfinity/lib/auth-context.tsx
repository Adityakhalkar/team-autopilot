'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'user' | 'creator' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date;
  profile?: {
    bio?: string;
    timezone?: string;
    language?: string;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  updateUserRole: (role: UserRole) => Promise<void>;
  isRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS = {
  user: ['courses.view', 'profile.edit'],
  creator: ['courses.view', 'courses.create', 'courses.edit', 'courses.manage', 'analytics.view', 'profile.edit'],
  admin: ['*'] // Admin has all permissions
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile(user);
    } else {
      setUserProfile(null);
      setProfileLoading(false);
    }
  }, [user]);

  const loadUserProfile = async (firebaseUser: User) => {
    try {
      setProfileLoading(true);
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: userData.role || 'user',
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLoginAt: new Date(),
          profile: userData.profile || {}
        });

        // Update last login time
        await setDoc(userDocRef, {
          ...userData,
          lastLoginAt: new Date()
        }, { merge: true });
      } else {
        // Create new user profile with default role
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'user', // Default role
          createdAt: new Date(),
          lastLoginAt: new Date(),
          profile: {}
        };

        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateUserRole = async (role: UserRole) => {
    if (!user || !userProfile) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { role }, { merge: true });

      setUserProfile({
        ...userProfile,
        role
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const isRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;

    const userPermissions = ROLE_PERMISSIONS[userProfile.role] || [];

    // Admin has all permissions
    if (userPermissions.includes('*')) return true;

    // Check specific permission
    return userPermissions.includes(permission);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading: loading || profileLoading,
    error,
    updateUserRole,
    isRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}