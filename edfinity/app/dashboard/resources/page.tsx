'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import InfinityLoader from '@/components/infinity-loader';
import ReactMarkdown from 'react-markdown';
import {
  BookOpen,
  FileText,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Tag,
  Sparkles
} from 'lucide-react';

interface SavedNote {
  courseId: string;
  videoId: string;
  videoTitle: string;
  videoNumber: number;
  notesText: string;
  summary: string;
  keyPoints: string[];
  createdAt: string;
  type: 'ai_generated_notes';
}

interface QuizResult {
  courseId: string;
  videoNumber: number;
  videoId: string;
  videoTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: {[key: number]: string};
  completedAt: string;
  quizTitle: string;
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'quizzes'>('notes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);

  useEffect(() => {
    const fetchUserResources = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSavedNotes(userData.savedNotes || []);
          setQuizResults(userData.quizResults || []);
        }
      } catch (error) {
        console.error('Error fetching user resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserResources();
  }, [user]);

  const filteredNotes = savedNotes.filter(note =>
    note.videoTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.notesText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuizzes = quizResults.filter(quiz =>
    quiz.videoTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <InfinityLoader size={24} />
          <span className="text-gray-600">Loading your resources...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400" />
          <p className="text-2xl font-light text-black title">Sign in to access your resources</p>
          <p className="text-gray-600">Your AI-generated notes and quiz results will appear here.</p>
        </div>
      </div>
    );
  }

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
            Your Resources
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Access your AI-generated notes, quiz results, and learning progress
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-black rounded-xl p-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-black">{savedNotes.length}</p>
                <p className="text-sm text-gray-600">AI Notes Generated</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-black rounded-xl p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-black">{quizResults.length}</p>
                <p className="text-sm text-gray-600">Quizzes Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-black rounded-xl p-3">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-black">
                  {quizResults.length > 0 ? Math.round(quizResults.reduce((acc, quiz) => acc + quiz.score, 0) / quizResults.length) : 0}%
                </p>
                <p className="text-sm text-gray-600">Average Quiz Score</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'notes'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                AI Notes ({filteredNotes.length})
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'quizzes'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Quiz Results ({filteredQuizzes.length})
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {activeTab === 'notes' ? (
            <div className="space-y-6">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-16">
                  <Sparkles className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-xl font-light text-gray-600 mb-2">No notes yet</p>
                  <p className="text-gray-500">
                    {searchTerm ? 'No notes match your search.' : 'Start generating AI notes from your course videos!'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredNotes.map((note, index) => (
                    <motion.div
                      key={`${note.courseId}-${note.videoId}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-light text-black title mb-2">
                            {note.videoTitle}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Tag className="h-4 w-4" />
                              <span>Video {note.videoNumber}</span>
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedNote(note)}
                          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </div>

                      <div className="prose prose-gray prose-sm max-w-none line-clamp-3">
                        <ReactMarkdown>{note.summary || note.notesText.slice(0, 200) + '...'}</ReactMarkdown>
                      </div>

                      {note.keyPoints && note.keyPoints.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {note.keyPoints.slice(0, 3).map((point, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                            >
                              {point}
                            </span>
                          ))}
                          {note.keyPoints.length > 3 && (
                            <span className="text-gray-400 text-xs py-1">
                              +{note.keyPoints.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredQuizzes.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-xl font-light text-gray-600 mb-2">No quiz results yet</p>
                  <p className="text-gray-500">
                    {searchTerm ? 'No quiz results match your search.' : 'Complete some quizzes to see your progress!'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredQuizzes.map((quiz, index) => (
                    <motion.div
                      key={`${quiz.courseId}-${quiz.videoId}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-light text-black title mb-1">
                            {quiz.videoTitle}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(quiz.completedAt).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Tag className="h-4 w-4" />
                              <span>Video {quiz.videoNumber}</span>
                            </span>
                          </div>
                        </div>
                        <div className={`text-right ${
                          quiz.score >= 80 ? 'text-green-600' :
                          quiz.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          <div className="text-2xl font-light">{quiz.score}%</div>
                          <div className="text-xs text-gray-500">
                            {quiz.correctAnswers}/{quiz.totalQuestions} correct
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
          >
            <div className="bg-black text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-light title">{selectedNote.videoTitle}</h3>
                <p className="text-white/70 text-sm">
                  {new Date(selectedNote.createdAt).toLocaleDateString()} • Video {selectedNote.videoNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              <div className="prose prose-gray max-w-none">
                <ReactMarkdown>{selectedNote.notesText}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}