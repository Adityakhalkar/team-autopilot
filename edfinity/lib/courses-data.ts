export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  tags: string[];
  rating: number;
  studentsEnrolled: number;
  lessons: number;
  lastUpdated: string;
  language: string;
  features: string[];
  isBestseller?: boolean;
  isNew?: boolean;
}

export const courseCategories = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Design',
  'Business',
  'Photography',
  'Music',
  'Language',
  'Marketing'
];

export const courseLevels = ['Beginner', 'Intermediate', 'Advanced'];

export const courseLanguages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese'];

export const dummyCourses: Course[] = [
  {
    id: '1',
    title: 'Complete React.js Developer Course 2024',
    description: 'Master React.js from scratch with hooks, context API, Redux, and modern development practices. Build real-world projects and deploy to production.',
    instructor: 'Sarah Johnson',
    instructorAvatar: '/avatars/sarah.jpg',
    thumbnail: '/course-thumbnails/react.jpg',
    price: 89.99,
    originalPrice: 149.99,
    duration: '42 hours',
    level: 'Intermediate',
    category: 'Web Development',
    tags: ['React', 'JavaScript', 'Frontend', 'Redux', 'Hooks'],
    rating: 4.8,
    studentsEnrolled: 12450,
    lessons: 156,
    lastUpdated: '2024-01-15',
    language: 'English',
    features: [
      'Lifetime access',
      'Mobile and desktop',
      'Certificate of completion',
      '30-day money-back guarantee'
    ],
    isBestseller: true
  },
  {
    id: '2',
    title: 'Machine Learning A-Z: Python & R in Data Science',
    description: 'Learn to create Machine Learning Algorithms from scratch using Python and R. Includes linear regression, clustering, and neural networks.',
    instructor: 'Dr. Michael Chen',
    instructorAvatar: '/avatars/michael.jpg',
    thumbnail: '/course-thumbnails/ml.jpg',
    price: 119.99,
    originalPrice: 199.99,
    duration: '64 hours',
    level: 'Intermediate',
    category: 'Machine Learning',
    tags: ['Python', 'Machine Learning', 'Data Science', 'AI', 'Neural Networks'],
    rating: 4.9,
    studentsEnrolled: 8920,
    lessons: 289,
    lastUpdated: '2024-02-20',
    language: 'English',
    features: [
      'Lifetime access',
      'Downloadable resources',
      'Certificate of completion',
      'Q&A support'
    ],
    isBestseller: true
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass: Adobe XD & Figma',
    description: 'Complete guide to user interface and user experience design. Learn design thinking, prototyping, and create stunning mobile and web designs.',
    instructor: 'Emma Rodriguez',
    instructorAvatar: '/avatars/emma.jpg',
    thumbnail: '/course-thumbnails/uiux.jpg',
    price: 79.99,
    duration: '28 hours',
    level: 'Beginner',
    category: 'Design',
    tags: ['UI/UX', 'Figma', 'Adobe XD', 'Design', 'Prototyping'],
    rating: 4.7,
    studentsEnrolled: 6780,
    lessons: 95,
    lastUpdated: '2024-03-10',
    language: 'English',
    features: [
      'Lifetime access',
      'Design templates included',
      'Certificate of completion',
      'Portfolio projects'
    ],
    isNew: true
  },
  {
    id: '4',
    title: 'iOS App Development with Swift 5',
    description: 'Build professional iOS apps from scratch using Swift 5 and Xcode. Learn to publish apps to the App Store and monetize your creations.',
    instructor: 'James Park',
    instructorAvatar: '/avatars/james.jpg',
    thumbnail: '/course-thumbnails/ios.jpg',
    price: 99.99,
    originalPrice: 159.99,
    duration: '38 hours',
    level: 'Intermediate',
    category: 'Mobile Development',
    tags: ['Swift', 'iOS', 'Mobile Development', 'App Store', 'Xcode'],
    rating: 4.6,
    studentsEnrolled: 4560,
    lessons: 142,
    lastUpdated: '2024-01-28',
    language: 'English',
    features: [
      'Lifetime access',
      'Source code included',
      'Certificate of completion',
      'App Store submission guide'
    ]
  },
  {
    id: '5',
    title: 'Complete Digital Marketing Course 2024',
    description: 'Master SEO, social media marketing, Google Ads, email marketing, and analytics. Become a certified digital marketing professional.',
    instructor: 'Lisa Thompson',
    instructorAvatar: '/avatars/lisa.jpg',
    thumbnail: '/course-thumbnails/marketing.jpg',
    price: 69.99,
    originalPrice: 129.99,
    duration: '35 hours',
    level: 'Beginner',
    category: 'Marketing',
    tags: ['SEO', 'Social Media', 'Google Ads', 'Email Marketing', 'Analytics'],
    rating: 4.5,
    studentsEnrolled: 9876,
    lessons: 178,
    lastUpdated: '2024-02-05',
    language: 'English',
    features: [
      'Lifetime access',
      'Marketing templates',
      'Certificate of completion',
      'Industry tools access'
    ],
    isBestseller: true
  },
  {
    id: '6',
    title: 'Photography Fundamentals: DSLR to Professional',
    description: 'Learn photography from basics to advanced techniques. Master composition, lighting, post-processing, and build a stunning portfolio.',
    instructor: 'Robert Williams',
    instructorAvatar: '/avatars/robert.jpg',
    thumbnail: '/course-thumbnails/photography.jpg',
    price: 59.99,
    duration: '25 hours',
    level: 'Beginner',
    category: 'Photography',
    tags: ['Photography', 'DSLR', 'Composition', 'Lightroom', 'Portfolio'],
    rating: 4.8,
    studentsEnrolled: 3245,
    lessons: 89,
    lastUpdated: '2024-03-15',
    language: 'English',
    features: [
      'Lifetime access',
      'RAW files for practice',
      'Certificate of completion',
      'Lightroom presets'
    ]
  }
];

// Helper functions
export function getUniqueCategories(): string[] {
  return [...new Set(dummyCourses.map(course => course.category))];
}

export function getUniqueTags(): string[] {
  const allTags = dummyCourses.flatMap(course => course.tags);
  return [...new Set(allTags)];
}

export function filterCourses(
  courses: Course[],
  filters: {
    category?: string;
    level?: string;
    priceRange?: [number, number];
    rating?: number;
    language?: string;
    search?: string;
  }
): Course[] {
  return courses.filter(course => {
    if (filters.category && course.category !== filters.category) return false;
    if (filters.level && course.level !== filters.level) return false;
    if (filters.priceRange && (course.price < filters.priceRange[0] || course.price > filters.priceRange[1])) return false;
    if (filters.rating && course.rating < filters.rating) return false;
    if (filters.language && course.language !== filters.language) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return course.title.toLowerCase().includes(searchLower) ||
             course.description.toLowerCase().includes(searchLower) ||
             course.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
             course.instructor.toLowerCase().includes(searchLower);
    }
    return true;
  });
}