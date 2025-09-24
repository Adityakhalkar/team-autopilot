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

export async function fetchPlaylistVideos(playlistId: string): Promise<PlaylistResponse> {
  if (!RAPIDAPI_KEY) {
    console.warn('RapidAPI key not configured, using fallback method');
    return getFallbackVideos(playlistId);
  }

  try {
    // Fetch playlist items using RapidAPI
    const playlistResponse = await fetch(
      `${RAPIDAPI_BASE}/playlistItems?playlistId=${playlistId}`,
      {
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': RAPIDAPI_KEY
        }
      }
    );

    if (!playlistResponse.ok) {
      throw new Error(`RapidAPI Error: ${playlistResponse.status}`);
    }

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return {
        videos: [],
        totalResults: 0,
        error: 'No videos found in playlist'
      };
    }

    // Transform RapidAPI response to our format
    const videos: YouTubeVideo[] = playlistData.items.map((item: any, index: number) => ({
      id: (index + 1).toString(),
      videoId: item.contentDetails?.videoId || item.snippet?.resourceId?.videoId || '',
      title: item.snippet?.title || 'Untitled Video',
      description: item.snippet?.description || 'No description available.',
      thumbnail: item.snippet?.thumbnails?.medium?.url ||
                 item.snippet?.thumbnails?.high?.url ||
                 item.snippet?.thumbnails?.default?.url ||
                 '/api/placeholder/320/180',
      duration: item.contentDetails?.duration ? formatDuration(item.contentDetails.duration) : '0:00',
      publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
    }));

    return {
      videos,
      totalResults: videos.length
    };

  } catch (error) {
    console.error('RapidAPI Error:', error);
    return getFallbackVideos(playlistId);
  }
}

// Fallback when YouTube API is not available
async function getFallbackVideos(playlistId: string): Promise<PlaylistResponse> {
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

  const videos = samplePlaylists[playlistId] || samplePlaylists['default'];

  return {
    videos,
    totalResults: videos.length,
    error: RAPIDAPI_KEY ? undefined : 'Using sample data - RapidAPI key not configured'
  };
}

// Extract playlist ID from various YouTube URL formats
export function extractPlaylistId(url: string): string | null {
  const cleanUrl = url.trim();

  const patterns = [
    /(?:youtube\.com|youtu\.be)\/playlist\?list=([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com|youtu\.be)\/watch\?.*[&?]list=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/[a-zA-Z0-9_-]+\?.*list=([a-zA-Z0-9_-]+)/,
    /^[a-zA-Z0-9_-]{34}$|^[a-zA-Z0-9_-]{18}$/
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}