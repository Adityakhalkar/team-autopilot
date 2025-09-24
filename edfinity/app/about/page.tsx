'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-light text-gray-900 mb-6 title"
              variants={fadeInUp}
            >
              About Edfinity
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Transforming education through AI-powered learning experiences that break down barriers and connect minds across the globe.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            <div>
              <motion.h2
                className="text-4xl md:text-5xl font-light text-gray-900 mb-8 title"
                variants={fadeInUp}
              >
                Our Mission
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600 leading-relaxed mb-6"
                variants={fadeInUp}
              >
                At Edfinity, we believe education should be accessible to everyone, regardless of language barriers or geographical boundaries. Our mission is to create an AI-powered learning ecosystem that adapts to each learner's unique needs and preferences.
              </motion.p>
              <motion.p
                className="text-lg text-gray-600 leading-relaxed"
                variants={fadeInUp}
              >
                We're building a future where knowledge transcends borders, where students can learn from the world's best educators in their native language, and where cultural diversity enriches every learning experience.
              </motion.p>
            </div>
            <motion.div
              variants={fadeInUp}
            >
                <Image
                  src="/Untitled design.png"
                  alt="Edfinity - Empowering Global Learning"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 title">
              What We Do
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make Edfinity the future of online education
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {/* AI-Powered Translations */}
            <motion.div
              className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI Translations</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time AI-powered translations that preserve context and meaning across 25+ languages, making global education accessible to everyone.
              </p>
            </motion.div>

            {/* Smart Learning */}
            <motion.div
              className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Personalized learning paths that adapt to your pace, style, and goals using advanced machine learning algorithms for optimal retention.
              </p>
            </motion.div>

            {/* Global Community */}
            <motion.div
              className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Global Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with learners and educators worldwide in a collaborative environment that celebrates diversity and cross-cultural learning.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 title">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Edfinity
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              className="text-center"
              variants={fadeInUp}
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                Constantly pushing boundaries to enhance the learning experience through cutting-edge technology.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              variants={fadeInUp}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Accessibility</h3>
              <p className="text-gray-600">
                Quality education should be available to everyone, regardless of background or circumstances.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              variants={fadeInUp}
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                Learning is better together. We foster connections that inspire and support growth.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              variants={fadeInUp}
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                Maintaining the highest standards in content quality, user experience, and educational outcomes.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 title">
              By the Numbers
            </h2>
            <p className="text-xl text-gray-600">
              Our impact on global education continues to grow
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              { number: "50K+", label: "Active Learners", subtext: "Growing daily" },
              { number: "1,200+", label: "Expert Courses", subtext: "Quality content" },
              { number: "25", label: "Languages", subtext: "Global reach" },
              { number: "98%", label: "Satisfaction", subtext: "Happy learners" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center bg-gray-50 rounded-2xl p-6"
                variants={fadeInUp}
              >
                <div className="text-4xl md:text-5xl font-light text-gray-900 mb-2 title">
                  {stat.number}
                </div>
                <div className="text-lg font-medium text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-500">
                  {stat.subtext}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-light text-gray-900 mb-8 title"
              variants={fadeInUp}
            >
              Ready to Transform Your Learning?
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 mb-12 leading-relaxed"
              variants={fadeInUp}
            >
              Join thousands of learners who are already experiencing the future of education with Edfinity. Start your journey today and discover what's possible when technology meets human potential.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <Link href="/courses">
                <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors duration-300">
                  Browse Courses
                </button>
              </Link>
              <Link href="/auth">
                <button className="border border-black text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-colors duration-300">
                  Start Learning
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}