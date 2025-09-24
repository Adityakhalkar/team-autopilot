# Firebase Data Structure for EdFinity

## Overview
This document outlines the complete Firebase Firestore data structure needed for the EdFinity platform, including collections, subcollections, and required fields.

## Collections Structure

### 1. Users Collection (`users/{userId}`)
```javascript
{
  uid: string,                    // Firebase Auth UID
  email: string,                  // User email
  displayName: string | null,     // Display name
  photoURL: string | null,        // Profile photo URL
  role: 'user' | 'creator' | 'admin', // User role
  createdAt: timestamp,           // Account creation date
  lastLoginAt: timestamp,         // Last login timestamp
  profile: {
    bio: string,                  // User bio
    firstName: string,            // First name
    lastName: string,             // Last name
    timezone: string,             // User timezone
    language: string,             // Preferred language
    country: string               // User country
  },
  preferences: {
    emailNotifications: boolean,
    pushNotifications: boolean,
    courseUpdates: boolean,
    collaborationInvites: boolean,
    aiSummaries: boolean,
    weeklyReports: boolean,
    darkMode: boolean,
    compactMode: boolean,
    reducedMotion: boolean,
    fontSize: string
  },
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private',
    showEmail: boolean,
    allowCollaboration: boolean,
    shareAnalytics: boolean
  },
  stats: {
    coursesEnrolled: number,
    coursesCompleted: number,
    studyHours: number,
    collaborations: number,
    averagePerformance: number
  }
}
```

### 2. Courses Collection (`courses/{courseId}`)
```javascript
{
  id: string,                     // Auto-generated course ID
  title: string,                  // Course title
  description: string,            // Course description
  instructor: {
    uid: string,                  // Creator's UID
    name: string,                 // Creator's display name
    email: string,                // Creator's email
    photoURL: string | null       // Creator's photo
  },
  category: string,               // Course category
  level: 'beginner' | 'intermediate' | 'advanced',
  tags: string[],                 // Course tags
  price: 'free' | number,         // Course price
  thumbnail: string | null,       // Course thumbnail URL

  // YouTube Integration
  playlistUrl: string,            // Original YouTube playlist URL
  playlistId: string,             // Extracted YouTube playlist ID

  // Course Metadata
  duration: number,               // Total duration in minutes
  videoCount: number,             // Number of videos
  studentsEnrolled: number,       // Number of enrolled students
  rating: number,                 // Average rating
  totalRatings: number,           // Total number of ratings

  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp | null,

  // Status and Moderation
  status: 'draft' | 'published' | 'suspended',
  featured: boolean,
  copyrightClaims: number,

  // Analytics
  views: number,
  completions: number,

  // EdFinity Features
  features: {
    liveTranslation: boolean,
    aiSummaries: boolean,
    performanceAnalytics: boolean,
    collaboration: boolean
  }
}
```

