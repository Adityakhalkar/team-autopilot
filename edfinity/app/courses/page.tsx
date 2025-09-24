'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import InfinityLoader from '@/components/infinity-loader';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Search,
  Filter,
  X,
  ChevronDown,
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  creatorEmail: string;
  category?: string;
  level?: string;
  price?: string;
  tags?: string[];
  rating: number;
  enrollmentCount: number;
  videos: any[];
  createdAt: any;
  status: string;
  playlistUrl?: string;
  instructor?: {
    name: string;
    email: string;
  };
  thumbnail?: string;
  firstVideoThumbnail?: string;
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price' | 'newest'>('popular');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const courseLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const courseLanguages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese'];

  // Fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'courses'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const coursesData = querySnapshot.docs.map(doc => {
          const courseData = { id: doc.id, ...doc.data() } as Course;

          // Set first video thumbnail if videos exist
          if (courseData.videos && courseData.videos.length > 0) {
            courseData.firstVideoThumbnail = courseData.videos[0].thumbnail || courseData.thumbnail;
          } else {
            courseData.firstVideoThumbnail = courseData.thumbnail;
          }

          return courseData;
        });

        setCourses(coursesData);

        // Extract unique categories
        const uniqueCategories = [...new Set(coursesData.map(course => course.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories);

      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          course.creatorEmail.toLowerCase().includes(searchLower) ||
          (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchLower)));

        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory && course.category !== selectedCategory) {
        return false;
      }

      // Level filter
      if (selectedLevel && course.level !== selectedLevel) {
        return false;
      }

      // Rating filter
      if (minRating > 0 && course.rating < minRating) {
        return false;
      }

      return true;
    });

    // Sort courses
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        // Handle price as string, assume free courses have lower priority
        filtered.sort((a, b) => {
          const priceA = a.price === 'free' ? 0 : 1;
          const priceB = b.price === 'free' ? 0 : 1;
          return priceA - priceB;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
    }

    return filtered;
  }, [courses, searchQuery, selectedCategory, selectedLevel, selectedLanguage, priceRange, minRating, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedLanguage('');
    setPriceRange([0, 200]);
    setMinRating(0);
  };

  const CourseCard = ({ course }: { course: Course }) => {
    const formatDate = (timestamp: any) => {
      if (!timestamp) return 'Recently';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isNewCourse = () => {
      if (!course.createdAt) return false;
      const courseDate = course.createdAt.toDate ? course.createdAt.toDate() : new Date(course.createdAt.seconds * 1000);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return courseDate > oneMonthAgo;
    };

    return (
      <div className="group">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1">
          {/* Course Thumbnail */}
          <div className="relative h-56 bg-gray-50 overflow-hidden">
            {course.firstVideoThumbnail ? (
              <Image
                src={course.firstVideoThumbnail}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-gray-400 text-6xl font-light">
                  {course.category?.charAt(0) || course.title.charAt(0)}
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {course.enrollmentCount > 50 && (
                <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Popular
                </div>
              )}
              {isNewCourse() && (
                <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  New
                </div>
              )}
            </div>

            {/* View Course Button - Appears on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Link
                href={`/courses/${course.id}`}
                className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-colors text-sm font-medium flex items-center gap-2"
              >
                View Course
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Course Content */}
          <div className="p-6">
            {/* Category & Level */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-black font-medium">{course.category || 'General'}</span>
              {course.level && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {course.level}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-light tracking-tight text-black mb-2 line-clamp-2 title">
              {course.title}
            </h3>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.videos?.length || 0}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {course.price === 'free' ? (
                  <span className="text-2xl font-light tracking-tight text-black title">Free</span>
                ) : (
                  <span className="text-2xl font-light tracking-tight text-black title">Paid</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Apple-like Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="pt-16 pb-24"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-light tracking-tight text-black title">
              Discover Courses
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Learn new skills with expert-led courses. From beginner to advanced, find the perfect course for your journey.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="pt-4"
            >
              <p className="text-lg text-gray-500">
                {courses.length} courses available
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-2xl p-8 mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-xl px-6 py-4 pr-12 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price">Lowest Price</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-6 py-4 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              <Filter className="h-5 w-5 text-gray-700" />
              <span className="text-black font-medium">Filters</span>
              {(selectedCategory || selectedLevel || selectedLanguage || minRating > 0) && (
                <span className="bg-black text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                  {[selectedCategory, selectedLevel, selectedLanguage, minRating > 0].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-8 pt-8 border-t border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Category</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Level</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {courseLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Language</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="">All Languages</option>
                    {courseLanguages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Minimum Rating</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={3.5}>3.5+ Stars</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedLevel || selectedLanguage || minRating > 0 || searchQuery) && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors duration-200 text-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center space-x-3">
              <InfinityLoader size={24} />
              <span className="text-gray-600">Loading courses...</span>
            </div>
          </div>
        ) : filteredAndSortedCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-24"
          >
            <div className="text-gray-300 mb-6">
              <BookOpen className="h-20 w-20 mx-auto" />
            </div>
            <h3 className="text-2xl font-light text-black mb-3 title">No courses found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="bg-black text-white px-8 py-4 rounded-full hover:bg-gray-900 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + index * 0.05,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}