'use client';

import { useState } from 'react';
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
import {
  Youtube,
  Plus,
  Trash2,
  Save,
  Eye,
  AlertTriangle,
  CheckCircle,
  Link,
  Video,
  Clock,
  Globe,
  Brain
} from 'lucide-react';

interface VideoData {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
}

interface CourseData {
  title: string;
  description: string;
  category: string;
  level: string;
  price: string;
  tags: string[];
  playlistUrl: string;
  videos: VideoData[];
}

export default function CreateCoursePage() {
  const { hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

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

  const handleInputChange = (field: keyof CourseData, value: string) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !courseData.tags.includes(currentTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const extractPlaylistId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*[?&]list=|youtu\.be\/.*[?&]list=)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fetchPlaylistVideos = async () => {
    if (!courseData.playlistUrl.trim()) return;

    setIsFetchingVideos(true);
    try {
      const playlistId = extractPlaylistId(courseData.playlistUrl);
      if (!playlistId) {
        alert('Invalid YouTube playlist URL');
        return;
      }

      // Mock YouTube API response - In real app, you'd call YouTube Data API
      // For hackathon, we'll simulate the response
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockVideos: VideoData[] = [
        {
          id: '1',
          title: 'Introduction to the Course',
          duration: '5:30',
          thumbnail: '/api/placeholder/320/180',
          description: 'Welcome to our comprehensive course. In this video, we\'ll cover the basics and what you can expect.'
        },
        {
          id: '2',
          title: 'Chapter 1: Fundamentals',
          duration: '12:45',
          thumbnail: '/api/placeholder/320/180',
          description: 'Deep dive into the fundamental concepts that form the foundation of this subject.'
        },
        {
          id: '3',
          title: 'Chapter 2: Advanced Concepts',
          duration: '18:20',
          thumbnail: '/api/placeholder/320/180',
          description: 'Building on the fundamentals, we explore more complex ideas and their applications.'
        },
        {
          id: '4',
          title: 'Practical Examples & Case Studies',
          duration: '15:10',
          thumbnail: '/api/placeholder/320/180',
          description: 'Real-world examples and case studies to help you understand the practical applications.'
        },
        {
          id: '5',
          title: 'Final Project & Summary',
          duration: '9:55',
          thumbnail: '/api/placeholder/320/180',
          description: 'Wrap up with a final project and summary of everything we\'ve learned.'
        }
      ];

      setCourseData(prev => ({
        ...prev,
        videos: mockVideos
      }));

    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      alert('Error fetching playlist videos. Please try again.');
    } finally {
      setIsFetchingVideos(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!courseData.title.trim() || !courseData.description.trim() || courseData.videos.length === 0) {
      alert('Please fill in all required fields and add videos from a YouTube playlist.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Save to Firebase/API
      console.log('Saving course:', courseData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Course created successfully!');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalDuration = courseData.videos.reduce((total, video) => {
    const [minutes, seconds] = video.duration.split(':').map(Number);
    return total + minutes + (seconds / 60);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600 mt-1">
              Create an engaging course by importing videos from YouTube playlists
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleSaveCourse} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
{isLoading ? (
                <>
                  <InfinityLoader size={16} className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Course'
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Information */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Basic details about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter course title..."
                    value={courseData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn..."
                    rows={4}
                    value={courseData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={courseData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                    <Label>Level</Label>
                    <Select value={courseData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a tag..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {courseData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {courseData.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* YouTube Playlist Import */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Youtube className="mr-2 h-5 w-5 text-red-600" />
                  YouTube Playlist Import
                </CardTitle>
                <CardDescription>
                  Import videos from a YouTube playlist to create your course content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playlistUrl">YouTube Playlist URL *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="playlistUrl"
                      placeholder="https://youtube.com/playlist?list=..."
                      value={courseData.playlistUrl}
                      onChange={(e) => handleInputChange('playlistUrl', e.target.value)}
                    />
                    <Button
                      onClick={fetchPlaylistVideos}
                      disabled={isFetchingVideos || !courseData.playlistUrl.trim()}
                    >
                      {isFetchingVideos ? (
                        <div className="flex items-center">
                          <InfinityLoader size={16} className="mr-2" />
                          Loading...
                        </div>
                      ) : (
                        <>
                          <Link className="mr-2 h-4 w-4" />
                          Import
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {courseData.videos.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Imported Videos ({courseData.videos.length})</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {Math.round(totalDuration)} minutes total
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {courseData.videos.map((video, index) => (
                        <div key={video.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0 w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Video className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium truncate">{video.title}</h5>
                            <p className="text-sm text-gray-600 truncate">{video.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{video.duration}</Badge>
                              <span className="text-xs text-gray-500">Lesson {index + 1}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Course Preview & Features */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Course Features</CardTitle>
                <CardDescription>Powered by EdFinity's AI and collaboration tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Live Translation</h4>
                    <p className="text-sm text-gray-600">Real-time language support</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">AI Summaries</h4>
                    <p className="text-sm text-gray-600">Auto-generated video summaries</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Performance Analytics</h4>
                    <p className="text-sm text-gray-600">Track student progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Course Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium truncate ml-2">
                    {courseData.title || 'Untitled Course'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">
                    {courseData.category || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium capitalize">
                    {courseData.level || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Videos:</span>
                  <span className="font-medium">
                    {courseData.videos.length} videos
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {Math.round(totalDuration)} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Free
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}