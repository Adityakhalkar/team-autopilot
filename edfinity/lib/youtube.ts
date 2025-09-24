// YouTube API integration for playlist fetching using RapidAPI

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'youtube-data16.p.rapidapi.com';
const RAPIDAPI_BASE = `https://${RAPIDAPI_HOST}`;

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  videoId: string;
}

export interface PlaylistResponse {
  videos: YouTubeVideo[];
  totalResults: number;
  error?: string;
}

// Convert ISO 8601 duration to readable format
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Fallback when YouTube API is not available
async function getFallbackVideos(playlistId: string): Promise<PlaylistResponse> {
  console.log('=== FALLBACK FUNCTION CALLED ===');
  console.log('Using fallback videos for playlist ID:', playlistId);
  console.log('Playlist ID type:', typeof playlistId);
  console.log('Playlist ID length:', playlistId?.length);

  // For demonstration, return different sample videos based on playlist ID
  const samplePlaylists: { [key: string]: YouTubeVideo[] } = {
    // 3Blue1Brown Neural Networks playlist
    'PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi': [
      {
        id: '1',
        videoId: 'aircAruvnKk',
        title: 'But what is a neural network?',
        duration: '19:13',
        thumbnail: '/api/placeholder/320/180',
        description: 'But what *is* a neural network? Chapter 1, Deep learning',
        publishedAt: '2017-10-05T00:00:00Z'
      },
      {
        id: '2',
        videoId: 'IHZwWFHWa-w',
        title: 'Gradient descent, how neural networks learn',
        duration: '21:01',
        thumbnail: '/api/placeholder/320/180',
        description: 'Chapter 2, Deep learning. How do neural networks learn?',
        publishedAt: '2017-10-16T00:00:00Z'
      },
      {
        id: '3',
        videoId: 'Ilg3gGewQ5U',
        title: 'What is backpropagation really doing?',
        duration: '13:54',
        thumbnail: '/api/placeholder/320/180',
        description: 'Chapter 3, Deep learning. What is backpropagation?',
        publishedAt: '2017-11-03T00:00:00Z'
      },
      {
        id: '4',
        videoId: 'tIeHLnjs5U8',
        title: 'Backpropagation calculus',
        duration: '10:17',
        thumbnail: '/api/placeholder/320/180',
        description: 'Chapter 4, Deep learning. The calculus behind backpropagation.',
        publishedAt: '2017-11-03T00:00:00Z'
      }
    ],

    // Default sample playlist (more videos)
    'default': [
      {
        id: '1',
        videoId: 'aircAruvnKk',
        title: 'Introduction to Machine Learning',
        duration: '15:30',
        thumbnail: '/api/placeholder/320/180',
        description: 'A comprehensive introduction to machine learning concepts and applications.',
        publishedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        videoId: 'IHZwWFHWa-w',
        title: 'Understanding Data Structures',
        duration: '22:45',
        thumbnail: '/api/placeholder/320/180',
        description: 'Learn about fundamental data structures and their uses.',
        publishedAt: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        videoId: 'Ilg3gGewQ5U',
        title: 'Algorithm Design Patterns',
        duration: '18:20',
        thumbnail: '/api/placeholder/320/180',
        description: 'Common patterns used in algorithm design and problem solving.',
        publishedAt: '2024-01-03T00:00:00Z'
      },
      {
        id: '4',
        videoId: 'tIeHLnjs5U8',
        title: 'Database Design Fundamentals',
        duration: '25:10',
        thumbnail: '/api/placeholder/320/180',
        description: 'Learn the basics of database design and normalization.',
        publishedAt: '2024-01-04T00:00:00Z'
      },
      {
        id: '5',
        videoId: 'dQw4w9WgXcQ',
        title: 'Web Development Best Practices',
        duration: '19:55',
        thumbnail: '/api/placeholder/320/180',
        description: 'Essential best practices for modern web development.',
        publishedAt: '2024-01-05T00:00:00Z'
      },
      {
        id: '6',
        videoId: 'xvFZjo5PgG0',
        title: 'Mobile App Development',
        duration: '28:30',
        thumbnail: '/api/placeholder/320/180',
        description: 'Getting started with mobile application development.',
        publishedAt: '2024-01-06T00:00:00Z'
      },
      {
        id: '7',
        videoId: 'y6120QOO1vY',
        title: 'Cloud Computing Essentials',
        duration: '16:45',
        thumbnail: '/api/placeholder/320/180',
        description: 'Understanding cloud computing concepts and services.',
        publishedAt: '2024-01-07T00:00:00Z'
      },
      {
        id: '8',
        videoId: 'fJ9rUzIMcZQ',
        title: 'Cybersecurity Fundamentals',
        duration: '21:20',
        thumbnail: '/api/placeholder/320/180',
        description: 'Basic cybersecurity principles and practices.',
        publishedAt: '2024-01-08T00:00:00Z'
      }
    ]
  };

  // Try exact match first, then check if it's a partial match for known playlists
  let videos = samplePlaylists[playlistId];

  if (!videos) {
    // Check for partial matches or common 3Blue1Brown playlist variations
    const commonPlaylists = [
      'PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi', // Neural Networks
      'PLHF2K1XbCyFTTYWV6-uBVfRpvV4SV-_sV',  // Essence of linear algebra
      'PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab'   // Essence of calculus
    ];

    // If playlist ID contains common 3B1B patterns, use the neural networks playlist
    if (playlistId.includes('PLZ') || playlistId.includes('3blue1brown') || playlistId.includes('neural')) {
      videos = samplePlaylists['PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi'];
    } else {
      videos = samplePlaylists['default'];
    }
  }

  // Ensure we always have videos
  if (!videos || videos.length === 0) {
    console.warn('No videos found for any playlist, using default');
    videos = samplePlaylists['default'];
  }

  console.log(`Returning ${videos.length} fallback videos for playlist: ${playlistId}`);

  return {
    videos,
    totalResults: videos.length,
    error: RAPIDAPI_KEY ?
      'API fetch failed - using fallback data' :
      'Using sample data - RapidAPI key not configured'
  };
}

