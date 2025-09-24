'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Save,
  Brain
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizCreatorProps {
  videoId: string;
  videoTitle: string;
  existingQuiz: QuizQuestion[];
  onSave: (questions: QuizQuestion[]) => void;
  onCancel: () => void;
}

export default function QuizCreator({
  videoId,
  videoTitle,
  existingQuiz,
  onSave,
  onCancel
}: QuizCreatorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    existingQuiz.length > 0
      ? existingQuiz
      : [{
          id: `${videoId}-q1`,
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: ''
        }]
  );

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `${videoId}-q${questions.length + 1}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== questionIndex));
    }
  };

  const updateQuestion = (questionIndex: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[questionIndex] = {
      ...updated[questionIndex],
      [field]: value
    };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSave = () => {
    // Validate all questions
    const isValid = questions.every(q =>
      q.question.trim() !== '' &&
      q.options.every(opt => opt.trim() !== '') &&
      q.explanation.trim() !== ''
    );

    if (!isValid) {
      alert('Please fill in all questions, options, and explanations.');
      return;
    }

    onSave(questions);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-black flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                Create Quiz
              </h2>
              <p className="text-gray-600 mt-1">
                {videoTitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <AnimatePresence>
            {questions.map((question, questionIndex) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Question {questionIndex + 1}
                      </CardTitle>
                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question */}
                    <div className="space-y-2">
                      <Label htmlFor={`question-${questionIndex}`} className="text-base font-medium">
                        Question
                      </Label>
                      <Textarea
                        id={`question-${questionIndex}`}
                        placeholder="Enter your question..."
                        value={question.question}
                        onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                        className="min-h-[80px] text-base py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 resize-none"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Answer Options</Label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <div className="flex-1">
                            <Input
                              placeholder={`Option ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                              className={`py-3 px-4 rounded-xl border-2 transition-colors ${
                                question.correctAnswer === optionIndex
                                  ? 'border-green-300 bg-green-50 focus:border-green-500'
                                  : 'border-gray-200 focus:border-purple-500'
                              }`}
                            />
                          </div>
                          <Button
                            type="button"
                            variant={question.correctAnswer === optionIndex ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                            className={`px-4 py-2 rounded-xl transition-colors ${
                              question.correctAnswer === optionIndex
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                            }`}
                          >
                            {question.correctAnswer === optionIndex ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Correct
                              </>
                            ) : (
                              'Mark Correct'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2">
                      <Label htmlFor={`explanation-${questionIndex}`} className="text-base font-medium">
                        Explanation
                      </Label>
                      <Textarea
                        id={`explanation-${questionIndex}`}
                        placeholder="Explain why this is the correct answer..."
                        value={question.explanation}
                        onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                        rows={3}
                        className="py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Question Button */}
          <div className="text-center">
            <Button
              onClick={addQuestion}
              variant="outline"
              className="border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-8 py-3 rounded-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Another Question
            </Button>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {questions.length} question{questions.length !== 1 ? 's' : ''} created
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="px-6 py-2 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-xl"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}