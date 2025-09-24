'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import InfinityLoader from '@/components/infinity-loader';
import QuizCreator from '@/components/quiz-creator';
import {
  Youtube,
  Plus,
  Trash2,
  Save,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Link,
  Video,
  Clock,
  Globe,
  Brain,
  ArrowRight,
  ArrowLeft,
  X,
  Edit3,
  PlayCircle
} from 'lucide-react';
// We can create a simple playlist ID extractor inline

interface VideoData {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
  url: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface VideoWithQuiz extends VideoData {
  quiz: QuizQuestion[];
}

interface CourseData {
  title: string;
  description: string;
  category: string;
  level: string;
  price: string;
  tags: string[];
  playlistUrl: string;
  videos: VideoWithQuiz[];
}

// Step definitions
type CourseStep = 'playlist' | 'videos' | 'quizzes' | 'publish';

const CreateCoursePage = () => {
  const { hasPermission, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CourseStep>('playlist');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [editingQuizVideoId, setEditingQuizVideoId] = useState<string | null>(null);
  const [creatingQuizVideoId, setCreatingQuizVideoId] = useState<string | null>(null);

  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    category: '',
    level: '',
    price: 'free',
    tags: [],
    playlistUrl: '',
    videos: []
  });

  // Helper function to extract video ID from YouTube URL
  const extractVideoIdFromUrl = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const handleInputChange = useCallback((field: keyof CourseData, value: string) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const addTag = useCallback(() => {
    if (currentTag.trim()) {
      setCourseData(prev => {
        if (!prev.tags.includes(currentTag.trim())) {
          return {
            ...prev,
            tags: [...prev.tags, currentTag.trim()]
          };
        }
        return prev;
      });
      setCurrentTag('');
    }
  }, [currentTag]);

  const removeTag = useCallback((tagToRemove: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);


  // Simple playlist ID extractor
  const extractPlaylistId = (url: string): string | null => {
    const patterns = [
      /[&?]list=([a-zA-Z0-9_-]+)/,
      /playlist\?list=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const validatePlaylistUrl = (url: string): { isValid: boolean; error?: string } => {
    if (!url.trim()) {
      return { isValid: false, error: 'Please enter a YouTube playlist URL' };
    }

    const playlistId = extractPlaylistId(url);

    if (!playlistId) {
      return {
        isValid: false,
        error: 'Invalid YouTube playlist URL. Please check the format.'
      };
    }

    return { isValid: true };
  };

  const handleFetchPlaylistVideos = async () => {
    const validation = validatePlaylistUrl(courseData.playlistUrl);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setIsFetchingVideos(true);
    try {
      const playlistId = extractPlaylistId(courseData.playlistUrl);
      if (!playlistId) {
        alert('Invalid YouTube playlist URL format');
        return;
      }

      console.log('Fetching playlist from backend');
      console.log('Original URL:', courseData.playlistUrl);

      // Fetch video URLs from backend API
      const response = await fetch('http://localhost:8000/youtube/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlist_url: courseData.playlistUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);

      // Handle backend response format
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch playlist from backend');
      }

      // Extract video URLs from backend response
      const videoUrls = data.videos || [];

      if (videoUrls.length === 0) {
        alert('No videos found in this playlist. Please check the playlist URL and make sure it\'s public or unlisted.');
        return;
      }

      // Convert backend video data to our VideoWithQuiz format
      const videosWithQuiz: VideoWithQuiz[] = data.videos.map((video: any, index: number) => {
        const videoUrl = video.url;
        const videoId = extractVideoIdFromUrl(videoUrl);

        return {
          id: (index + 1).toString(),
          title: video.title || `Video ${index + 1}`,
          thumbnail: video.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '/api/placeholder/320/180'),
          description: video.description || 'No description available.',
          url: videoUrl,
          quiz: []
        };
      });

      console.log(`Successfully fetched ${videosWithQuiz.length} videos from playlist`);

      setCourseData(prev => ({
        ...prev,
        videos: videosWithQuiz
      }));

      // Videos imported successfully - creator can now manually add quizzes if desired

    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      alert('Error fetching playlist videos. Please try again or check your internet connection.');
    } finally {
      setIsFetchingVideos(false);
    }
  };

  // Quiz generation moved to user-side after video watching

  const removeVideo = useCallback((videoId: string) => {
    setCourseData(prev => ({
      ...prev,
      videos: prev.videos.filter(video => video.id !== videoId)
    }));
  }, []);

  const updateQuiz = useCallback((videoId: string, quiz: QuizQuestion[]) => {
    setCourseData(prev => ({
      ...prev,
      videos: prev.videos.map(video =>
        video.id === videoId ? { ...video, quiz } : video
      )
    }));
  }, []);

  const handleSaveCourse = async () => {
    if (!courseData.title.trim() || !courseData.description.trim() || courseData.videos.length === 0) {
      alert('Please fill in all required fields and add videos from a YouTube playlist.');
      return;
    }

    setIsLoading(true);
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

      // Check if user is authenticated
      if (!user) {
        throw new Error('User must be logged in to create courses');
      }

      // Clean and prepare course data for Firebase (remove undefined values)
      const cleanCourseData = {
        title: courseData.title || '',
        description: courseData.description || '',
        category: courseData.category || '',
        level: courseData.level || '',
        price: courseData.price || 'free',
        tags: courseData.tags || [],
        playlistUrl: courseData.playlistUrl || '',
        videos: courseData.videos.map(video => ({
          id: video.id || '',
          title: video.title || 'Untitled Video',
          description: video.description || '',
          url: video.url || '',
          thumbnail: video.thumbnail || '',
          duration: video.duration || '',
          creatorQuiz: video.quiz || [] // Creator-made quizzes
        })),
        creatorId: user.uid,
        creatorEmail: user.email || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'published',
        enrollmentCount: 0,
        rating: 0,
        reviewCount: 0
      };

      // Remove any remaining undefined values
      const courseDoc = JSON.parse(JSON.stringify(cleanCourseData, (key, value) => {
        return value === undefined ? null : value;
      }));

      // Debug: Check for any undefined values before saving
      console.log('Course data before cleaning:', courseData);
      console.log('Saving course to Firebase:', courseDoc);

      // Additional validation - check if required fields are present
      if (!courseDoc.title || !courseDoc.description || !courseDoc.videos || courseDoc.videos.length === 0) {
        throw new Error('Missing required course data');
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'courses'), courseDoc);

      console.log('Course saved with ID:', docRef.id);
      alert(`Course "${courseData.title}" created successfully!`);

      // Redirect to courses page
      window.location.href = '/dashboard/courses';

    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalDuration = useMemo(() => {
    return courseData.videos.reduce((total, video) => {
      // Handle various duration formats or missing duration
      if (!video.duration || video.duration === 'Duration not available') {
        return total; // Skip videos without duration
      }

      try {
        const parts = video.duration.split(':').map(Number);
        if (parts.length === 2) {
          // MM:SS format
          const [minutes, seconds] = parts;
          return total + minutes + (seconds / 60);
        } else if (parts.length === 3) {
          // HH:MM:SS format
          const [hours, minutes, seconds] = parts;
          return total + (hours * 60) + minutes + (seconds / 60);
        }
        return total;
      } catch (error) {
        console.warn('Invalid duration format:', video.duration);
        return total;
      }
    }, 0);
  }, [courseData.videos]);

  const getStepStatus = useCallback((step: CourseStep) => {
    switch (step) {
      case 'playlist':
        return courseData.playlistUrl ? 'completed' : currentStep === step ? 'current' : 'pending';
      case 'videos':
        return courseData.videos.length > 0 ? 'completed' : currentStep === step ? 'current' : 'pending';
      case 'quizzes':
        return currentStep === step ? 'current' : courseData.videos.some(v => v.quiz.length > 0) ? 'completed' : 'pending';
      case 'publish':
        return currentStep === step ? 'current' : 'pending';
      default:
        return 'pending';
    }
  }, [courseData.playlistUrl, courseData.videos.length, currentStep, courseData.videos]);

  const canProceedToStep = useCallback((step: CourseStep) => {
    switch (step) {
      case 'videos':
        return courseData.playlistUrl.trim() !== '';
      case 'quizzes':
        return courseData.videos.length > 0;
      case 'publish':
        return courseData.videos.length > 0 && !!courseData.title.trim() && !!courseData.description.trim();
      default:
        return true;
    }
  }, [courseData.playlistUrl, courseData.videos.length, courseData.title, courseData.description]);

  // Step navigation handlers
  const goToStep = useCallback((step: CourseStep) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
    }
  }, [canProceedToStep]);

  const nextStep = useCallback(() => {
    const steps: CourseStep[] = ['playlist', 'videos', 'quizzes', 'publish'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStepValue = steps[currentIndex + 1];
      if (canProceedToStep(nextStepValue)) {
        setCurrentStep(nextStepValue);
      }
    }
  }, [currentStep, canProceedToStep]);

  const prevStep = useCallback(() => {
    const steps: CourseStep[] = ['playlist', 'videos', 'quizzes', 'publish'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep]);

  const canProceedToNextStep = useMemo(() => {
    const steps: CourseStep[] = ['playlist', 'videos', 'quizzes'];
    const nextSteps: CourseStep[] = ['videos', 'quizzes', 'publish'];
    const currentIndex = steps.indexOf(currentStep);
    const nextStepValue = nextSteps[currentIndex];
    return nextStepValue ? canProceedToStep(nextStepValue) : false;
  }, [currentStep, canProceedToStep]);

  // Step progress indicator - Apple-like design
  const StepIndicator = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-white border border-gray-100 rounded-2xl p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { key: 'playlist' as CourseStep, title: 'Import Playlist', description: 'Add YouTube videos', icon: Youtube },
          { key: 'videos' as CourseStep, title: 'Review Content', description: 'Confirm video selection', icon: Video },
          { key: 'quizzes' as CourseStep, title: 'Add Quizzes', description: 'Optional creator quizzes', icon: Brain },
          { key: 'publish' as CourseStep, title: 'Publish Course', description: 'Go live for students', icon: Globe }
        ].map((step, index) => {
          const status = getStepStatus(step.key);
          const Icon = step.icon;
          const isClickable = canProceedToStep(step.key);

          return (
            <motion.button
              key={step.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              onClick={() => isClickable && goToStep(step.key)}
              disabled={!isClickable}
              className={`group text-left p-6 rounded-xl transition-all duration-300 ${
                status === 'current'
                  ? 'bg-black text-white shadow-lg'
                  : status === 'completed'
                  ? 'bg-gray-50 hover:bg-gray-100 text-black'
                  : 'bg-gray-50 text-gray-400'
              } ${isClickable ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed'}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  status === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : status === 'current'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs font-medium uppercase tracking-wide ${
                      status === 'current' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      Step {index + 1}
                    </span>
                    {status === 'completed' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <h3 className={`font-medium text-base mb-1 ${
                    status === 'current' ? 'text-white' : status === 'completed' ? 'text-black' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${
                    status === 'current' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  ), [currentStep, getStepStatus, canProceedToStep, goToStep]);

  // Step Components defined as memoized components
  const PlaylistStep = React.memo(({
    playlistUrl,
    onPlaylistUrlChange,
    onFetchVideos,
    isFetching,
    validateUrl
  }: {
    playlistUrl: string;
    onPlaylistUrlChange: (url: string) => void;
    onFetchVideos: () => void;
    isFetching: boolean;
    validateUrl: (url: string) => { isValid: boolean; error?: string };
  }) => {
    const [urlError, setUrlError] = useState<string>('');

    const handleUrlChange = (url: string) => {
      onPlaylistUrlChange(url);
      setUrlError('');

      // Real-time validation feedback
      if (url.trim()) {
        const validation = validateUrl(url);
        if (!validation.isValid) {
          setUrlError(validation.error || 'Invalid URL format');
        }
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-8"
      >
        {/* Main Input Section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Youtube className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-light text-black title">Import YouTube Playlist</h2>
                <p className="text-gray-600 mt-1">Add your playlist URL to get started</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playlistUrl" className="text-base font-medium text-black">
                  YouTube Playlist URL
                </Label>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      id="playlistUrl"
                      placeholder="https://youtube.com/playlist?list=..."
                      value={playlistUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className={`text-lg py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                        urlError
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-black hover:border-gray-300'
                      }`}
                    />
                    {urlError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 mt-2"
                      >
                        {urlError}
                      </motion.p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      handleFetchPlaylistVideos();
                      if (courseData.playlistUrl.trim() && !urlError) {
                        setTimeout(() => setCurrentStep('videos'), 3000);
                      }
                    }}
                    disabled={isFetchingVideos || !courseData.playlistUrl.trim() || !!urlError}
                    className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-medium transition-all duration-200 hover:shadow-lg"
                  >
                    {isFetchingVideos ? (
                      <div className="flex items-center">
                        <InfinityLoader size={20} className="mr-2" />
                        Importing...
                      </div>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Import Videos
                      </>
                    )}
                  </Button>
                </div>

                {/* Debug button */}
                <Button
                  onClick={() => {
                    const testUrl = "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi";
                    console.log('Testing with hardcoded URL via backend:', testUrl);
                    handleInputChange('playlistUrl', testUrl);
                    setTimeout(() => handleFetchPlaylistVideos(), 100);
                  }}
                  variant="outline"
                  className="mt-2 text-sm"
                >
                  Test with 3Blue1Brown (Backend)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isFetchingVideos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-100 rounded-2xl p-12 text-center"
          >
            <InfinityLoader size={48} className="mx-auto mb-4" />
            <h3 className="text-xl font-light text-black title mb-2">Importing your playlist</h3>
            <p className="text-gray-600">Fetching all videos from your YouTube playlist...</p>
            <div className="mt-4 text-sm text-gray-500">
              This process will import all videos and generate AI quizzes
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {courseData.videos.length > 0 && !isFetchingVideos && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-8"
          >
            <div className="flex items-center space-x-4 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-xl font-medium text-green-800">
                  Successfully imported {courseData.videos.length} videos!
                </h3>
                <p className="text-green-700">Ready to proceed to the next step.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Guide Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How-to Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h4 className="text-lg font-medium text-blue-900 mb-4">How to get your playlist URL</h4>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full text-xs font-medium">
                  1
                </div>
                <span>Go to YouTube and open your playlist</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full text-xs font-medium">
                  2
                </div>
                <span>Copy the URL from your browser&apos;s address bar</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full text-xs font-medium">
                  3
                </div>
                <span>Make sure your playlist is Public or Unlisted</span>
              </div>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Supported URL formats</h4>
            <div className="space-y-2 text-xs text-gray-600 font-mono bg-white p-4 rounded-xl border">
              <div>• https://youtube.com/playlist?list=PLxxx...</div>
              <div>• https://youtube.com/watch?v=xxx&list=PLxxx...</div>
              <div>• https://youtu.be/xxx?list=PLxxx...</div>
              <div>• PLxxxxxxxxx (playlist ID only)</div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Privacy Requirements</p>
              <p>Your playlist must be set to <strong>Public</strong> or <strong>Unlisted</strong> visibility. Private playlists cannot be imported due to YouTube&apos;s API restrictions.</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  });

  const VideosStep = React.memo(() => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Video className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-black title">Review Your Videos</h2>
              <p className="text-gray-600 mt-1">
                {courseData.videos.length} videos imported{totalDuration > 0 ? ` • ${Math.round(totalDuration)} minutes total` : ''}
              </p>
            </div>
          </div>

          {/* Video List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {courseData.videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 w-24 h-16 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <PlayCircle className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-black truncate">{video.title}</h5>
                  <p className="text-sm text-gray-600 truncate mt-1">{video.description}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs text-gray-500">Lesson {index + 1}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVideo(video.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary and Action */}
        {courseData.videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-medium text-blue-900">Content ready for enhancement</h3>
                  <p className="text-blue-700">
                    {courseData.videos.length} videos{totalDuration > 0 ? ` • ${Math.round(totalDuration)} minutes total duration` : ''}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setCurrentStep('quizzes')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
              >
                Generate AI Quizzes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  });

  const QuizzesStep = React.memo(() => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-2xl">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-black title">Create Quizzes (Optional)</h2>
              <p className="text-gray-600 mt-1">
                Add interactive questions for your videos • Students can also generate AI quizzes after watching
              </p>
            </div>
          </div>

          {/* Quiz List */}
          <div className="space-y-6">
            {courseData.videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200"
              >
                {/* Video Header */}
                <div className="p-6 bg-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <PlayCircle className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-black">{video.title}</h4>
                        <p className="text-sm text-gray-600">
                          {video.quiz.length} questions • Lesson {index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCreatingQuizVideoId(video.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {video.quiz.length === 0 ? 'Create Quiz' : 'Replace Quiz'}
                      </Button>
                      {video.quiz.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingQuizVideoId(editingQuizVideoId === video.id ? null : video.id)}
                          className="rounded-xl"
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          {editingQuizVideoId === video.id ? 'Close Editor' : 'Edit Quiz'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quiz Editor */}
                {editingQuizVideoId === video.id && (
                  <div className="p-6 space-y-6">
                    {video.quiz.map((question, qIndex) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qIndex * 0.1 }}
                        className="bg-white rounded-2xl p-6 border border-gray-200"
                      >
                        <div className="space-y-4">
                          {/* Question */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Question {qIndex + 1}
                            </Label>
                            <Input
                              value={question.question}
                              onChange={(e) => {
                                const newQuiz = [...video.quiz];
                                newQuiz[qIndex] = { ...question, question: e.target.value };
                                updateQuiz(video.id, newQuiz);
                              }}
                              className="mt-2 text-base py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-purple-500"
                            />
                          </div>

                          {/* Options */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Answer Options</Label>
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center space-x-3">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newQuiz = [...video.quiz];
                                    newQuiz[qIndex].options[oIndex] = e.target.value;
                                    updateQuiz(video.id, newQuiz);
                                  }}
                                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-colors ${
                                    question.correctAnswer === oIndex
                                      ? 'border-green-300 bg-green-50 focus:border-green-500'
                                      : 'border-gray-200 focus:border-purple-500'
                                  }`}
                                />
                                <Button
                                  variant={question.correctAnswer === oIndex ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    const newQuiz = [...video.quiz];
                                    newQuiz[qIndex].correctAnswer = oIndex;
                                    updateQuiz(video.id, newQuiz);
                                  }}
                                  className={`px-4 py-2 rounded-xl transition-colors ${
                                    question.correctAnswer === oIndex
                                      ? 'bg-green-600 hover:bg-green-700 text-white'
                                      : 'border-gray-300 hover:border-green-500'
                                  }`}
                                >
                                  {question.correctAnswer === oIndex ? (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Correct
                                    </>
                                  ) : (
                                    'Mark Correct'
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Explanation */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Explanation</Label>
                            <Textarea
                              value={question.explanation}
                              onChange={(e) => {
                                const newQuiz = [...video.quiz];
                                newQuiz[qIndex] = { ...question, explanation: e.target.value };
                                updateQuiz(video.id, newQuiz);
                              }}
                              rows={3}
                              className="mt-2 py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 resize-none"
                              placeholder="Provide a helpful explanation for the correct answer..."
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-purple-50 border border-purple-200 rounded-2xl p-6"
          >
            <div className="text-center">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-purple-900 mb-2">Continue Adding Quizzes</h3>
              <p className="text-purple-700 text-sm mb-4">
                {courseData.videos.filter(v => v.quiz.length > 0).length} of {courseData.videos.length} videos have quizzes
              </p>
              <p className="text-xs text-purple-600">Keep editing questions above</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-6"
          >
            <div className="text-center">
              <Globe className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-green-900 mb-2">Ready to Publish</h3>
              <p className="text-green-700 text-sm mb-4">
                Students can generate AI quizzes after watching videos
              </p>
              <Button
                onClick={() => setCurrentStep('publish')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors text-sm"
              >
                Finalize Course
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Quiz Creator Modal - for creating new quizzes or replacing existing ones */}
        {creatingQuizVideoId && (
          <QuizCreator
            videoId={creatingQuizVideoId}
            videoTitle={courseData.videos.find(v => v.id === creatingQuizVideoId)?.title || 'Video'}
            existingQuiz={courseData.videos.find(v => v.id === creatingQuizVideoId)?.quiz || []}
            onSave={(questions) => {
              updateQuiz(creatingQuizVideoId, questions);
              setCreatingQuizVideoId(null);
            }}
            onCancel={() => setCreatingQuizVideoId(null)}
          />
        )}
      </motion.div>
    );
  });

  const PublishStep = React.memo(() => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-green-100 rounded-2xl">
              <Globe className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-black title">Publish Your Course</h2>
              <p className="text-gray-600 mt-1">
                Add final details and make your course available to students
              </p>
            </div>
          </div>

          {/* Form and Summary Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Details Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium text-black">
                    Course Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter an engaging course title..."
                    value={courseData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="text-lg py-4 px-4 rounded-xl border-2 border-gray-200 focus:border-green-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium text-black">
                    Course Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn and achieve..."
                    rows={5}
                    value={courseData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="py-4 px-4 rounded-xl border-2 border-gray-200 focus:border-green-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-black">Category</Label>
                    <Select value={courseData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="py-4 px-4 rounded-xl border-2 border-gray-200">
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium text-black">Difficulty Level</Label>
                    <Select value={courseData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger className="py-4 px-4 rounded-xl border-2 border-gray-200">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sticky top-6">
                <h4 className="text-lg font-medium text-black mb-6">Course Summary</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Videos</span>
                    <span className="font-medium text-black">{courseData.videos.length}</span>
                  </div>
                  {totalDuration > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium text-black">{Math.round(totalDuration)} min</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Quizzes</span>
                    <span className="font-medium text-black">
                      {courseData.videos.reduce((total, v) => total + v.quiz.length, 0)} questions
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Price</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Free
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-black mb-3">Features Included</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Interactive quizzes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>AI-powered summaries</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Live translation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Progress tracking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Publish Action */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-green-900 mb-2">Ready to go live?</h3>
            <p className="text-green-700 mb-6">
              Your course is complete and ready to help students learn and grow.
            </p>
            <Button
              onClick={handleSaveCourse}
              disabled={isLoading || !courseData.title || !courseData.description}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-2xl text-lg font-medium transition-all duration-200 hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <InfinityLoader size={20} className="mr-3" />
                  Publishing Course...
                </>
              ) : (
                <>
                  <Save className="mr-3 h-5 w-5" />
                  Publish Course
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  });

  const renderStepContent = () => {
    if (currentStep === 'playlist') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-8"
        >
          <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-2xl">
                  <Youtube className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-black title">Import YouTube Playlist</h2>
                  <p className="text-gray-600 mt-1">Add your playlist URL to get started</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playlistUrl" className="text-base font-medium text-black">
                    YouTube Playlist URL
                  </Label>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Input
                        id="playlistUrl"
                        placeholder="https://youtube.com/playlist?list=..."
                        value={courseData.playlistUrl}
                        onChange={(e) => handleInputChange('playlistUrl', e.target.value)}
                        className="text-lg py-4 px-4 rounded-xl border-2 transition-all duration-200 border-gray-200 focus:border-black hover:border-gray-300"
                      />
                    </div>
                    <Button
                      onClick={handleFetchPlaylistVideos}
                      disabled={isFetchingVideos || !courseData.playlistUrl.trim()}
                      className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-medium transition-all duration-200 hover:shadow-lg"
                    >
                      {isFetchingVideos ? (
                        <div className="flex items-center">
                          <InfinityLoader size={20} className="mr-2" />
                          Importing...
                        </div>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Import Videos
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isFetchingVideos && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-100 rounded-2xl p-12 text-center"
            >
              <InfinityLoader size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-light text-black title mb-2">Importing your playlist</h3>
              <p className="text-gray-600">Fetching all videos from your YouTube playlist...</p>
            </motion.div>
          )}

          {/* Success State */}
          {courseData.videos.length > 0 && !isFetchingVideos && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-8"
            >
              <div className="flex items-center space-x-4 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-medium text-green-800">
                    Successfully imported {courseData.videos.length} videos!
                  </h3>
                  <p className="text-green-700">Ready to proceed to the next step.</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      );
    }

    if (currentStep === 'publish') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-8"
        >
          <div className="bg-white border border-gray-100 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-green-100 rounded-2xl">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-light text-black title">Publish Your Course</h2>
                <p className="text-gray-600 mt-1">
                  Add final details and make your course available to students
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium text-black">
                  Course Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter an engaging course title..."
                  value={courseData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="text-lg py-4 px-4 rounded-xl border-2 border-gray-200 focus:border-green-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium text-black">
                  Course Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn and achieve..."
                  rows={5}
                  value={courseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="py-4 px-4 rounded-xl border-2 border-gray-200 focus:border-green-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-green-900 mb-2">Ready to go live?</h3>
              <p className="text-green-700 mb-6">
                Your course is complete and ready to help students learn and grow.
              </p>
              <Button
                onClick={handleSaveCourse}
                disabled={isLoading || !courseData.title || !courseData.description}
                className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-2xl text-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <InfinityLoader size={20} className="mr-3" />
                    Publishing Course...
                  </>
                ) : (
                  <>
                    <Save className="mr-3 h-5 w-5" />
                    Publish Course
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    if (currentStep === 'videos') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-8"
        >
          <div className="bg-white border border-gray-100 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Video className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-light text-black title">Review Your Videos</h2>
                <p className="text-gray-600 mt-1">
                  {courseData.videos.length} videos imported{totalDuration > 0 ? ` • ${Math.round(totalDuration)} minutes total` : ''}
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {courseData.videos.map((video, index) => (
                <div
                  key={video.id}
                  className="group flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-24 h-16 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <PlayCircle className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-black truncate">{video.title}</h5>
                    <p className="text-sm text-gray-600 truncate mt-1">{video.description}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-xs text-gray-500">Lesson {index + 1}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(video.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {courseData.videos.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-xl font-medium text-blue-900">Content ready for enhancement</h3>
                    <p className="text-blue-700">
                      {courseData.videos.length} videos{totalDuration > 0 ? ` • ${Math.round(totalDuration)} minutes total duration` : ''}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setCurrentStep('quizzes')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Add Quizzes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      );
    }

    if (currentStep === 'quizzes') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-8"
        >
          <div className="bg-white border border-gray-100 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-light text-black title">Create Quizzes (Optional)</h2>
                <p className="text-gray-600 mt-1">
                  Add interactive questions for your videos • Students can also generate AI quizzes after watching
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {courseData.videos.map((video, index) => (
                <div
                  key={video.id}
                  className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200"
                >
                  <div className="p-6 bg-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <PlayCircle className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-black">{video.title}</h4>
                          <p className="text-sm text-gray-600">
                            {video.quiz.length} questions • Lesson {index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setCreatingQuizVideoId(video.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {video.quiz.length === 0 ? 'Create Quiz' : 'Replace Quiz'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
              <div className="text-center">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-purple-900 mb-2">Continue Adding Quizzes</h3>
                <p className="text-purple-700 text-sm mb-4">
                  {courseData.videos.filter(v => v.quiz.length > 0).length} of {courseData.videos.length} videos have quizzes
                </p>
                <p className="text-xs text-purple-600">Click buttons above to create quizzes</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="text-center">
                <Globe className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-green-900 mb-2">Ready to Publish</h3>
                <p className="text-green-700 text-sm mb-4">
                  Students can generate AI quizzes after watching videos
                </p>
                <Button
                  onClick={() => setCurrentStep('publish')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors text-sm"
                >
                  Finalize Course
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {creatingQuizVideoId && (
            <QuizCreator
              videoId={creatingQuizVideoId}
              videoTitle={courseData.videos.find(v => v.id === creatingQuizVideoId)?.title || 'Video'}
              existingQuiz={courseData.videos.find(v => v.id === creatingQuizVideoId)?.quiz || []}
              onSave={(questions) => {
                updateQuiz(creatingQuizVideoId, questions);
                setCreatingQuizVideoId(null);
              }}
              onCancel={() => setCreatingQuizVideoId(null)}
            />
          )}
        </motion.div>
      );
    }

    return <div>Step not found</div>;
  };

  if (!hasPermission('courses.create')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need creator permissions to access this page.</p>
          </CardContent>
        </Card>
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
            <h1 className="text-6xl font-light tracking-tight text-black title">
              Create Course.
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-2xl leading-relaxed">
              Transform your YouTube playlist into an engaging course with interactive quizzes and AI-powered features.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Step Indicator - Clean Apple-like Progress */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {StepIndicator}
      </div>

      {/* Step Content */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        {renderStepContent()}
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 'playlist'}
            className="px-6 py-3 rounded-full border-gray-300 hover:border-black transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={currentStep === 'publish' || !canProceedToNextStep}
            className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-full transition-all duration-200"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
