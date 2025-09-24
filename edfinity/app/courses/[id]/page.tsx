'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
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
  ChevronDown,
  Sparkle,
  SparkleIcon,
  Sparkles,
  CheckCircle
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
  const { user } = useAuth();
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

  // Quiz generation state
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizError, setQuizError] = useState('');

  // Interactive quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Quiz completion tracking
  const [completedQuizVideos, setCompletedQuizVideos] = useState<string[]>([]);
  const [userQuizHistory, setUserQuizHistory] = useState<any[]>([]);

  // Track if course was already added to watchlist to prevent duplicates
  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(false);

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

        // Add course to user's watchlist if user is logged in
        if (user && !isAddedToWatchlist) {
          // Clean up any existing duplicates first
          await cleanupDuplicateWatchlistEntries();

          await addCourseToWatchlist(courseData);
          // Fetch user's quiz history to determine completed videos
          await fetchUserQuizHistory(courseData.id);
        }

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

  // Function to fetch user's quiz history and determine completed videos
  const fetchUserQuizHistory = async (courseId: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const quizResults = userData.quizResults || [];

        // Filter quiz results for current course
        const courseQuizResults = quizResults.filter((quiz: any) => quiz.courseId === courseId);
        setUserQuizHistory(courseQuizResults);

        // Get unique video IDs that have completed quizzes
        const completedVideoIds = [...new Set(courseQuizResults.map((quiz: any) => quiz.videoId))];
        setCompletedQuizVideos(completedVideoIds);

        console.log('Completed quiz videos:', completedVideoIds);
      }
    } catch (error) {
      console.error('Error fetching user quiz history:', error);
    }
  };

  // Function to check if a video has completed quiz
  const isVideoQuizCompleted = (videoId: string) => {
    return completedQuizVideos.includes(videoId);
  };

  // Function to clean up duplicate watchlist entries and recalculate progress
  const cleanupDuplicateWatchlistEntries = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const watchlist = userData.watchlist || [];
        const quizResults = userData.quizResults || [];

        // Remove duplicates based on courseId, keeping the most recent one
        const uniqueWatchlist = watchlist.reduce((acc: any[], current: any) => {
          const existingIndex = acc.findIndex(item => item.courseId === current.courseId);

          if (existingIndex === -1) {
            // First occurrence, add it with recalculated progress
            const courseQuizResults = quizResults.filter(
              (quiz: any) => quiz.courseId === current.courseId
            );
            const uniqueVideoIds = [...new Set(courseQuizResults.map((quiz: any) => quiz.videoId))];
            const completedQuizzes = uniqueVideoIds.length;
            const totalVideos = current.totalVideos || 0;
            const progress = totalVideos > 0 ? Math.round((completedQuizzes / totalVideos) * 100) : 0;

            acc.push({
              ...current,
              completedQuizzes: completedQuizzes,
              progress: progress,
              status: progress === 100 ? 'completed' : 'in_progress'
            });
          } else {
            // Duplicate found, keep the one with more recent lastAccessed time
            const existing = acc[existingIndex];
            const currentTime = new Date(current.lastAccessed || current.addedAt).getTime();
            const existingTime = new Date(existing.lastAccessed || existing.addedAt).getTime();

            if (currentTime > existingTime) {
              // Recalculate progress for the kept entry
              const courseQuizResults = quizResults.filter(
                (quiz: any) => quiz.courseId === current.courseId
              );
              const uniqueVideoIds = [...new Set(courseQuizResults.map((quiz: any) => quiz.videoId))];
              const completedQuizzes = uniqueVideoIds.length;
              const totalVideos = current.totalVideos || 0;
              const progress = totalVideos > 0 ? Math.round((completedQuizzes / totalVideos) * 100) : 0;

              acc[existingIndex] = {
                ...current,
                completedQuizzes: completedQuizzes,
                progress: progress,
                status: progress === 100 ? 'completed' : 'in_progress'
              };
            }
          }

          return acc;
        }, []);

        // Update if duplicates were found OR progress was recalculated
        const needsUpdate = uniqueWatchlist.length !== watchlist.length ||
          uniqueWatchlist.some((entry, index) => {
            const original = watchlist.find(item => item.courseId === entry.courseId);
            return original && (
              original.completedQuizzes !== entry.completedQuizzes ||
              original.progress !== entry.progress ||
              original.status !== entry.status
            );
          });

        if (needsUpdate) {
          await updateDoc(userDocRef, {
            watchlist: uniqueWatchlist
          });
          const duplicatesRemoved = watchlist.length - uniqueWatchlist.length;
          console.log(`Watchlist updated: ${duplicatesRemoved} duplicates removed, progress recalculated`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate watchlist entries:', error);
    }
  };

  // State to track video ended status
  const [videoEnded, setVideoEnded] = useState(false);

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
          },
          onStateChange: (event: any) => {
            // YouTube Player States:
            // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: video cued
            if (event.data === 0) {
              setVideoEnded(true);
              console.log('Video has ended');
            } else if (event.data === 1) {
              // Reset ended state when video starts playing again
              setVideoEnded(false);
            }
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

  // Auto-scroll through sentences with dynamic timing
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (isAutoScrolling && translationSentences.length > 0) {
      const currentSentence = translationSentences[currentSentenceIndex];
      const readingTime = calculateReadingTime(currentSentence, selectedLanguage);

      timeout = setTimeout(() => {
        setCurrentSentenceIndex(prev =>
          (prev + 1) % translationSentences.length
        );
      }, readingTime);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAutoScrolling, translationSentences, currentSentenceIndex, selectedLanguage]);

  // Split text into sentences with language-aware logic
  const splitIntoSentences = (text: string, languageCode: string = 'en'): string[] => {
    let sentences: string[] = [];

    // Language-specific sentence splitting patterns
    const patterns: { [key: string]: RegExp } = {
      // Western languages (period, exclamation, question mark)
      'en': /[.!?]+/,
      'es': /[.!?]+/,
      'fr': /[.!?]+/,
      'de': /[.!?]+/,
      'pt': /[.!?]+/,
      'it': /[.!?]+/,
      'nl': /[.!?]+/,
      'ru': /[.!?]+/,

      // Chinese (various punctuation marks)
      'zh': /[。！？；]/,

      // Japanese (period, question, exclamation marks)
      'ja': /[。！？]/,

      // Korean (period and question marks)
      'ko': /[.!?。]/,

      // Arabic (period, question, exclamation)
      'ar': /[.!?؟]/,

      // Hindi (devanagari full stop)
      'hi': /[।.!?]/
    };

    const pattern = patterns[languageCode] || patterns['en'];

    sentences = text
      .split(pattern)
      .map(sentence => sentence.trim())
      .filter(sentence => {
        // Adjust minimum length based on language (some languages are more compact)
        const minLength = ['zh', 'ja', 'ko'].includes(languageCode) ? 5 : 10;
        return sentence.length > minLength;
      })
      .slice(0, 8); // Limit to first 8 sentences for readability

    return sentences;
  };

  // Calculate reading pace based on sentence length and language
  const calculateReadingTime = (sentence: string, languageCode: string = 'en'): number => {
    // Average speaking rates (words per minute)
    const wpmByLanguage: { [key: string]: number } = {
      'en': 150, // English
      'es': 160, // Spanish (slightly faster)
      'fr': 140, // French
      'de': 130, // German (compound words, slower)
      'pt': 155, // Portuguese
      'it': 165, // Italian (faster)
      'ru': 135, // Russian
      'nl': 145, // Dutch
      'zh': 200, // Chinese (character-based, faster)
      'ja': 180, // Japanese (character-based)
      'ko': 170, // Korean (character-based)
      'ar': 140, // Arabic
      'hi': 150  // Hindi
    };

    const wpm = wpmByLanguage[languageCode] || 150;

    // Estimate word count (different for character-based languages)
    let wordCount: number;

    if (['zh', 'ja', 'ko'].includes(languageCode)) {
      // For character-based languages, estimate ~2-3 characters per "word"
      wordCount = Math.ceil(sentence.length / 2.5);
    } else {
      // For word-based languages, count actual words
      wordCount = sentence.split(/\s+/).length;
    }

    // Convert WPM to milliseconds per word, add base reading time
    const baseTime = 1500; // Minimum 1.5 seconds per sentence
    const calculatedTime = (wordCount / wpm) * 60 * 1000; // Convert to milliseconds

    // Return the longer of calculated time or base time, cap at 8 seconds
    return Math.min(Math.max(calculatedTime, baseTime), 8000);
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
    setVideoEnded(false);
    setShowQuiz(false);
    setQuizData(null);
    setQuizError('');
    // Reset quiz interaction state
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedAnswer('');
    setQuizCompleted(false);
    setFinalScore(0);
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
          const sentences = splitIntoSentences(translation.translated_text, languageCode);
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

        // Save notes to Firebase if user is logged in
        if (user) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const noteEntry = {
              courseId: params.id || '',
              videoId: currentVideo?.id || '',
              videoTitle: currentVideo?.title || 'Untitled Video',
              videoNumber: courseVideos.findIndex(v => v.id === currentVideo?.id) + 1,
              notesText: markdownText || '',
              summary: summary.summary_text || '',
              keyPoints: summary.key_points || [],
              createdAt: new Date().toISOString(),
              type: 'ai_generated_notes'
            };

            await updateDoc(userDocRef, {
              savedNotes: arrayUnion(noteEntry)
            });

            console.log('Notes saved to Firebase successfully');
          } catch (error) {
            console.error('Error saving notes to Firebase:', error);
          }
        }
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

      // Save sample notes to Firebase if user is logged in
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const noteEntry = {
            courseId: params.id,
            videoId: currentVideo?.id,
            videoTitle: currentVideo?.title,
            videoNumber: courseVideos.findIndex(v => v.id === currentVideo?.id) + 1,
            notesText: sampleNotes,
            summary: `Sample notes for ${currentVideo?.title}`,
            keyPoints: [
              'Neural networks mimic brain neurons',
              'Weights determine connection strength',
              'Training adjusts weights for better performance',
              'Backpropagation is key learning algorithm',
              'Deep networks have multiple hidden layers'
            ],
            createdAt: new Date().toISOString(),
            type: 'ai_generated_notes'
          };

          await updateDoc(userDocRef, {
            savedNotes: arrayUnion(noteEntry)
          });

          console.log('Sample notes saved to Firebase successfully');
        } catch (error) {
          console.error('Error saving sample notes to Firebase:', error);
        }
      }
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Quiz interaction functions
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    // Store the answer
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer
    }));

    // Check if this is the last question
    if (currentQuestionIndex === quizData.questions.length - 1) {
      // Calculate final score and complete quiz
      completeQuiz();
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
    }
  };

  const completeQuiz = async () => {
    if (!quizData || !user) return;

    // Calculate score
    const answers = { ...userAnswers, [currentQuestionIndex]: selectedAnswer };
    let correctAnswers = 0;

    quizData.questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / quizData.questions.length) * 100);
    setFinalScore(score);
    setQuizCompleted(true);

    // Store results in Firebase
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const quizResult = {
        courseId: params.id || '',
        videoNumber: courseVideos.findIndex(v => v.id === currentVideo?.id) + 1,
        videoId: currentVideo?.id || '',
        videoTitle: currentVideo?.title || 'Untitled Video',
        score: score || 0,
        totalQuestions: quizData?.questions?.length || 0,
        correctAnswers: correctAnswers || 0,
        answers: answers || {},
        completedAt: new Date().toISOString(),
        quizTitle: `${currentVideo?.title || 'Untitled Video'} - Quiz`
      };

      await updateDoc(userDocRef, {
        quizResults: arrayUnion(quizResult)
      });

      console.log('Quiz results saved successfully');

      // Update course progress after saving quiz results
      await updateCourseProgress(params.id as string, courseVideos.length);

      // Refresh completed videos list
      await fetchUserQuizHistory(params.id as string);
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedAnswer('');
    setQuizCompleted(false);
    setFinalScore(0);
  };

  // Add course to watchlist with progress tracking
  const addCourseToWatchlist = async (courseData: Course) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const existingWatchlist = userData.watchlist || [];
        const quizResults = userData.quizResults || [];

        // Check if course is already in watchlist
        const existingCourseIndex = existingWatchlist.findIndex(
          (item: any) => item.courseId === courseData.id
        );

        if (existingCourseIndex === -1) {
          // Calculate initial progress based on existing quiz results
          const courseQuizResults = quizResults.filter(
            (quiz: any) => quiz.courseId === courseData.id
          );
          const uniqueVideoIds = [...new Set(courseQuizResults.map((quiz: any) => quiz.videoId))];
          const completedQuizzes = uniqueVideoIds.length;
          const totalVideos = courseData.videos?.length || 0;
          const progress = totalVideos > 0 ? Math.round((completedQuizzes / totalVideos) * 100) : 0;

          // Add new course to watchlist using array replacement to prevent duplicates
          const watchlistEntry = {
            courseId: courseData.id || '',
            courseTitle: courseData.title || 'Untitled Course',
            courseDescription: courseData.description || '',
            instructor: courseData.instructor?.name || courseData.creatorEmail || 'Unknown Instructor',
            thumbnail: courseData.thumbnail || '',
            totalVideos: totalVideos,
            completedQuizzes: completedQuizzes,
            progress: progress,
            addedAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            status: progress === 100 ? 'completed' : 'in_progress'
          };

          // Use array replacement instead of arrayUnion to prevent duplicates
          const updatedWatchlist = [...existingWatchlist, watchlistEntry];

          await updateDoc(userDocRef, {
            watchlist: updatedWatchlist
          });

          console.log('Course added to watchlist');
          setIsAddedToWatchlist(true);
        } else {
          // Update last accessed time for existing course
          const updatedWatchlist = [...existingWatchlist];
          updatedWatchlist[existingCourseIndex] = {
            ...updatedWatchlist[existingCourseIndex],
            lastAccessed: new Date().toISOString()
          };

          await updateDoc(userDocRef, {
            watchlist: updatedWatchlist
          });

          console.log('Course watchlist updated');
          setIsAddedToWatchlist(true);
        }
      } else {
        // Create user document with initial watchlist if it doesn't exist
        const totalVideos = courseData.videos?.length || 0;
        const watchlistEntry = {
          courseId: courseData.id || '',
          courseTitle: courseData.title || 'Untitled Course',
          courseDescription: courseData.description || '',
          instructor: courseData.instructor?.name || courseData.creatorEmail || 'Unknown Instructor',
          thumbnail: courseData.thumbnail || '',
          totalVideos: totalVideos,
          completedQuizzes: 0,
          progress: 0,
          addedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          status: 'in_progress'
        };

        await updateDoc(userDocRef, {
          watchlist: [watchlistEntry],
          savedNotes: [],
          quizResults: []
        });

        console.log('User document created with course in watchlist');
        setIsAddedToWatchlist(true);
      }
    } catch (error) {
      console.error('Error adding course to watchlist:', error);
    }
  };

  // Update course progress when quiz is completed
  const updateCourseProgress = async (courseId: string, videoCount: number) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const existingWatchlist = userData.watchlist || [];
        const quizResults = userData.quizResults || [];

        // Find the course in watchlist
        const courseIndex = existingWatchlist.findIndex(
          (item: any) => item.courseId === courseId
        );

        if (courseIndex !== -1) {
          // Get all quiz results for this course
          const courseQuizResults = quizResults.filter(
            (quiz: any) => quiz.courseId === courseId
          );

          // Count unique videos with completed quizzes
          const uniqueVideoIds = [...new Set(courseQuizResults.map((quiz: any) => quiz.videoId))];
          const completedQuizzes = uniqueVideoIds.length;

          // Calculate progress percentage based on unique videos completed
          const progress = videoCount > 0 ? Math.round((completedQuizzes / videoCount) * 100) : 0;

          // Update watchlist entry
          const updatedWatchlist = [...existingWatchlist];
          updatedWatchlist[courseIndex] = {
            ...updatedWatchlist[courseIndex],
            completedQuizzes: completedQuizzes,
            progress: progress,
            status: progress === 100 ? 'completed' : 'in_progress',
            lastAccessed: new Date().toISOString()
          };

          await updateDoc(userDocRef, {
            watchlist: updatedWatchlist
          });

          console.log('Course progress updated:', progress + '%');
        }
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  };

  const generateQuiz = async () => {
    if (isGeneratingQuiz || !currentVideo?.url) return;

    setIsGeneratingQuiz(true);
    setQuizError('');

    try {
      const response = await fetch('http://localhost:8000/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_urls: [currentVideo.url],
          num_questions: 5,
          question_types: ['multiple_choice', 'true_false']
        })
      });

      if (!response.ok) {
        throw new Error('Quiz generation service unavailable');
      }

      const data = await response.json();

      if (data.success && data.quizzes && data.quizzes.length > 0) {
        const quiz = data.quizzes[0];
        setQuizData(quiz);
        setShowQuiz(true);
        setVideoEnded(false); // Close the completion overlay
      } else {
        throw new Error('No quiz received');
      }

    } catch (error) {
      console.error('Quiz generation error:', error);
      setQuizError('Quiz generation service unavailable.');

      // Fallback sample quiz
      const sampleQuiz = {
        video_url: currentVideo.url,
        video_title: currentVideo?.title || 'Current Video',
        questions: [
          {
            question: "What is the main topic discussed in this video?",
            question_type: "multiple_choice",
            options: [
              "A) Machine Learning Algorithms",
              "B) Neural Network Architecture",
              "C) Data Processing Techniques",
              "D) Programming Languages"
            ],
            correct_answer: "B) Neural Network Architecture",
            explanation: "The video primarily focuses on explaining neural network architecture and its fundamental concepts."
          },
          {
            question: "Neural networks are inspired by biological neurons in the human brain.",
            question_type: "true_false",
            options: ["True", "False"],
            correct_answer: "True",
            explanation: "Neural networks are indeed computational models inspired by biological neural networks found in animal brains."
          },
          {
            question: "Which component determines the strength of connections between neurons?",
            question_type: "multiple_choice",
            options: [
              "A) Activation Functions",
              "B) Weights",
              "C) Bias Terms",
              "D) Learning Rate"
            ],
            correct_answer: "B) Weights",
            explanation: "Weights determine the strength and influence of connections between neurons in a neural network."
          }
        ],
        transcript_length: 15420,
        generation_timestamp: new Date().toISOString()
      };

      setQuizData(sampleQuiz);
      setShowQuiz(true);
      setVideoEnded(false);
    } finally {
      setIsGeneratingQuiz(false);
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

                    {/* Video Ended Overlay */}
                    {videoEnded && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                          className="text-center text-white space-y-6 max-w-md"
                        >
                          <div className="text-5xl mb-4">✨</div>
                          <h3 className="text-2xl font-light tracking-tight">Video Completed!</h3>
                          <p className="text-white/70 text-lg font-light">Choose your next action:</p>
                          <div className="flex flex-col gap-3 mt-8">
                            <button
                              onClick={() => {
                                if (youtubePlayer && youtubePlayer.seekTo) {
                                  youtubePlayer.seekTo(0);
                                  youtubePlayer.playVideo();
                                }
                              }}
                              className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] border border-white/20 font-light text-lg"
                            >
                              Replay Video
                            </button>

                            <button
                              onClick={generateQuiz}
                              disabled={isGeneratingQuiz}
                              className={`px-6 py-3 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] border font-light text-lg ${
                                isGeneratingQuiz
                                  ? 'bg-black/40 text-white/60 cursor-not-allowed border-white/10'
                                  : 'bg-black text-white hover:bg-black/90 hover:-translate-y-0.5 border-white/20 hover:shadow-lg'
                              }`}
                            >
                              {isGeneratingQuiz ? (
                                <span className="flex items-center justify-center space-x-3">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/60"></div>
                                  <span>Generating Quiz...</span>
                                </span>
                              ) : (
                                <span className="flex items-center justify-center space-x-2">
                                  <SparkleIcon className="h-5 w-5 text-white" />
                                  <span>Generate Quiz</span>
                                </span>
                              )}
                            </button>

                            {courseVideos.length > 1 && currentVideo && (
                              <button
                                onClick={() => {
                                  const currentIndex = courseVideos.findIndex(v => v.id === currentVideo.id);
                                  const nextIndex = (currentIndex + 1) % courseVideos.length;
                                  handleVideoSelect(courseVideos[nextIndex]);
                                }}
                                className="bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] font-light text-lg shadow-lg"
                              >
                                Next Video →
                              </button>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Interactive Quiz Overlay */}
                    {showQuiz && quizData && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="absolute inset-0 bg-white rounded-2xl overflow-hidden z-50 flex flex-col"
                      >
                          {!quizCompleted ? (
                            <>
                              {/* Quiz Header */}
                              <div className="bg-black text-white p-4 flex items-center justify-between shrink-0">
                                <div>
                                  <h3 className="text-xl font-light tracking-tight title">AI Quiz</h3>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <p className="text-white/70 text-sm">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
                                    <div className="flex space-x-1">
                                      {quizData.questions.map((_: any, index: number) => (
                                        <div
                                          key={index}
                                          className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                                            index === currentQuestionIndex
                                              ? 'bg-white'
                                              : index < currentQuestionIndex
                                              ? 'bg-white/70'
                                              : 'bg-white/20'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setShowQuiz(false)}
                                  className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>

                              {/* Error message */}
                              {quizError && (
                                <div className="mx-4 mb-0 p-3 bg-orange-50 border border-orange-200 rounded-lg shrink-0">
                                  <p className="text-xs text-orange-800">Using sample content - {quizError}</p>
                                </div>
                              )}

                              {/* Current Question */}
                              <div className="flex-1 overflow-y-auto p-6">
                                <motion.div
                                  key={currentQuestionIndex}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                  className="space-y-6"
                                >
                                  {/* Question */}
                                  <div>
                                    <div className="flex items-center space-x-2 mb-4">
                                      <span className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                                        Q{currentQuestionIndex + 1}
                                      </span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {quizData.questions[currentQuestionIndex].question_type.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <h2 className="text-xl font-light text-black leading-relaxed tracking-tight mb-6">
                                      {quizData.questions[currentQuestionIndex].question}
                                    </h2>
                                  </div>

                                  {/* Answer Options */}
                                  <div className="space-y-3">
                                    {quizData.questions[currentQuestionIndex].options?.map((option: string, optionIndex: number) => (
                                      <motion.button
                                        key={optionIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: optionIndex * 0.1 }}
                                        onClick={() => handleAnswerSelect(option)}
                                        className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                                          selectedAnswer === option
                                            ? 'border-black bg-black/5 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            selectedAnswer === option
                                              ? 'border-black bg-black'
                                              : 'border-gray-300'
                                          }`}>
                                            {selectedAnswer === option && (
                                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                            )}
                                          </div>
                                          <span className="text-base font-light text-gray-900">{option}</span>
                                        </div>
                                      </motion.button>
                                    ))}
                                  </div>
                                </motion.div>
                              </div>

                              {/* Navigation */}
                              <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                                <div className="text-xs text-gray-500">
                                  {Object.keys(userAnswers).length + (selectedAnswer ? 1 : 0)} of {quizData.questions.length} answered
                                </div>
                                <button
                                  onClick={handleNextQuestion}
                                  disabled={!selectedAnswer}
                                  className={`px-6 py-2.5 rounded-lg font-light transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                                    selectedAnswer
                                      ? 'bg-black text-white hover:bg-gray-900 hover:-translate-y-0.5 shadow-md'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  {currentQuestionIndex === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                </button>
                              </div>
                            </>
                          ) : (
                            /* Quiz Completion Summary */
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                              className="text-center p-12"
                            >
                              <div className="mb-8">
                                <div className="text-6xl mb-6">
                                  {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👍' : '📚'}
                                </div>
                                <h2 className="text-4xl font-light text-black tracking-tight mb-4">
                                  {finalScore >= 80 ? 'Excellent Work!' : finalScore >= 60 ? 'Good Job!' : 'Keep Learning!'}
                                </h2>
                                <p className="text-xl text-gray-600 font-light">
                                  You scored {finalScore}% on this quiz
                                </p>
                              </div>

                              <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                                <div className="grid grid-cols-3 gap-6 text-center">
                                  <div>
                                    <div className="text-3xl font-light text-black mb-2">{finalScore}%</div>
                                    <div className="text-sm text-gray-600">Final Score</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-light text-black mb-2">
                                      {Math.round((finalScore / 100) * quizData.questions.length)}/{quizData.questions.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Correct Answers</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-light text-black mb-2">{quizData.questions.length}</div>
                                    <div className="text-sm text-gray-600">Total Questions</div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                      </motion.div>
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
                        <Sparkles className="h-5 w-5" />
                        <span>AI Notes</span>
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
                            <div>Sentence {currentSentenceIndex + 1} of {translationSentences.length}</div>
                            {isAutoScrolling && translationSentences.length > 0 && (
                              <div className="text-xs text-gray-400 mt-1">
                                {Math.round(calculateReadingTime(translationSentences[currentSentenceIndex], selectedLanguage) / 1000)}s pace
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setCurrentSentenceIndex(prev =>
                                prev > 0 ? prev - 1 : translationSentences.length - 1
                              )}
                              className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              title="Previous sentence"
                            >
                              ⏮️
                            </button>
                            <button
                              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                                isAutoScrolling
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {isAutoScrolling ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => setCurrentSentenceIndex(prev =>
                                (prev + 1) % translationSentences.length
                              )}
                              className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              title="Next sentence"
                            >
                              ⏭️
                            </button>
                          </div>
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
                      <div className="flex items-center space-x-2">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          currentVideo.id === video.id
                            ? 'bg-white text-black'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        {isVideoQuizCompleted(video.id) && (
                          <CheckCircle className={`w-4 h-4 ${
                            currentVideo.id === video.id ? 'text-green-300' : 'text-green-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isVideoQuizCompleted(video.id) ? 'text-green-600' : ''
                        } ${currentVideo.id === video.id && isVideoQuizCompleted(video.id) ? 'text-green-300' : ''}`}>
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