### 3. Course Videos Subcollection (`courses/{courseId}/videos/{videoId}`)
```javascript
{
  id: string,                     // Video ID (YouTube video ID)
  title: string,                  // Video title
  description: string,            // Video description
  duration: string,               // Duration (e.g., "12:45")
  durationInSeconds: number,      // Duration in seconds
  thumbnail: string,              // Video thumbnail URL
  youtubeUrl: string,             // Full YouTube URL
  order: number,                  // Video order in course

  // AI Generated Content
  summary: string | null,         // AI-generated summary
  keyPoints: string[],            // Key learning points
  transcription: string | null,   // Video transcription

  // Analytics
  views: number,
  completions: number,
  averageWatchTime: number,

  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. Enrollments Collection (`enrollments/{enrollmentId}`)
```javascript
{
  id: string,                     // Auto-generated enrollment ID
  userId: string,                 // Student's UID
  courseId: string,               // Course ID
  instructorId: string,           // Instructor's UID

  // Progress Tracking
  progress: number,               // Overall progress percentage (0-100)
  completedVideos: string[],      // Array of completed video IDs
  lastWatchedVideo: string | null, // Last watched video ID
  lastWatchedAt: timestamp | null, // Last activity timestamp

  // Performance Data
  totalWatchTime: number,         // Total watch time in minutes
  performance: {
    averageScore: number,         // Average performance score
    quizzesTaken: number,         // Number of quizzes taken
    assignmentsCompleted: number  // Number of assignments completed
  },

  // Timestamps
  enrolledAt: timestamp,
  completedAt: timestamp | null,
  lastActivityAt: timestamp,

  // Status
  status: 'active' | 'completed' | 'dropped',

  // Ratings and Feedback
  rating: number | null,          // User's rating (1-5)
  review: string | null,          // User's review
  reviewedAt: timestamp | null
}
```

### 5. Collaboration Sessions Collection (`collaborationSessions/{sessionId}`)
```javascript
{
  id: string,                     // Auto-generated session ID
  title: string,                  // Session title
  description: string,            // Session description
  courseId: string | null,        // Associated course ID (optional)
  hostId: string,                 // Host user ID

  // Participants
  participants: {
    [userId]: {
      joinedAt: timestamp,
      role: 'host' | 'participant',
      permissions: {
        canSpeak: boolean,
        canShare: boolean,
        canRecord: boolean
      }
    }
  },

  // Session Settings
  maxParticipants: number,
  isPublic: boolean,
  requiresApproval: boolean,

  // Live Translation
  activeLanguages: string[],      // Active translation languages

  // Timestamps
  scheduledAt: timestamp,
  startedAt: timestamp | null,
  endedAt: timestamp | null,
  createdAt: timestamp,

  // Status
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
}
```

### 6. Messages Collection (`messages/{messageId}`)
```javascript
{
  id: string,                     // Auto-generated message ID
  senderId: string,               // Sender's UID
  recipientId: string | null,     // Recipient's UID (null for group messages)
  conversationId: string,         // Conversation/group ID

  // Message Content
  content: string,                // Message text
  type: 'text' | 'file' | 'image' | 'video',
  attachments: {
    url: string,
    name: string,
    size: number,
    type: string
  }[],

  // Translation
  originalLanguage: string,
  translations: {
    [languageCode]: string        // Translated versions
  },

  // Timestamps
  sentAt: timestamp,
  editedAt: timestamp | null,

  // Status
  status: 'sent' | 'delivered' | 'read',
  readBy: {
    [userId]: timestamp           // Read receipts
  }
}
```

### 7. Analytics Collection (`analytics/{userId}`)
```javascript
{
  userId: string,                 // User's UID

  // Learning Analytics
  totalStudyTime: number,         // Total study time in minutes
  coursesEnrolled: number,
  coursesCompleted: number,
  averagePerformance: number,

  // Monthly Breakdown
  monthlyStats: {
    [yearMonth]: {               // Format: "2024-01"
      studyTime: number,
      videosWatched: number,
      coursesStarted: number,
      coursesCompleted: number,
      collaborationSessions: number
    }
  },

  // Course-specific Analytics
  courseAnalytics: {
    [courseId]: {
      enrolledAt: timestamp,
      progress: number,
      timeSpent: number,
      performance: number,
      lastActivity: timestamp
    }
  },

  // Collaboration Analytics
  collaborationStats: {
    sessionsHosted: number,
    sessionsJoined: number,
    totalCollaborationTime: number,
    languagesUsed: string[]
  },

  updatedAt: timestamp
}
```

### 8. Admin Analytics Collection (`adminAnalytics/platform`)
```javascript
{
  // Platform Metrics
  totalUsers: number,
  totalCreators: number,
  totalCourses: number,
  totalRevenue: number,
  monthlyGrowth: number,
  activeUsers: number,

  // Content Metrics
  totalVideos: number,
  totalWatchTime: number,
  averageCourseRating: number,

  // Revenue Metrics
  monthlyRevenue: {
    [yearMonth]: {
      revenue: number,
      newUsers: number,
      coursesSold: number,
      creatorPayouts: number
    }
  },

  // Geographic Data
  usersByCountry: {
    [countryCode]: number
  },

  // Language Usage
  languageUsage: {
    [languageCode]: {
      users: number,
      translations: number
    }
  },

  updatedAt: timestamp
}
```

### 9. Copyright Claims Collection (`copyrightClaims/{claimId}`)
```javascript
{
  id: string,                     // Auto-generated claim ID
  courseId: string,               // Affected course ID
  videoId: string | null,         // Specific video ID (if applicable)
  creatorId: string,              // Course creator's UID

  // Claim Details
  claimant: string,               // Who filed the claim
  claimType: 'video' | 'audio' | 'content',
  description: string,            // Claim description
  evidence: string[],             // URLs to evidence

  // Severity and Status
  severity: 'low' | 'medium' | 'high',
  status: 'pending' | 'resolved' | 'disputed' | 'rejected',

  // Resolution
  resolution: string | null,      // Resolution notes
  resolvedBy: string | null,      // Admin who resolved
  resolvedAt: timestamp | null,

  // Timestamps
  filedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 10. Creator Payouts Collection (`creatorPayouts/{payoutId}`)
```javascript
{
  id: string,                     // Auto-generated payout ID
  creatorId: string,              // Creator's UID

  // Payout Details
  amount: number,                 // Payout amount
  currency: string,               // Currency code (USD, EUR, etc.)
  period: {
    start: timestamp,             // Payout period start
    end: timestamp                // Payout period end
  },

  // Course Breakdown
  courseEarnings: {
    [courseId]: {
      revenue: number,
      views: number,
      enrollments: number
    }
  },

  // Payment Information
  paymentMethod: 'bank' | 'paypal' | 'stripe',
  paymentDetails: {
    accountInfo: string,          // Encrypted payment info
    reference: string             // Transaction reference
  },

  // Status and Processing
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed',
  processedBy: string | null,     // Admin who processed

  // Timestamps
  createdAt: timestamp,
  approvedAt: timestamp | null,
  processedAt: timestamp | null,
  completedAt: timestamp | null,

  // Notes
  adminNotes: string | null,
  creatorNotes: string | null
}
```

## Security Rules Structure

### Basic Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Courses are publicly readable, but only creators can modify their own
    match /courses/{courseId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null &&
        (request.auth.uid == resource.data.instructor.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // Enrollments can be created by users, read by user and instructor
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == resource.data.instructorId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Admin-only collections
    match /adminAnalytics/{document} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /copyrightClaims/{claimId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /creatorPayouts/{payoutId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.creatorId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Indexes Required

### Composite Indexes
```javascript
// For course filtering and searching
courses: [category, level, createdAt DESC]
courses: [status, featured DESC, createdAt DESC]
courses: [instructor.uid, createdAt DESC]

// For enrollments
enrollments: [userId, status, enrolledAt DESC]
enrollments: [courseId, status, enrolledAt DESC]
enrollments: [instructorId, status, enrolledAt DESC]

// For analytics
analytics: [userId, updatedAt DESC]

// For messages
messages: [conversationId, sentAt DESC]
messages: [senderId, sentAt DESC]
messages: [recipientId, sentAt DESC]

// For collaboration sessions
collaborationSessions: [hostId, scheduledAt DESC]
collaborationSessions: [status, scheduledAt DESC]
collaborationSessions: [courseId, scheduledAt DESC]

// For admin analytics
copyrightClaims: [status, severity, filedAt DESC]
copyrightClaims: [courseId, status, filedAt DESC]
creatorPayouts: [creatorId, status, createdAt DESC]
creatorPayouts: [status, createdAt DESC]
```

## API Endpoints Needed for FastAPI Backend

### YouTube Integration
- `POST /api/youtube/playlist` - Extract videos from YouTube playlist
- `GET /api/youtube/video/{videoId}` - Get video metadata
- `POST /api/youtube/transcript/{videoId}` - Generate video transcript

### AI Services
- `POST /api/ai/summarize` - Generate video/course summaries
- `POST /api/ai/translate` - Real-time translation service
- `POST /api/ai/analyze` - Performance analysis

### Analytics
- `GET /api/analytics/user/{userId}` - User analytics
- `GET /api/analytics/course/{courseId}` - Course analytics
- `GET /api/analytics/admin` - Platform analytics

### Payment Processing
- `POST /api/payments/process` - Process creator payouts
- `GET /api/payments/status/{payoutId}` - Payment status

This data structure provides a comprehensive foundation for the EdFinity platform while maintaining flexibility for future enhancements.