'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import Link from 'next/link';
import Lenis from 'lenis';

// Text overlay sections that appear at different scroll points
const textSections = [
  {
    id: 'hero',
    progress: 0,
    content: {
      title: 'Discover Knowledge.',
      subtitle: 'Where ancient wisdom meets modern learning',
      description: 'Step into the future of education with timeless elegance'
    }
  },
  {
    id: 'translation',
    progress: 0.2,
    content: {
      title: 'Speak Any Language.',
      subtitle: 'Live translation for global classrooms',
      description: 'Connect with students and educators worldwide without language barriers'
    }
  },
  {
    id: 'ai',
    progress: 0.4,
    content: {
      title: 'AI-Powered Learning.',
      subtitle: 'Smart summaries and adaptive insights',
      description: 'Automatically generate notes and track progress with intelligent analysis'
    }
  },
  {
    id: 'collaboration',
    progress: 0.6,
    content: {
      title: 'Collaborate Everywhere.',
      subtitle: 'Seamless learning experiences',
      description: 'Join study groups, share knowledge, and learn together across continents'
    }
  },
  {
    id: 'courses',
    progress: 0.8,
    content: {
      title: 'Create & Share.',
      subtitle: 'Transform playlists into courses',
      description: 'Turn your YouTube content into interactive learning experiences with AI quizzes'
    }
  },
  {
    id: 'cta',
    progress: 1,
    content: {
      title: 'Begin Your Journey.',
      subtitle: 'Join thousands of learners worldwide',
      description: 'Ready to experience the future of education?'
    }
  }
];

export default function HomeSimple() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  // Scroll progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    setLenis(lenisInstance);

    const raf = (time: number) => {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
    };
  }, []);

  // Video setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      console.log('Video loaded successfully');
      setVideoLoaded(true);
      video.currentTime = 0;
    };

    const handleError = (e: any) => {
      console.error('Video error:', e);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, []);

  // Update video progress based on scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      const video = videoRef.current;
      if (!video || !videoLoaded) return;

      // Update video time based on scroll progress
      const targetTime = progress * video.duration;
      if (Math.abs(video.currentTime - targetTime) > 0.05) {
        video.currentTime = targetTime;
      }

      // Update current section
      const sectionIndex = textSections.findIndex((section, index) => {
        const nextSection = textSections[index + 1];
        return progress >= section.progress && (!nextSection || progress < nextSection.progress);
      });

      if (sectionIndex !== -1 && sectionIndex !== currentSection) {
        setCurrentSection(sectionIndex);
      }
    });

    return unsubscribe;
  }, [scrollYProgress, videoLoaded, currentSection]);

  const BlurToFocusText = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
      initial={{
        opacity: 0.05,
        filter: 'blur(20px)',
        y: 30
      }}
      animate={{
        opacity: 1,
        filter: 'blur(0px)',
        y: 0
      }}
      exit={{
        opacity: 0.05,
        filter: 'blur(20px)',
        y: -30
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        muted
        playsInline
        preload="metadata"
      >
        <source src="/Gothic_Library_Vertical_Dolly_Down.mp4" type="video/mp4" />
      </video>

      {/* Debug information */}
      <div className="fixed top-4 left-4 z-50 bg-black/50 text-white p-2 rounded text-sm">
        Video loaded: {videoLoaded ? 'Yes' : 'No'}
      </div>

      {/* Dark overlay for better text readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-10" />

      {/* Text Content Overlays */}
      <div className="relative z-20">
        {textSections.map((section, index) => (
          <div
            key={section.id}
            className="min-h-screen flex items-center justify-center px-6"
          >
            <div className="max-w-4xl mx-auto text-center text-white">
              {currentSection === index && (
                <>
                  <BlurToFocusText delay={0}>
                    <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6 title">
                      {section.content.title}
                    </h1>
                  </BlurToFocusText>

                  <BlurToFocusText delay={0.3}>
                    <p className="text-2xl md:text-3xl font-light text-white/90 mb-6">
                      {section.content.subtitle}
                    </p>
                  </BlurToFocusText>

                  <BlurToFocusText delay={0.6}>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                      {section.content.description}
                    </p>
                  </BlurToFocusText>

                  {/* CTA Section */}
                  {section.id === 'cta' && (
                    <BlurToFocusText delay={0.9}>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                        <Link href="/auth">
                          <button className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-300 hover:shadow-xl">
                            Start Learning
                          </button>
                        </Link>
                        <Link href="/dashboard">
                          <button className="border border-white/30 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                            Explore Platform
                          </button>
                        </Link>
                      </div>
                    </BlurToFocusText>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {/* Spacer div to enable scrolling */}
        <div style={{ height: '50vh' }} />
      </div>

      {/* Section Indicators */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-30 space-y-4">
        {textSections.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              lenis?.scrollTo(index * window.innerHeight, { duration: 1.5 });
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSection === index
                ? 'bg-white scale-125'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}