'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Clock,
  Users,
  Star,
  Play,
  BookOpen,
  Globe,
  Brain,
  TrendingUp
} from 'lucide-react';

// Mock course data - in real app, this would come from your API
const mockCourses = [
  {
    id: 1,
    title: 'Advanced Mathematics for Engineers',
    description: 'Comprehensive course covering calculus, linear algebra, and differential equations with practical applications.',
    instructor: 'Dr. Sarah Johnson',
    instructorAvatar: '/api/placeholder/40/40',
    duration: '12 weeks',
    students: 2847,
    rating: 4.8,
    price: 'Free',
    level: 'Advanced',
    category: 'Mathematics',
    thumbnail: '/api/placeholder/300/200',
    features: ['Live Translation', 'AI Summaries', 'Interactive Exercises'],
    tags: ['calculus', 'engineering', 'mathematics'],
    videoCount: 24,
    lastUpdated: '2 days ago'
  },
  {
    id: 2,
    title: 'Physics Fundamentals with Global Collaboration',
    description: 'Learn physics principles while collaborating with students worldwide. Includes virtual lab experiments.',
    instructor: 'Prof. Michael Chen',
    instructorAvatar: '/api/placeholder/40/40',
    duration: '8 weeks',
    students: 1923,
    rating: 4.9,
    price: 'Free',
    level: 'Beginner',
    category: 'Physics',
    thumbnail: '/api/placeholder/300/200',
    features: ['Live Translation', 'Virtual Labs', 'Peer Collaboration'],
    tags: ['physics', 'collaboration', 'experiments'],
    videoCount: 18,
    lastUpdated: '1 week ago'
  },
  {
    id: 3,
    title: 'AI-Powered Programming Bootcamp',
    description: 'Modern programming with AI assistance. Learn Python, JavaScript, and AI integration techniques.',
    instructor: 'Emily Rodriguez',
    instructorAvatar: '/api/placeholder/40/40',
    duration: '16 weeks',
    students: 5234,
    rating: 4.7,
    price: 'Free',
    level: 'Intermediate',
    category: 'Programming',
    thumbnail: '/api/placeholder/300/200',
    features: ['AI Code Assistant', 'Live Coding', 'Project-Based'],
    tags: ['programming', 'ai', 'python', 'javascript'],
    videoCount: 42,
    lastUpdated: '3 days ago'
  },
  {
    id: 4,
    title: 'Global History Through Digital Storytelling',
    description: 'Explore world history through immersive digital narratives and collaborative research projects.',
    instructor: 'Dr. James Thompson',
    instructorAvatar: '/api/placeholder/40/40',
    duration: '10 weeks',
    students: 1456,
    rating: 4.6,
    price: 'Free',
    level: 'Intermediate',
    category: 'History',
    thumbnail: '/api/placeholder/300/200',
    features: ['Digital Storytelling', 'Research Tools', 'Cultural Exchange'],
    tags: ['history', 'storytelling', 'research'],
    videoCount: 28,
    lastUpdated: '5 days ago'
  },
  {
    id: 5,
    title: 'Business Strategy & Analytics',
    description: 'Data-driven business strategy with real-world case studies and performance analytics.',
    instructor: 'Lisa Chang',
    instructorAvatar: '/api/placeholder/40/40',
    duration: '14 weeks',
    students: 3891,
    rating: 4.8,
    price: 'Free',
    level: 'Advanced',
    category: 'Business',
    thumbnail: '/api/placeholder/300/200',
    features: ['Case Studies', 'Performance Analytics', 'Industry Insights'],
    tags: ['business', 'strategy', 'analytics'],
    videoCount: 35,
    lastUpdated: '1 day ago'
  },
  {
    id: 6,
    title: 'Creative Writing & Language Arts',
    description: 'Develop your writing skills with AI-powered feedback and collaborative peer review.',
    instructor: 'Maria Garcia',
    instructorAvatar: '/api/placeholder/40/40',
    duration: '6 weeks',
    students: 987,
    rating: 4.5,
    price: 'Free',
    level: 'Beginner',
    category: 'Arts',
    thumbnail: '/api/placeholder/300/200',
    features: ['AI Feedback', 'Peer Review', 'Writing Workshops'],
    tags: ['writing', 'creativity', 'language'],
    videoCount: 16,
    lastUpdated: '1 week ago'
  }
];

const categories = ['All', 'Mathematics', 'Physics', 'Programming', 'History', 'Business', 'Arts'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const sortOptions = ['Most Popular', 'Newest', 'Highest Rated', 'Duration'];

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('Most Popular');

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const CourseCard = ({ course, index }: { course: typeof mockCourses[0]; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-blue-600 opacity-50" />
          </div>
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90">
              {course.category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge
              variant={course.level === 'Beginner' ? 'default' :
                      course.level === 'Intermediate' ? 'secondary' : 'destructive'}
              className="bg-white/90 text-gray-800"
            >
              {course.level}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <Button
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Course
            </Button>
          </div>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center space-x-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span className="text-sm">{course.students.toLocaleString()}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{course.duration}</span>
            </div>
          </div>
          <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {course.instructor.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <span className="text-sm text-gray-600">{course.instructor}</span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {course.price}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {course.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-1">
                {feature === 'Live Translation' && <Globe className="h-3 w-3 text-blue-600" />}
                {feature === 'AI Summaries' && <Brain className="h-3 w-3 text-purple-600" />}
                {feature === 'Performance Analytics' && <TrendingUp className="h-3 w-3 text-green-600" />}
                <span className="text-xs text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{course.videoCount} videos</span>
            <span>Updated {course.lastUpdated}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
            <p className="text-gray-600 mt-1">
              Discover courses with AI-powered summaries, live translation, and global collaboration
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredCourses.length} courses found
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <CourseCard key={course.id} course={course} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or explore different categories.
          </p>
        </motion.div>
      )}
    </div>
  );
}