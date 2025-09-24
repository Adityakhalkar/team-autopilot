'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InfinityLoader from '@/components/infinity-loader';
import {
  BookOpen,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  Globe,
  Brain,
  BarChart3,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    createdCourses: 0,
    totalStudents: 0,
    avgRating: 0
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Fetch user's created courses
        const createdCoursesQuery = query(
          collection(db, 'courses'),
          where('creatorId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const createdCoursesSnapshot = await getDocs(createdCoursesQuery);
        const createdCourses = createdCoursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch user's enrollments
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('userId', '==', user.uid)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const enrollments = enrollmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch recent published courses (for activities)
        const recentCoursesQuery = query(
          collection(db, 'courses'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentCoursesSnapshot = await getDocs(recentCoursesQuery);
        const recentCoursesData = recentCoursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate statistics
        const totalStudents = createdCourses.reduce((total, course) => total + (course.enrollmentCount || 0), 0);
        const avgRating = createdCourses.length > 0
          ? createdCourses.reduce((total, course) => total + (course.rating || 0), 0) / createdCourses.length
          : 0;

        setStats({
          enrolledCourses: enrollments.length,
          createdCourses: createdCourses.length,
          totalStudents,
          avgRating
        });

        setRecentCourses(recentCoursesData);
        setMyEnrollments(enrollments);
        setMyCourses(createdCourses);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const statsCards = [
    {
      title: "Enrolled Courses",
      value: stats.enrolledCourses.toString(),
      description: "Currently learning",
      icon: BookOpen,
      trend: stats.enrolledCourses > 0 ? `${stats.enrolledCourses} active` : "Start learning",
      color: "text-black"
    },
    {
      title: "Created Courses",
      value: stats.createdCourses.toString(),
      description: "Teaching others",
      icon: Users,
      trend: stats.createdCourses > 0 ? `${stats.totalStudents} total students` : "Create your first",
      color: "text-black"
    },
    {
      title: "Average Rating",
      value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A",
      description: "Course quality",
      icon: TrendingUp,
      trend: stats.avgRating > 0 ? `${stats.createdCourses} course(s)` : "No ratings yet",
      color: "text-black"
    },
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      description: "Learning from you",
      icon: Users,
      trend: stats.totalStudents > 0 ? "Across all courses" : "Build your audience",
      color: "text-black"
    }
  ];

  const recentActivities = recentCourses.slice(0, 4).map(course => ({
    type: "course",
    title: `New Course: ${course.title}`,
    time: course.createdAt ? new Date(course.createdAt.seconds * 1000).toLocaleDateString() : 'Recently',
    icon: BookOpen,
    creator: course.creatorEmail
  }));

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <InfinityLoader size={24} />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Welcome Section - Apple-like Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="pt-16 pb-24"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-light tracking-tight text-black title">
              Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Continue your learning journey with personalized insights and seamless collaboration.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="pt-8"
            >
              <Button
                onClick={() => window.location.href = '/courses'}
                className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-full text-base font-medium transition-all duration-200"
              >
                {stats.enrolledCourses > 0 ? 'Continue Learning' : 'Browse Courses'}
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section - Clean Apple-style */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4 + index * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="group"
            >
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <stat.icon className="h-8 w-8 text-black" />
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors duration-200" />
                </div>

                <div className="space-y-2">
                  <div className="text-4xl font-light tracking-tight text-black title">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    {stat.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.description}
                  </div>
                  <div className="text-sm text-black font-medium pt-2">
                    {stat.trend}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <activity.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time} • {activity.creator}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent course activity</p>
                    <p className="text-xs text-gray-400">Create or enroll in courses to see activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* My Created Courses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                My Created Courses
              </CardTitle>
              <CardDescription>{stats.createdCourses > 0 ? `Teaching ${stats.totalStudents} students` : 'Share your knowledge'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCourses.length > 0 ? (
                  myCourses.slice(0, 3).map((course, index) => (
                    <div key={index} className="border-l-2 border-purple-200 pl-4">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {course.createdAt ? new Date(course.createdAt.seconds * 1000).toLocaleDateString() : 'Recently created'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3" />
                            {course.enrollmentCount || 0} students
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="mr-1 h-3 w-3" />
                            {course.videos?.length || 0} videos
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No courses created yet</p>
                    <p className="text-xs text-gray-400">Create your first course to start teaching</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/dashboard/create-course'}
                      className="mt-3"
                    >
                      Create Course
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Enrolled Courses */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Learning Courses
              </CardTitle>
              <CardDescription>{stats.enrolledCourses > 0 ? 'Continue your learning journey' : 'Start learning today'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myEnrollments.length > 0 ? (
                  myEnrollments.slice(0, 3).map((enrollment, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="font-medium text-gray-900">Course Enrollment</h4>
                      <p className="text-sm text-gray-600">Course ID: {enrollment.courseId}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          Enrolled: {enrollment.enrolledAt ? new Date(enrollment.enrolledAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                        </p>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Learning
                          </span>
                          <div className="flex items-center text-gray-500">
                            <Clock className="mr-1 h-3 w-3" />
                            In Progress
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No enrolled courses yet</p>
                    <p className="text-xs text-gray-400">Browse courses to start learning</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/courses'}
                      className="mt-3"
                    >
                      Browse Courses
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="max-w-6xl mx-auto px-6 pb-16"
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your learning experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => window.location.href = '/courses'}
              >
                <BookOpen className="mr-3 h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Browse Courses</div>
                  <div className="text-sm text-gray-500">Discover new learning opportunities</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => window.location.href = '/dashboard/create-course'}
              >
                <Users className="mr-3 h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Create Course</div>
                  <div className="text-sm text-gray-500">Share your knowledge</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => window.location.href = '/dashboard/settings'}
              >
                <Brain className="mr-3 h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Settings</div>
                  <div className="text-sm text-gray-500">Customize your experience</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}