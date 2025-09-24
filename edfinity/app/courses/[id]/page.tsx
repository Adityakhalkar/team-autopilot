'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import InfinityLoader from '@/components/infinity-loader';
import ReactMarkdown from 'react-markdown';
import {
  ThumbsUp,
  FileText,
  Flag,
  Star,
  Users,
  Clock,
  BookOpen,
  ChevronDown
} from 'lucide-react';

// Translation line interface for synchronized display
interface TranslationLine {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  originalText: string;
  translatedText: string;
}

// Synchronized translation data
interface SynchronizedTranslation {
  language: string;
  lines: TranslationLine[];
}

// Firebase video data interface
interface VideoData {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  url: string;
  creatorQuiz?: unknown[];
}

// Course interface
interface Course {
  id: string;
  title: string;
  description: string;
  instructor?: {
    name: string;
    email: string;
    uid: string;
  };
  creatorEmail: string;
  category?: string;
  level?: string;
  price?: string;
  rating: number;
  enrollmentCount: number;
  videos: VideoData[];
  createdAt: { _methodName: string } | Date;
  status: string;
  playlistUrl?: string;
  thumbnail?: string;
  duration?: string;
}

// Video interface - matches Firebase data structure
interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  url: string; // Changed from youtubeUrl to match Firebase
  order?: number;
  summary?: string;
  keyPoints?: string[];
  transcription?: string;
  creatorQuiz?: unknown[]; // Added to match Firebase data
}

