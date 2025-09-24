'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import InfinityLoader from '@/components/infinity-loader';
import RoleUpgrade from '@/components/role-upgrade';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Bell,
  Globe,
  Shield,
  Palette,
  Camera,
  Save,
  Trash2,
  Crown
} from 'lucide-react';

export default function SettingsPage() {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    bio: '',
    role: 'user',
    timezone: 'UTC-5',
    language: 'en'
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    collaborationInvites: true,
    aiSummaries: false,
    weeklyReports: true
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    allowCollaboration: true,
    shareAnalytics: false
  });

  // Theme settings state
  const [theme, setTheme] = useState({
    darkMode: false,
    compactMode: false,
    reducedMotion: false,
    fontSize: 'medium'
  });

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;

      try {
        setInitialLoading(true);

        // Load user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData(prev => ({
            ...prev,
            displayName: userData.displayName || user.displayName || '',
            email: user.email || '',
            bio: userData.bio || '',
            role: userData.role || 'user',
            timezone: userData.timezone || 'UTC-5',
            language: userData.language || 'en'
          }));
        } else {
          // Set default values from auth
          setProfileData(prev => ({
            ...prev,
            displayName: user.displayName || '',
            email: user.email || ''
          }));
        }

        // Load settings
        const settingsDoc = await getDoc(doc(db, 'settings', user.uid));
        if (settingsDoc.exists()) {
          const settingsData = settingsDoc.data();
          if (settingsData.notifications) setNotifications(settingsData.notifications);
          if (settingsData.privacy) setPrivacy(settingsData.privacy);
          if (settingsData.theme) setTheme(settingsData.theme);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      // Update user profile in users collection
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: profileData.displayName,
        bio: profileData.bio,
        role: profileData.role,
        timezone: profileData.timezone,
        language: profileData.language,
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      // Save notification settings
      const settingsRef = doc(db, 'settings', user.uid);
      await setDoc(settingsRef, {
        notifications,
        updatedAt: new Date()
      }, { merge: true });

      alert('Notification preferences saved!');
    } catch (error) {
      console.error('Error saving notifications:', error);
      alert('Error saving notification preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      // Save privacy settings
      const settingsRef = doc(db, 'settings', user.uid);
      await setDoc(settingsRef, {
        privacy,
        updatedAt: new Date()
      }, { merge: true });

      alert('Privacy settings saved!');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      alert('Error saving privacy settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      // Save theme settings
      const settingsRef = doc(db, 'settings', user.uid);
      await setDoc(settingsRef, {
        theme,
        updatedAt: new Date()
      }, { merge: true });

      alert('Appearance settings saved!');
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      alert('Error saving appearance settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <InfinityLoader size={24} />
          <span className="text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Apple-like Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="pt-16 pb-16"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-light tracking-tight text-black title">
              Settings.
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-2xl leading-relaxed">
              Customize your experience and manage your account preferences.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs Section - Apple-like Navigation */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <Tabs defaultValue="account" className="space-y-16">
          <TabsList className="h-auto bg-transparent border-none rounded-none w-full justify-start p-0 gap-0">
            <TabsTrigger
              value="account"
              className="relative px-6 py-4 bg-transparent border-none rounded-none shadow-none text-gray-600 hover:text-black transition-colors duration-300 data-[state=active]:text-black data-[state=active]:bg-transparent font-normal text-base after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black after:scale-x-0 after:transition-transform after:duration-300 data-[state=active]:after:scale-x-100"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="relative px-6 py-4 bg-transparent border-none rounded-none shadow-none text-gray-600 hover:text-black transition-colors duration-300 data-[state=active]:text-black data-[state=active]:bg-transparent font-normal text-base after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black after:scale-x-0 after:transition-transform after:duration-300 data-[state=active]:after:scale-x-100"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="relative px-6 py-4 bg-transparent border-none rounded-none shadow-none text-gray-600 hover:text-black transition-colors duration-300 data-[state=active]:text-black data-[state=active]:bg-transparent font-normal text-base after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black after:scale-x-0 after:transition-transform after:duration-300 data-[state=active]:after:scale-x-100"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="relative px-6 py-4 bg-transparent border-none rounded-none shadow-none text-gray-600 hover:text-black transition-colors duration-300 data-[state=active]:text-black data-[state=active]:bg-transparent font-normal text-base after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black after:scale-x-0 after:transition-transform after:duration-300 data-[state=active]:after:scale-x-100"
            >
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="relative px-6 py-4 bg-transparent border-none rounded-none shadow-none text-gray-600 hover:text-black transition-colors duration-300 data-[state=active]:text-black data-[state=active]:bg-transparent font-normal text-base after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black after:scale-x-0 after:transition-transform after:duration-300 data-[state=active]:after:scale-x-100"
            >
              Appearance
            </TabsTrigger>
          </TabsList>

        {/* Account Settings - Role Management */}
        <TabsContent value="account" className="space-y-6">
          <RoleUpgrade />
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="text-lg">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                      placeholder="Your display name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={profileData.role} onValueChange={(value) => setProfileData({...profileData, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={profileData.timezone} onValueChange={(value) => setProfileData({...profileData, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                        <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                        <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                        <SelectItem value="UTC+1">Central European (UTC+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell others about yourself..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
{isLoading ? (
                      <>
                        <InfinityLoader size={16} className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, emailNotifications: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, pushNotifications: checked})
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Course Updates</Label>
                      <p className="text-sm text-gray-500">New assignments, grades, and announcements</p>
                    </div>
                    <Switch
                      checked={notifications.courseUpdates}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, courseUpdates: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Collaboration Invites</Label>
                      <p className="text-sm text-gray-500">Study group and collaboration requests</p>
                    </div>
                    <Switch
                      checked={notifications.collaborationInvites}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, collaborationInvites: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Summaries</Label>
                      <p className="text-sm text-gray-500">When AI-generated summaries are ready</p>
                    </div>
                    <Switch
                      checked={notifications.aiSummaries}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, aiSummaries: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-500">Performance and progress reports</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, weeklyReports: checked})
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
{isLoading ? (
                      <>
                        <InfinityLoader size={16} className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select value={privacy.profileVisibility} onValueChange={(value) => setPrivacy({...privacy, profileVisibility: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                        <SelectItem value="friends">Friends Only - Only connections can see</SelectItem>
                        <SelectItem value="private">Private - Only you can see</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-gray-500">Display your email on your public profile</p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, showEmail: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Collaboration Requests</Label>
                      <p className="text-sm text-gray-500">Let others invite you to study groups</p>
                    </div>
                    <Switch
                      checked={privacy.allowCollaboration}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, allowCollaboration: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Analytics</Label>
                      <p className="text-sm text-gray-500">Help improve EdFinity with usage data</p>
                    </div>
                    <Switch
                      checked={privacy.shareAnalytics}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, shareAnalytics: checked})
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePrivacy} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? (
                      <>
                        <InfinityLoader size={16} className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Privacy Settings'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Appearance & Accessibility</CardTitle>
                <CardDescription>
                  Customize how EdFinity looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-gray-500">Switch to dark theme</p>
                    </div>
                    <Switch
                      checked={theme.darkMode}
                      onCheckedChange={(checked) =>
                        setTheme({...theme, darkMode: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-gray-500">Reduce spacing and padding</p>
                    </div>
                    <Switch
                      checked={theme.compactMode}
                      onCheckedChange={(checked) =>
                        setTheme({...theme, compactMode: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reduce Motion</Label>
                      <p className="text-sm text-gray-500">Minimize animations and transitions</p>
                    </div>
                    <Switch
                      checked={theme.reducedMotion}
                      onCheckedChange={(checked) =>
                        setTheme({...theme, reducedMotion: checked})
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select value={theme.fontSize} onValueChange={(value) => setTheme({...theme, fontSize: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="extra-large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveTheme} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? (
                      <>
                        <InfinityLoader size={16} className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Appearance'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}