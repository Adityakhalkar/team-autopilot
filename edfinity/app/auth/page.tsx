'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/firebase';
import InfinityLoader from '@/components/infinity-loader';

interface LoginForm {
  email: string;
  password: string;
}

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher' | 'admin';
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginForm>();

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignup,
    watch: watchSignup,
  } = useForm<SignupForm>();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetLogin();
    resetSignup();
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const { user, error } = await signInWithGoogle();

    if (error) {
      setError(error);
    } else if (user) {
      // Successfully signed in with Google
      console.log('Google sign-in successful:', user);
      router.push('/dashboard'); // Redirect to dashboard or home
    }

    setIsLoading(false);
  };

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    const { user, error } = await signInWithEmail(data.email, data.password);

    if (error) {
      setError(error);
    } else if (user) {
      console.log('Email sign-in successful:', user);
      router.push('/dashboard'); // Redirect to dashboard
    }

    setIsLoading(false);
  };

  const onSignupSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setError(null);

    const { user, error } = await signUpWithEmail(data.email, data.password);

    if (error) {
      setError(error);
    } else if (user) {
      console.log('Email sign-up successful:', user);
      // TODO: Save additional user data (firstName, lastName, role) to Firestore
      router.push('/dashboard'); // Redirect to dashboard
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-light tracking-tight mb-4 text-black title" style={{ fontFamily: 'var(--font-instrument-serif)' }}>
            EdFinity
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Global EdTech Collaboration Layer
          </p>
        </motion.div>

        {/* Auth Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-medium text-black mb-2">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h2>
            </div>

            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={toggleMode}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  isLogin
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={toggleMode}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl text-base mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={isLogin ? handleLoginSubmit(onLoginSubmit) : handleSignupSubmit(onSignupSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          First Name
                        </label>
                        <input
                          {...registerSignup('firstName', {
                            required: 'First name is required',
                            minLength: {
                              value: 2,
                              message: 'First name must be at least 2 characters'
                            }
                          })}
                          type="text"
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 text-sm ${
                            signupErrors.firstName ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'
                          }`}
                          placeholder="John"
                        />
                        {signupErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{signupErrors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Last Name
                        </label>
                        <input
                          {...registerSignup('lastName', {
                            required: 'Last name is required',
                            minLength: {
                              value: 2,
                              message: 'Last name must be at least 2 characters'
                            }
                          })}
                          type="text"
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 text-sm ${
                            signupErrors.lastName ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'
                          }`}
                          placeholder="Doe"
                        />
                        {signupErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{signupErrors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">
                        Role
                      </label>
                      <select
                        {...registerSignup('role', {
                          required: 'Please select a role'
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 text-sm ${
                          signupErrors.role ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Administrator</option>
                      </select>
                      {signupErrors.role && (
                        <p className="mt-1 text-sm text-red-600">{signupErrors.role.message}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email Address
                </label>
                <input
                  {...(isLogin
                    ? registerLogin('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address'
                        }
                      })
                    : registerSignup('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address'
                        }
                      })
                  )}
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 text-sm ${
                    (isLogin ? loginErrors.email : signupErrors.email) ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {(isLogin ? loginErrors.email : signupErrors.email) && (
                  <p className="mt-1 text-sm text-red-600">
                    {(isLogin ? loginErrors.email : signupErrors.email)?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Password
                </label>
                <input
                  {...(isLogin
                    ? registerLogin('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })
                    : registerSignup('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain uppercase, lowercase, and number'
                        }
                      })
                  )}
                  type="password"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 text-sm ${
                    (isLogin ? loginErrors.password : signupErrors.password) ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {(isLogin ? loginErrors.password : signupErrors.password) && (
                  <p className="mt-1 text-sm text-red-600">
                    {(isLogin ? loginErrors.password : signupErrors.password)?.message}
                  </p>
                )}
              </div>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-black mb-2">
                      Confirm Password
                    </label>
                    <input
                      {...registerSignup('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => {
                          const password = watchSignup('password');
                          return value === password || "Passwords don't match";
                        }
                      })}
                      type="password"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 text-sm ${
                        signupErrors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {signupErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{signupErrors.confirmPassword.message}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 h-4 w-4 text-black rounded border-gray-300 focus:ring-black focus:ring-1" />
                    <span className="text-gray-700">Remember me</span>
                  </label>
                  <a href="#" className="text-gray-600 hover:text-black transition-colors duration-300">
                    Forgot password?
                  </a>
                </div>
              )}

              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 shadow-sm flex items-center justify-center text-sm ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <InfinityLoader size={20} className="mr-3" />
                    Processing...
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500 font-light">or continue with</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Social Login */}
            <div className="w-full">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-black transition-colors duration-300 text-base font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}