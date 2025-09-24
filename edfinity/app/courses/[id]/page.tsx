'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  Volume2,
  Settings,
  Maximize,
  ThumbsUp,
  MessageCircle,
  FileText,
  Flag,
  Star,
  Users,
  Clock,
  BookOpen,
  ChevronRight,
  Download,
  Heart,
  Share2
} from 'lucide-react';
import { dummyCourses, Course } from '@/lib/courses-data';

// Mock video data for the course
const courseVideos = [
  {
    id: 1,
    title: 'Introduction to React Fundamentals',
    duration: '12:34',
    isCurrentlyPlaying: true,
    videoUrl: '/video/intro-react.mp4'
  },
  {
    id: 2,
    title: 'Setting up Development Environment',
    duration: '8:45',
    isCurrentlyPlaying: false,
    videoUrl: '/video/setup.mp4'
  },
  {
    id: 3,
    title: 'Understanding JSX and Components',
    duration: '15:20',
    isCurrentlyPlaying: false,
    videoUrl: '/video/jsx-components.mp4'
  },
  {
    id: 4,
    title: 'State Management with useState',
    duration: '18:15',
    isCurrentlyPlaying: false,
    videoUrl: '/video/usestate.mp4'
  },
  {
    id: 5,
    title: 'Props and Component Communication',
    duration: '14:32',
    isCurrentlyPlaying: false,
    videoUrl: '/video/props.mp4'
  }
];

// Mock translations data
const availableTranslations = [
  { language: 'English', code: 'en', isOriginal: true },
  { language: 'Spanish', code: 'es', isOriginal: false },
  { language: 'French', code: 'fr', isOriginal: false },
  { language: 'German', code: 'de', isOriginal: false },
  { language: 'Japanese', code: 'ja', isOriginal: false }
];

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(courseVideos[0]);
  const [selectedTranslation, setSelectedTranslation] = useState('en');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(1247);
  const [showComments, setShowComments] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const courseId = params.id as string;
    const foundCourse = dummyCourses.find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
    } else {
      router.push('/courses');
    }
  }, [params.id, router]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleVideoSelect = (video: typeof courseVideos[0]) => {
    setCurrentVideo(video);
    setIsPlaying(false);
  };

  const generateNotes = () => {
    alert('AI-generated notes feature coming soon!');
  };

  const flagCopyright = () => {
    alert('Copyright flag submitted. Our team will review this content.');
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  const shareContent = () => {
    navigator.share?.({
      title: course?.title,
      text: course?.description,
      url: window.location.href,
    }) || alert('Link copied to clipboard!');
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          {/* Main Video Section - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative group">
              {/* Video Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-full p-4 group-hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="h-12 w-12 text-white" />
                    ) : (
                      <Play className="h-12 w-12 text-white ml-1" />
                    )}
                  </button>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    <Volume2 className="h-5 w-5" />
                    <span className="text-sm">2:34 / {currentVideo.duration}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Settings className="h-5 w-5" />
                    <Maximize className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-2 bg-white/30 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>

            {/* Video Title and Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{currentVideo.title}</h1>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.studentsEnrolled.toLocaleString()} students</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{currentVideo.duration}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{course.rating}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSave}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isSaved ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                  <button
                    onClick={shareContent}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-200 mb-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount.toLocaleString()}</span>
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Comments</span>
                </button>
                <button
                  onClick={generateNotes}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Generate Notes</span>
                </button>
                <button
                  onClick={flagCopyright}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Flag className="h-4 w-4" />
                  <span>Flag Copyright</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>

              {/* Course Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Course</h3>
                <p className="text-gray-600 leading-relaxed">{course.description}</p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Instructor: {course.instructor}</span>
                  <span>•</span>
                  <span>Last updated: {course.lastUpdated}</span>
                  <span>•</span>
                  <span>{course.language}</span>
                </div>
              </div>
            </div>

            {/* Next Videos Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Up Next</h3>
              <div className="space-y-3">
                {courseVideos.filter(video => video.id !== currentVideo.id).slice(0, 3).map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="flex-shrink-0 w-40 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg relative">
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{video.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{video.duration}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Comments</h3>
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">JD</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">John Doe</p>
                        <p className="text-sm text-gray-600 mt-1">Great explanation! This really helped me understand React hooks better.</p>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>2 hours ago</span>
                        <button className="hover:text-blue-600">Reply</button>
                        <button className="hover:text-blue-600">Like</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">SM</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Sarah Miller</p>
                        <p className="text-sm text-gray-600 mt-1">Could you make a video about useEffect next? Thanks!</p>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>5 hours ago</span>
                        <button className="hover:text-blue-600">Reply</button>
                        <button className="hover:text-blue-600">Like</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Translations Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Translations</h3>
              <div className="space-y-3">
                {availableTranslations.map((translation) => (
                  <button
                    key={translation.code}
                    onClick={() => setSelectedTranslation(translation.code)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTranslation === translation.code
                        ? 'bg-blue-100 text-blue-600 border border-blue-200'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{translation.language}</span>
                      {translation.isOriginal && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          Original
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Translation Preview */}
              {selectedTranslation !== 'en' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">AI Translation Preview:</p>
                  <p className="text-sm text-gray-700 italic">
                    "In this lesson, we'll explore the fundamentals of React..."
                    {selectedTranslation === 'es' && ' - "En esta lección, exploraremos los fundamentos de React..."'}
                    {selectedTranslation === 'fr' && ' - "Dans cette leçon, nous explorerons les fondamentaux de React..."'}
                    {selectedTranslation === 'de' && ' - "In dieser Lektion werden wir die Grundlagen von React erforschen..."'}
                    {selectedTranslation === 'ja' && ' - "このレッスンでは、Reactの基礎を探求します..."'}
                  </p>
                </div>
              )}
            </div>

            {/* Course Playlist */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                <span className="text-sm text-gray-500">{courseVideos.length} videos</span>
              </div>
              <div className="space-y-2">
                {courseVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentVideo.id === video.id
                        ? 'bg-blue-100 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          currentVideo.id === video.id ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {video.title}
                        </p>
                        <p className="text-xs text-gray-500">{video.duration}</p>
                      </div>
                      {currentVideo.id === video.id && (
                        <div className="flex-shrink-0">
                          {isPlaying ? (
                            <Pause className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Play className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">{course.studentsEnrolled.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Language</span>
                  <span className="font-medium">{course.language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{course.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}