// Available languages for translation
const availableLanguages = [
  { code: 'en', name: 'English', isOriginal: true },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Dutch' }
];

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [courseVideos, setCourseVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  // Translation state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translationText, setTranslationText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');

  // Synchronized translation state
  const [synchronizedTranslation, setSynchronizedTranslation] = useState<SynchronizedTranslation | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [showTranslationOverlay, setShowTranslationOverlay] = useState(false);

  // Auto-scroll translation state
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [translationSentences, setTranslationSentences] = useState<string[]>([]);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Notes state
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [notesError, setNotesError] = useState('');

  // Interaction state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseId = params.id as string;

        // Fetch course data
        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);

        if (!courseDoc.exists()) {
          router.push('/courses');
          return;
        }

        const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
        setCourse(courseData);

        // Set initial likes count from course data
        setLikesCount(courseData.reviewCount || 0);

        // Use course videos array directly (no subcollection needed based on Firebase structure)
        if (courseData.videos && courseData.videos.length > 0) {
          const videos = courseData.videos.map((video: VideoData, index: number) => ({
            id: video.id || `video-${index}`,
            title: video.title || `Video ${index + 1}`,
            description: video.description || '',
            duration: video.duration || 'N/A',
            thumbnail: video.thumbnail || courseData.thumbnail || '',
            url: video.url || courseData.playlistUrl || '', // Use 'url' field from Firebase
            order: index,
            creatorQuiz: video.creatorQuiz || []
          })) as Video[];

          setCourseVideos(videos);
          setCurrentVideo(videos[0]);
        } else {
          // If no videos in the course, create empty state
          setCourseVideos([]);
          setCurrentVideo(null);
        }

      } catch (error) {
        console.error('Error fetching course data:', error);
        router.push('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [params.id, router]);

  // Update current line based on video time
  useEffect(() => {
    if (!synchronizedTranslation?.lines.length) return;

    const currentLineIdx = synchronizedTranslation.lines.findIndex(
      (line, index) => {
        const isCurrentLine = currentVideoTime >= line.startTime && currentVideoTime <= line.endTime;
        const isNextLine = index > 0 && currentVideoTime < line.startTime &&
          currentVideoTime >= synchronizedTranslation.lines[index - 1].endTime;
        return isCurrentLine || (isNextLine && index === currentLineIndex + 1);
      }
    );

    if (currentLineIdx !== -1 && currentLineIdx !== currentLineIndex) {
      setCurrentLineIndex(currentLineIdx);
    }
  }, [currentVideoTime, synchronizedTranslation, currentLineIndex]);

  // YouTube Player API integration and real-time tracking
  useEffect(() => {
    let timeInterval: NodeJS.Timeout | null = null;

    if (youtubePlayer && synchronizedTranslation) {
      timeInterval = setInterval(() => {
        try {
          if (youtubePlayer.getCurrentTime) {
            const currentTime = youtubePlayer.getCurrentTime();
            setCurrentVideoTime(currentTime);
          }
        } catch (error) {
          // Player not ready yet
        }
      }, 250); // Update every 250ms for smooth synchronization
    }

    return () => {
      if (timeInterval) clearInterval(timeInterval);
    };
  }, [youtubePlayer, synchronizedTranslation]);

  // Load YouTube Player API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadYouTubeAPI = () => {
      if (window.YT) {
        initializePlayer();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = initializePlayer;
    };

    const initializePlayer = () => {
      const videoId = getYouTubeId(currentVideo?.url || '');
      if (!videoId) return;

      const player = new window.YT.Player('youtube-player', {
        videoId,
        events: {
          onReady: (event: any) => {
            setYoutubePlayer(event.target);
          }
        }
      });
    };

    if (currentVideo?.url) {
      loadYouTubeAPI();
    }

    return () => {
      if (youtubePlayer) {
        try {
          youtubePlayer.destroy();
        } catch (error) {
          // Player already destroyed
        }
      }
    };
  }, [currentVideo?.url]);

  // Auto-scroll through sentences
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isAutoScrolling && translationSentences.length > 0) {
      interval = setInterval(() => {
        setCurrentSentenceIndex(prev =>
          (prev + 1) % translationSentences.length
        );
      }, 3000); // Change sentence every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoScrolling, translationSentences.length]);

  // Split text into sentences
  const splitIntoSentences = (text: string): string[] => {
    return text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10) // Filter out very short fragments
      .slice(0, 8); // Limit to first 8 sentences
  };

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    setShowNotes(false);
    setNotesText('');
    setTranslationText('');
    setSelectedLanguage('en');
    setSynchronizedTranslation(null);
    setCurrentLineIndex(0);
    setCurrentVideoTime(0);
    setShowTranslationOverlay(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);

    if (languageCode === 'en') {
      setTranslationText('');
      setTranslationError('');
      setSynchronizedTranslation(null);
      setCurrentLineIndex(0);
      return;
    }

    if (!currentVideo?.url) {
      setTranslationError('No video URL available for translation');
      return;
    }

    setIsTranslating(true);
    setTranslationError('');

    try {
      const response = await fetch('http://localhost:8000/translate/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_urls: [currentVideo.url],
          target_language: languageCode,
          include_timestamps: true
        })
      });

      if (!response.ok) {
        throw new Error('Translation service unavailable');
      }

      const data = await response.json();

      if (data.success && data.translations && data.translations.length > 0) {
        const translation = data.translations[0];

        // Check if we have timestamped data
        if (translation.timestamped_segments) {
          const synchronizedData: SynchronizedTranslation = {
            language: languageCode,
            lines: translation.timestamped_segments.map((segment: {
              start_time?: number;
              end_time?: number;
              original_text?: string;
              translated_text?: string;
            }, index: number) => ({
              id: `line-${index}`,
              startTime: segment.start_time || 0,
              endTime: segment.end_time || 0,
              originalText: segment.original_text || '',
              translatedText: segment.translated_text || ''
            }))
          };
          setSynchronizedTranslation(synchronizedData);
          setCurrentLineIndex(0);
          setCurrentVideoTime(0);
          setShowTranslationOverlay(true);
        } else {
          // Fallback to regular text translation
          setTranslationText(translation.translated_text);
          setSynchronizedTranslation(null);

          // Initialize sentence-based auto-scroll
          const sentences = splitIntoSentences(translation.translated_text);
          setTranslationSentences(sentences);
          setCurrentSentenceIndex(0);
          setIsAutoScrolling(true);
        }
      } else {
        throw new Error('No translation received');
      }

    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError('Translation service unavailable. Using sample data for demo.');

      // Fallback sample translations with timestamps
      const sampleSynchronizedTranslations: { [key: string]: SynchronizedTranslation } = {
        'es': {
          language: 'es',
          lines: [
            { id: 'line-0', startTime: 0, endTime: 5, originalText: 'But what is a neural network?', translatedText: '¿Pero qué es una red neuronal?' },
            { id: 'line-1', startTime: 5, endTime: 10, originalText: 'In this chapter, I give a quick overview', translatedText: 'En este capítulo, doy una visión rápida' },
            { id: 'line-2', startTime: 10, endTime: 15, originalText: 'of what neural networks are', translatedText: 'de lo que son las redes neuronales' },
            { id: 'line-3', startTime: 15, endTime: 20, originalText: 'what they&apos;re doing, and how they learn', translatedText: 'qué están haciendo y cómo aprenden' },
            { id: 'line-4', startTime: 20, endTime: 25, originalText: 'all without getting bogged down', translatedText: 'todo sin perderse en' },
            { id: 'line-5', startTime: 25, endTime: 30, originalText: 'in the mathematics', translatedText: 'las matemáticas' }
          ]
        },
        'fr': {
          language: 'fr',
          lines: [
            { id: 'line-0', startTime: 0, endTime: 5, originalText: 'But what is a neural network?', translatedText: 'Mais qu&apos;est-ce qu&apos;un réseau de neurones ?' },
            { id: 'line-1', startTime: 5, endTime: 10, originalText: 'In this chapter, I give a quick overview', translatedText: 'Dans ce chapitre, je donne un aperçu rapide' },
            { id: 'line-2', startTime: 10, endTime: 15, originalText: 'of what neural networks are', translatedText: 'de ce que sont les réseaux de neurones' },
            { id: 'line-3', startTime: 15, endTime: 20, originalText: 'what they&apos;re doing, and how they learn', translatedText: 'ce qu&apos;ils font et comment ils apprennent' },
            { id: 'line-4', startTime: 20, endTime: 25, originalText: 'all without getting bogged down', translatedText: 'tout sans s&apos;enliser dans' },
            { id: 'line-5', startTime: 25, endTime: 30, originalText: 'in the mathematics', translatedText: 'les mathématiques' }
          ]
        }
      };

      const sampleData = sampleSynchronizedTranslations[languageCode];
      console.log('Fallback sample data for', languageCode, ':', sampleData);
      if (sampleData) {
        setSynchronizedTranslation(sampleData);
        setCurrentLineIndex(0);
        setCurrentVideoTime(0);
        setShowTranslationOverlay(true);
      } else {
        setTranslationText('Sample translation not available for this language.');
        setSynchronizedTranslation(null);
        setShowTranslationOverlay(false);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const generateNotes = async () => {
    if (isGeneratingNotes || !currentVideo?.url) return;

    setIsGeneratingNotes(true);
    setNotesError('');

    try {
      const response = await fetch('http://localhost:8000/summary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_urls: [currentVideo.url],
          summary_type: 'notes',
          max_length: 500
        })
      });

      if (!response.ok) {
        throw new Error('Notes generation service unavailable');
      }

      const data = await response.json();

      if (data.success && data.summaries && data.summaries.length > 0) {
        const summary = data.summaries[0];
        // Look for mdtext field or fallback to summary_text
        const markdownText = summary.mdtext || summary.summary_text;
        setNotesText(markdownText);
        setShowNotes(true);
      } else {
        throw new Error('No notes received');
      }

    } catch (error) {
      console.error('Notes generation error:', error);
      setNotesError('Notes generation service unavailable.');

      // Fallback sample notes in markdown
      const sampleNotes = `# AI-Generated Notes: ${currentVideo?.title || 'Current Video'}

## Key Concepts

### Neural Networks Fundamentals
- **Definition**: Computational models inspired by biological neural networks
- **Structure**: Layers of interconnected nodes (neurons)
- **Purpose**: Process information and recognize patterns

### Core Components

#### 1. Neurons (Nodes)
- Basic processing units of the network
- Receive inputs, apply weights, and produce outputs
- Use activation functions to introduce non-linearity

#### 2. Weights and Connections
- Determine the strength of connections between neurons
- **Training process**: Adjusting weights to improve performance
- **Learning**: Occurs through weight modification

#### 3. Layers
- **Input Layer**: Receives initial data
- **Hidden Layers**: Process information (deep networks have multiple)
- **Output Layer**: Produces final results

### Learning Process

#### Backpropagation Algorithm
- Key mechanism for training neural networks
- Calculates gradients to optimize weights
- Works backwards from output to input layers

#### Gradient Descent
- Optimization technique to minimize errors
- **Iterative process**: Gradually improves network performance
- **Learning rate**: Controls speed of learning

### Applications
- Image recognition and computer vision
- Natural language processing
- Speech recognition
- Recommendation systems
- Medical diagnosis

### Important Notes
> Neural networks require large amounts of data and computational power for effective training.

**Next Steps**: Practice with simple neural network implementations to understand these concepts better.`;

      setNotesText(sampleNotes);
      setShowNotes(true);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const flagCopyright = () => {
    alert('Copyright flag submitted. Our team will review this content within 24 hours.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <InfinityLoader size={24} />
          <span className="text-gray-600">Loading course...</span>
        </div>
      </div>
    );
  }

  if (!course || !currentVideo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-light text-black title">Course not found</p>
          <p className="text-gray-600">This course may have been removed or doesn't exist.</p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  // Extract YouTube video ID from URL for embedding
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(currentVideo.url || '');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Side - Video Player and Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* YouTube Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="bg-black rounded-2xl overflow-hidden aspect-video relative group">
                {videoId ? (
                  <>
                    <iframe
                      id="youtube-player"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`}
                      title={currentVideo.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />

                    {/* Translation Overlay */}
                    {showTranslationOverlay && synchronizedTranslation && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                        <div className="flex flex-col items-center space-y-1">
                          {/* Current translation line */}
                          {synchronizedTranslation.lines[currentLineIndex] && (
                            <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg max-w-4xl">
                              <p className="text-white text-center text-base font-medium leading-relaxed">
                                {synchronizedTranslation.lines[currentLineIndex].translatedText}
                              </p>
                            </div>
                          )}

                          {/* Next line preview (optional) */}
                          {synchronizedTranslation.lines[currentLineIndex + 1] && (
                            <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded max-w-3xl">
                              <p className="text-white/70 text-center text-sm leading-relaxed">
                                {synchronizedTranslation.lines[currentLineIndex + 1].translatedText}
                              </p>
                            </div>
                          )}

                          {/* Translation controls */}
                          <div className="pointer-events-auto flex items-center space-x-3 mt-2">
                            <button
                              onClick={() => setShowTranslationOverlay(false)}
                              className="bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                            >
                              Hide Subtitles
                            </button>
                            <div className="bg-black/60 text-white/70 px-2 py-1 rounded text-xs">
                              {Math.floor(currentVideoTime / 60)}:{Math.floor(currentVideoTime % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white text-6xl font-light opacity-40 mb-4">
                        <BookOpen className="h-16 w-16 mx-auto" />
                      </div>
                      <p className="text-white/60">Video not available</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-4"
            >
              <h1 className="text-3xl font-light tracking-tight text-black title">
                {currentVideo.title}
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isLiked
                        ? 'bg-black text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likesCount.toLocaleString()}</span>
                  </button>

                  <button
                    onClick={generateNotes}
                    disabled={isGeneratingNotes}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isGeneratingNotes
                        ? 'bg-green-50 text-green-400 cursor-not-allowed'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {isGeneratingNotes ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5" />
                        <span>Notes</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={flagCopyright}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all duration-200"
                  >
                    <Flag className="h-5 w-5" />
                    <span>Flag</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Notes Section */}
            {showNotes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="bg-white border border-gray-100 rounded-2xl p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-light text-black title">AI-Generated Notes</h3>
                  {notesError && (
                    <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                      Using sample content
                    </span>
                  )}
                </div>

                <div className="prose prose-gray max-w-none">
                  <ReactMarkdown>{notesText}</ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* Course Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white border border-gray-100 rounded-2xl p-8"
            >
              <h3 className="text-xl font-light text-black mb-4 title">About This Course</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Instructor: {course.instructor?.name || course.creatorEmail}</span>
                <span>•</span>
                <span>Category: {course.category || 'General'}</span>
                <span>•</span>
                <span>Level: {course.level || 'All Levels'}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Translations and Course Content */}
          <div className="lg:col-span-1 space-y-6">

            {/* AI Translations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white border border-gray-100 rounded-2xl p-6"
            >
              <h3 className="text-lg font-light text-black mb-4 title">AI Translations</h3>

              {/* Language Selector */}
              <div className="relative mb-4">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={isTranslating}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black appearance-none"
                >
                  {availableLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} {lang.isOriginal ? '(Original)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Translation Status */}
              {selectedLanguage !== 'en' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  {isTranslating ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      <span className="text-gray-600">Loading translations...</span>
                    </div>
                  ) : synchronizedTranslation ? (
                    <div className="space-y-3">
                      {translationError && (
                        <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                          {translationError}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          <div className="font-medium">Synchronized Subtitles</div>
                          <div className="text-xs text-gray-500">{synchronizedTranslation.lines.length} lines available</div>
                        </div>

                        <button
                          onClick={() => setShowTranslationOverlay(!showTranslationOverlay)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            showTranslationOverlay
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          }`}
                        >
                          {showTranslationOverlay ? '👁️ Subtitles ON' : '👁️ Show Subtitles'}
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                        Current: Line {currentLineIndex + 1} • Time: {Math.floor(currentVideoTime / 60)}:{Math.floor(currentVideoTime % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ) : translationText ? (
                    <div>
                      {translationError && (
                        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                          {translationError}
                        </div>
                      )}

                      {/* Auto-scroll sentence display */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-gray-500">
                            Sentence {currentSentenceIndex + 1} of {translationSentences.length}
                          </div>
                          <button
                            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                              isAutoScrolling
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isAutoScrolling ? '⏸️ Pause' : '▶️ Auto-scroll'}
                          </button>
                        </div>

                        {translationSentences.length > 0 ? (
                          <div className="text-gray-700 text-sm leading-relaxed">
                            {/* Current sentence with emphasis */}
                            <p className="font-medium text-gray-900 mb-2">
                              {translationSentences[currentSentenceIndex]}
                            </p>

                            {/* Next few sentences in lighter text */}
                            <div className="space-y-1 text-gray-500 text-xs">
                              {translationSentences
                                .slice(currentSentenceIndex + 1, currentSentenceIndex + 3)
                                .map((sentence, index) => (
                                  <p key={index} className="opacity-70">
                                    {sentence}
                                  </p>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {translationText}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      Loading translation...
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Course Videos */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white border border-gray-100 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light text-black title">Course Content</h3>
                <span className="text-sm text-gray-500">{courseVideos.length} videos</span>
              </div>

              <div className="space-y-2">
                {courseVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentVideo.id === video.id
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-50 text-gray-900'
                    }`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        currentVideo.id === video.id
                          ? 'bg-white text-black'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {video.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}