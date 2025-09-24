'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import Lenis from 'lenis';

// Text overlay sections that appear at different scroll points
const textSections = [
  {
    id: 'hero',
    progress: 0,
    content: {
      splitLayout: true
    }
  },
  {
    id: 'translation',
    progress: 0.2,
    content: {
      title: 'Speak Any Language.',
      subtitle: 'Live translation for global classrooms',
      description: 'Break down language barriers with real-time translation technology that connects learners across the globe. Join discussions, attend lectures, and collaborate on projects with students from different cultures and linguistic backgrounds, all in your native language.',
      benefits: 'Support for 100+ languages • Real-time voice translation • Cultural context awareness • Seamless integration'
    }
  },
  {
    id: 'ai',
    progress: 0.4,
    content: {
      title: 'AI-Powered Learning.',
      subtitle: 'Smart summaries and adaptive insights',
      description: 'Harness the power of artificial intelligence to enhance your learning journey. Our advanced AI creates personalized study materials, identifies knowledge gaps, and adapts to your learning style to optimize retention and understanding.',
      benefits: 'Automated note-taking • Progress tracking • Personalized recommendations • Performance analytics'
    }
  },
  {
    id: 'collaboration',
    progress: 0.6,
    content: {
      title: 'Collaborate Everywhere.',
      subtitle: 'Seamless learning experiences across time zones',
      description: 'Form study groups, join virtual classrooms, and engage in meaningful academic discussions with peers around the world. Our platform creates connections that transcend geographical boundaries, fostering a truly global learning community.',
      benefits: 'Virtual study rooms • Peer-to-peer learning • Expert mentorship • Global networking'
    }
  },
  {
    id: 'courses',
    progress: 0.8,
    content: {
      title: 'Create & Share.',
      subtitle: 'Transform any content into interactive courses',
      description: 'Convert YouTube videos, podcasts, articles, and other media into comprehensive learning experiences. Our AI automatically generates quizzes, discussion points, and supplementary materials to enhance engagement and retention.',
      benefits: 'Content transformation • Interactive quizzes • Progress tracking • Community discussions'
    }
  }
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [framesLoadedCount, setFramesLoadedCount] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const totalFrames = 120; // Extracted frames at 15fps from 8 second video

  // Scroll progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3), // Smoother cubic ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      syncTouch: true,
      syncTouchLerp: 0.075,
      lerp: 0.1,
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

  // Draw frame function - WebP sequence
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !framesLoaded || frames.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = frames[Math.min(frameIndex, frames.length - 1)];
    if (!frame) return;

    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    // Clear and draw
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Calculate aspect ratio scaling
    const canvasAspect = displayWidth / displayHeight;
    const frameAspect = frame.naturalWidth / frame.naturalHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (frameAspect > canvasAspect) {
      drawHeight = displayHeight;
      drawWidth = drawHeight * frameAspect;
      offsetX = (displayWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = displayWidth;
      drawHeight = drawWidth / frameAspect;
      offsetX = 0;
      offsetY = (displayHeight - drawHeight) / 2;
    }

    ctx.drawImage(frame, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Frame loading and canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      // Set canvas size with device pixel ratio for crisp rendering
      canvas.width = displayWidth * devicePixelRatio;
      canvas.height = displayHeight * devicePixelRatio;

      // Scale back down using CSS
      canvas.style.width = displayWidth + 'px';
      canvas.style.height = displayHeight + 'px';

      // Scale the drawing context to match device pixel ratio
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    };

    // Load frame sequence
    const loadFrames = async () => {
      const frameArray: HTMLImageElement[] = [];
      let loadedCount = 0;

      const onFrameLoad = () => {
        loadedCount++;
        setFramesLoadedCount(loadedCount);
        if (loadedCount === totalFrames) {
          setFrames(frameArray);
          setFramesLoaded(true);
          resizeCanvas();
          drawFrame(0);
        }
      };

      const onFrameError = (frameNumber: number) => {
        console.error(`Failed to load frame ${frameNumber}`);
      };

      // Load all frames
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const frameNumber = i.toString().padStart(4, '0');
        img.onload = onFrameLoad;
        img.onerror = () => onFrameError(i);
        img.src = `/frames/frame_${frameNumber}.jpg`;
        frameArray.push(img);
      }
    };

    loadFrames();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Update frame based on scroll - WebP sequence
  useEffect(() => {
    const updateFrame = (progress: number) => {
      if (!framesLoaded || frames.length === 0) return;

      // Calculate frame index based on scroll progress
      const frameIndex = Math.floor(progress * (frames.length - 1));
      drawFrame(frameIndex);

      // Update current section
      const sectionIndex = textSections.findIndex((section, index) => {
        const nextSection = textSections[index + 1];
        return progress >= section.progress && (!nextSection || progress < nextSection.progress);
      });

      if (sectionIndex !== -1 && sectionIndex !== currentSection) {
        setCurrentSection(sectionIndex);
      }
    };

    const unsubscribe = scrollYProgress.on('change', updateFrame);
    return unsubscribe;
  }, [scrollYProgress, framesLoaded, frames, currentSection]);

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

  const TextSection = ({ section, index }: { section: typeof textSections[0]; index: number }) => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { amount: 0.3, once: true });

    if (section.content.splitLayout) {
      // Split title layout for hero section
      return (
        <div
          ref={sectionRef}
          key={section.id}
          className="min-h-screen flex items-center justify-center px-6 relative"
        >
          <div className="w-full max-w-7xl mx-auto text-white relative">
            {isInView && (
              <>
                {/* Split Title - "Discover" on left, "Knowledge" on right */}
                <div className="flex justify-between items-center mb-48">
                  <BlurToFocusText delay={0}>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight title">
                      ReImagine
                    </h1>
                  </BlurToFocusText>

                  <BlurToFocusText delay={0.3}>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight title">
                      Learning
                    </h1>
                  </BlurToFocusText>
                </div>

                {/* Centered subtitle */}
                <div className="text-center">
                  <BlurToFocusText delay={0.6}>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-light text-white/90 mb-12" style={{ fontFamily: 'var(--font-instrument-serif)' }}>
                      Education redesigned for you.
                    </p>
                  </BlurToFocusText>

                  {/* Centered button */}
                  <BlurToFocusText delay={0.9}>
                    <Link href="/auth">
                      <button
                        className="bg-white text-black px-8 py-4 rounded-full text-xl font-medium hover:bg-gray-100 transition-all duration-300 hover:shadow-xl"
                        style={{ fontFamily: 'var(--font-instrument-serif)' }}
                      >
                        Start learning
                      </button>
                    </Link>
                  </BlurToFocusText>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    // Standard layout for other sections
    return (
      <div
        ref={sectionRef}
        key={section.id}
        className="min-h-screen flex items-center justify-center px-6"
      >
        <div className="max-w-5xl mx-auto text-center text-white">
          {isInView && (
            <>
              <BlurToFocusText delay={0}>
                <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 title">
                  {section.content.title}
                </h1>
              </BlurToFocusText>

              <BlurToFocusText delay={0.3}>
                <p className="text-xl md:text-2xl font-light text-white/90 mb-8">
                  {section.content.subtitle}
                </p>
              </BlurToFocusText>

              <BlurToFocusText delay={0.6}>
                <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                  {section.content.description}
                </p>
              </BlurToFocusText>

              {/* Benefits section */}
              {section.content.benefits && (
                <BlurToFocusText delay={0.9}>
                  <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
                    {section.content.benefits}
                  </p>
                </BlurToFocusText>
              )}

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
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Frame sequence preloading happens in useEffect */}

      {/* Canvas for video rendering */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      />

      {/* Dark overlay for better text readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-10" />

      {/* Text Content Overlays */}
      <div className="relative z-20">
        {textSections.map((section, index) => (
          <TextSection key={section.id} section={section} index={index} />
        ))}

        {/* Spacer div to enable scrolling */}
        <div style={{ height: '50vh' }} />
      </div>

      {/* Scroll Progress Indicator */}
      <div className="fixed bottom-8 right-8 z-30">
        <div className="w-2 h-20 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="w-full bg-white rounded-full"
            style={{
              height: useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
            }}
          />
        </div>
      </div>
    </div>
  );
}
