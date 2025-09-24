'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import InfinityLoader from '@/components/infinity-loader';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle,
  ProgressIcon as Progress,
  User,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Eye
} from 'lucide-react';

interface WatchlistItem {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  instructor: string;
  thumbnail?: string;
  totalVideos: number;
  completedQuizzes: number;
  progress: number;
  addedAt: string;
  lastAccessed: string;
  status: 'in_progress' | 'completed';
}

export default function WatchlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userWatchlist = userData.watchlist || [];
          // Sort by last accessed (most recent first)
          const sortedWatchlist = userWatchlist.sort((a: WatchlistItem, b: WatchlistItem) =>
            new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
          );
          setWatchlist(sortedWatchlist);
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  const filteredWatchlist = watchlist.filter(item => {
    const matchesSearch = item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'text-gray-400';
    if (progress < 30) return 'text-red-500';
    if (progress < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressBgColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <InfinityLoader size={24} />
          <span className="text-gray-600">Loading your watchlist...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400" />
          <p className="text-2xl font-light text-black title">Sign in to view your watchlist</p>
          <p className="text-gray-600">Track your course progress and continue learning.</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalCourses = watchlist.length;
  const completedCourses = watchlist.filter(item => item.status === 'completed').length;
  const averageProgress = totalCourses > 0
    ? Math.round(watchlist.reduce((sum, item) => sum + item.progress, 0) / totalCourses)
    : 0;
  const totalQuizzes = watchlist.reduce((sum, item) => sum + item.completedQuizzes, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12"
        >
          <h1 className="text-6xl font-light tracking-tight text-black title mb-4">
            Your Watchlist
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Track your learning progress and continue where you left off
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="bg-black rounded-xl p-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-black">{totalCourses}</p>
                <p className="text-sm text-gray-600">Courses Added</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="bg-black rounded-xl p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-black">{completedCourses}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="bg-black rounded-xl p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-black">{averageProgress}%</p>
                <p className="text-sm text-gray-600">Avg Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="bg-black rounded-xl p-3">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-black">{totalQuizzes}</p>
                <p className="text-sm text-gray-600">Quizzes Completed</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'all'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({watchlist.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'in_progress'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              In Progress ({watchlist.filter(item => item.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                statusFilter === 'completed'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({completedCourses})
            </button>
          </div>
        </motion.div>

        {/* Watchlist Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {filteredWatchlist.length === 0 ? (
            <div className="text-center py-16">
              {watchlist.length === 0 ? (
                <>
                  <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-xl font-light text-gray-600 mb-2">No courses in your watchlist yet</p>
                  <p className="text-gray-500 mb-6">Start browsing courses to automatically add them to your watchlist!</p>
                  <button
                    onClick={() => router.push('/courses')}
                    className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-colors duration-200"
                  >
                    Browse Courses
                  </button>
                </>
              ) : (
                <>
                  <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-xl font-light text-gray-600 mb-2">No courses match your search</p>
                  <p className="text-gray-500">Try adjusting your search terms or filters.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredWatchlist.map((item, index) => (
                <motion.div
                  key={`${item.courseId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/courses/${item.courseId}`)}
                >
                  <div className="flex items-start space-x-6">
                    {/* Thumbnail */}
                    <div className="w-24 h-16 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.courseTitle}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-light text-black title mb-1">
                            {item.courseTitle}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">by {item.instructor}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Last accessed {new Date(item.lastAccessed).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status === 'completed' ? 'Completed' : 'In Progress'}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            {item.completedQuizzes} of {item.totalVideos} quizzes completed
                          </span>
                          <span className={`text-sm font-medium ${getProgressColor(item.progress)}`}>
                            {item.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(item.progress)}`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Course Description */}
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.courseDescription}
                      </p>
                    </div>

                    {/* Continue Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/courses/${item.courseId}`);
                        }}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Continue</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}