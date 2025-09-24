'use client';

import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  // Enhanced animation variants
  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-60 right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl"
          animate={{ scale: [1, 1.3, 1], rotate: 180 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Header */}
        <motion.div
          className="text-center mb-20"
          variants={sectionVariants}
        >
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6">
            About Edfinity
          </h1>
          <motion.div
            className="w-32 h-2 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full shadow-lg"
            whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}
          />
          <p className="text-xl md:text-2xl text-purple-200 mt-6 max-w-2xl mx-auto">
            Revolutionizing education through AI-powered learning experiences
          </p>
        </motion.div>

        {/* Our Story Section */}
        <motion.section
          className="mb-24"
          variants={sectionVariants}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl transform rotate-1"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-16 border border-white/20">
              <motion.div
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Story</span>
              </h2>
              <p className="text-xl md:text-2xl text-purple-100 leading-relaxed text-center max-w-4xl mx-auto">
                Edfinity was born from a simple belief: every learner deserves access to world-class education, regardless of language barriers or geographical boundaries. We combine cutting-edge AI technology with human-centered design to create learning experiences that adapt to you, not the other way around.
              </p>
            </div>
          </div>
        </motion.section>

        {/* What We Do Section */}
        <motion.section
          className="mb-24"
          variants={sectionVariants}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Do</span>
            </h2>
            <p className="text-xl text-purple-200">
              Transforming how the world learns, one course at a time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI-Powered Translations */}
            <motion.div
              className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">AI Translations</h3>
              <p className="text-purple-100 text-center leading-relaxed">
                Break language barriers with real-time AI-powered translations that preserve context and meaning across multiple languages.
              </p>
            </motion.div>

            {/* Personalized Learning */}
            <motion.div
              className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Smart Learning</h3>
              <p className="text-purple-100 text-center leading-relaxed">
                Adaptive learning paths that adjust to your pace, style, and goals, powered by advanced machine learning algorithms.
              </p>
            </motion.div>

            {/* Global Community */}
            <motion.div
              className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Global Reach</h3>
              <p className="text-purple-100 text-center leading-relaxed">
                Connect with learners and educators worldwide in a collaborative environment that celebrates diversity and inclusion.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Our Values Section */}
        <motion.section
          className="mb-24"
          variants={sectionVariants}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-16 border border-white/30">
              <motion.div
                className="absolute -top-6 right-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Values</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 text-blue-300">Innovation</h3>
                  <p className="text-lg leading-relaxed">
                    We constantly push boundaries, embracing new technologies to enhance the learning experience.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 text-purple-300">Accessibility</h3>
                  <p className="text-lg leading-relaxed">
                    Quality education should be available to everyone, regardless of background or circumstances.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 text-pink-300">Community</h3>
                  <p className="text-lg leading-relaxed">
                    Learning is better together. We foster connections that inspire and support growth.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 text-indigo-300">Excellence</h3>
                  <p className="text-lg leading-relaxed">
                    We maintain the highest standards in everything we do, from content to user experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Join Our Mission Section */}
        <motion.section
          variants={sectionVariants}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl transform rotate-1"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-16 border border-white/20 text-center">
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 mt-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Join</span> Our Mission
              </h2>
              <p className="text-xl md:text-2xl text-purple-100 leading-relaxed max-w-4xl mx-auto mb-10">
                Ready to transform your learning journey? Join thousands of learners who are already experiencing the future of education with Edfinity. Whether you're a student, educator, or lifelong learner, your adventure starts here.
              </p>

              <motion.button
                className="group relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-12 py-4 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl text-lg"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Start Learning Today</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.1 }}
                />
              </motion.button>

              <div className="flex justify-center space-x-6 mt-8">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="mt-24"
          variants={sectionVariants}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Active Learners" },
              { number: "1,200+", label: "Expert Courses" },
              { number: "25", label: "Languages" },
              { number: "98%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-purple-200 text-sm md:text-base font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default AboutUs;