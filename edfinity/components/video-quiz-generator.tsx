'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, CheckCircle, X, RefreshCw } from 'lucide-react';
import InfinityLoader from '@/components/infinity-loader';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface VideoQuizGeneratorProps {
  videoUrl: string;
  videoTitle: string;
  onComplete?: (score: number, total: number) => void;
}

export default function VideoQuizGenerator({
  videoUrl,
  videoTitle,
  onComplete
}: VideoQuizGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_urls: [videoUrl],
          num_questions: 5,
          question_types: ['multiple_choice']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();

      if (data.success && data.quizzes?.length > 0) {
        const quiz = data.quizzes[0];
        setQuestions(quiz.questions || []);
        setQuizStarted(true);
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
      } else {
        throw new Error('No quiz generated');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(curr => curr + 1);
    } else {
      // Calculate score and show results
      const finalScore = questions.reduce((score, question, index) => {
        return score + (selectedAnswers[index] === question.correct_answer ? 1 : 0);
      }, 0);

      setScore(finalScore);
      setShowResults(true);
      onComplete?.(finalScore, questions.length);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (!quizStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Test Your Knowledge
          </CardTitle>
          <p className="text-gray-600">
            Generate an AI-powered quiz based on "{videoTitle}"
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={generateQuiz}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl"
          >
            {isGenerating ? (
              <>
                <InfinityLoader size={20} className="mr-2" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                Generate Quiz (5 Questions)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-600">
                {score}/{questions.length}
              </div>
              <div className="text-xl text-gray-600">
                {percentage}% Correct
              </div>
              <div className={`text-lg font-medium ${
                percentage >= 80 ? 'text-green-600' :
                percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {percentage >= 80 ? 'Excellent!' :
                 percentage >= 60 ? 'Good job!' : 'Keep learning!'}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={resetQuiz}
                className="px-6 py-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== undefined;

  return (
    <motion.div
      key={currentQuestion}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetQuiz}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">
            {currentQ?.question}
          </div>

          <div className="space-y-3">
            {currentQ?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedAnswers[currentQuestion] === option
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    selectedAnswers[currentQuestion] === option
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === option && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500">
              {Object.keys(selectedAnswers).length}/{questions.length} answered
            </div>
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}