'use client';

import { useState } from 'react';
import { generateQuiz, generateTranslation, generateSummary, checkHealth } from '@/lib/api';
import { fetchPlaylistVideos } from '@/lib/youtube';

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const testVideoUrl = 'https://www.youtube.com/watch?v=aircAruvnKk';

  const testApiCall = async (testName: string, apiCall: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    setErrors(prev => ({ ...prev, [testName]: null }));

    try {
      const result = await apiCall();
      setResults(prev => ({ ...prev, [testName]: result }));
      console.log(`✅ ${testName} success:`, result);
    } catch (error) {
      setErrors(prev => ({ ...prev, [testName]: error.message }));
      console.error(`❌ ${testName} failed:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const tests = [
    {
      name: 'Health Check',
      test: () => testApiCall('health', () => checkHealth()),
      description: 'Check if the backend server is running'
    },
    {
      name: 'Quiz Generation',
      test: () => testApiCall('quiz', () => generateQuiz({
        video_urls: [testVideoUrl],
        num_questions: 2,
        question_types: ['multiple_choice']
      })),
      description: 'Generate quiz questions from a YouTube video'
    },
    {
      name: 'Translation (Spanish)',
      test: () => testApiCall('translation', () => generateTranslation({
        video_urls: [testVideoUrl],
        target_language: 'es'
      })),
      description: 'Translate video transcript to Spanish'
    },
    {
      name: 'AI Notes Generation',
      test: () => testApiCall('summary', () => generateSummary({
        video_urls: [testVideoUrl],
        summary_type: 'notes',
        max_length: 300
      })),
      description: 'Generate AI-powered notes from video content'
    },
    {
      name: 'RapidAPI YouTube Playlist',
      test: () => testApiCall('rapidapi', () => fetchPlaylistVideos('PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi')),
      description: 'Fetch playlist videos using RapidAPI YouTube service'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900 title mb-4">
              Backend API Integration Test
            </h1>
            <p className="text-gray-600">
              Test all backend API endpoints to ensure proper integration.
              Make sure your backend server is running at <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8000</code>
            </p>
          </div>

          <div className="space-y-6">
            {tests.map((test) => (
              <div key={test.name} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                  <button
                    onClick={test.test}
                    disabled={loading[test.name.toLowerCase().replace(' ', '')]}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading[test.name.toLowerCase().replace(' ', '')] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      'Test'
                    )}
                  </button>
                </div>

                {/* Results */}
                <div className="space-y-3">
                  {/* Success Result */}
                  {results[test.name.toLowerCase().replace(' ', '')] && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-800 font-medium">Success</span>
                      </div>
                      <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-x-auto">
                        {JSON.stringify(results[test.name.toLowerCase().replace(' ', '')], null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Error Result */}
                  {errors[test.name.toLowerCase().replace(' ', '')] && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-red-800 font-medium">Error</span>
                      </div>
                      <p className="text-sm text-red-700">
                        {errors[test.name.toLowerCase().replace(' ', '')]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Test All Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                tests.forEach(test => {
                  setTimeout(() => test.test(), Math.random() * 1000);
                });
              }}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Run All Tests
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-medium text-blue-900 mb-3">Setup Instructions</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Start your backend server: <code className="bg-blue-100 px-2 py-1 rounded">cd backend && uvicorn main:app --reload --port 8000</code></li>
              <li>2. Add your RapidAPI key to <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code>: <code className="bg-blue-100 px-2 py-1 rounded">NEXT_PUBLIC_RAPIDAPI_KEY=your_key_here</code></li>
              <li>3. Ensure you have other required API keys in your <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file</li>
              <li>4. Click the test buttons above to verify each endpoint</li>
              <li>5. Check the console for detailed logs and responses</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}