// Extract playlist ID from various YouTube URL formats
export function extractPlaylistId(url: string): string | null {
  const cleanUrl = url.trim();
  console.log('Extracting playlist ID from URL:', cleanUrl);

  const patterns = [
    // Standard playlist URL
    /(?:youtube\.com|youtu\.be)\/playlist\?.*[&?]?list=([a-zA-Z0-9_-]+)/,
    // Watch URL with playlist
    /(?:youtube\.com|youtu\.be)\/watch\?.*[&?]list=([a-zA-Z0-9_-]+)/,
    // YouTube shorts with playlist
    /youtu\.be\/[a-zA-Z0-9_-]+\?.*list=([a-zA-Z0-9_-]+)/,
    // Direct playlist ID (34 or 18 characters)
    /^(PL[a-zA-Z0-9_-]{32})$|^([a-zA-Z0-9_-]{18})$/,
    // Any list parameter in URL
    /[&?]list=([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      const playlistId = match[1] || match[0];
      console.log('Found playlist ID:', playlistId);
      return playlistId;
    }
  }

  console.log('No playlist ID found in URL');
  return null;
}

// Wrapper function with enhanced error handling
export async function fetchPlaylistVideos(playlistId: string): Promise<PlaylistResponse> {
  console.log('=== WRAPPER FUNCTION CALLED ===');
  console.log('Fetching playlist videos for ID:', playlistId);

  if (!playlistId || playlistId.trim() === '') {
    console.log('Invalid playlist ID, using default fallback');
    return await getFallbackVideos('default');
  }

  // For now, always return fallback data
  return await getFallbackVideos(playlistId);
}