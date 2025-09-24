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
    id: 'borderless',
    progress: 0.15,
    content: {
      title: 'Borderless Learning',
      subtitle: 'Learn in your own language, anywhere.',
      description: 'Break down barriers with instant AI-powered translations and subtitles. Switch languages seamlessly, understand lessons clearly, and study comfortably in your native tongue, whether you\'re revising alone or collaborating in a global classroom.',
      benefits: 'Instant translations • 100+ languages • AI-powered subtitles • Seamless switching'
    }
  },
  {
    id: 'smart-notes',
    progress: 0.35,
    content: {
      title: 'Smart Notes',
      subtitle: 'Focus on learning, not note-taking.',
      description: 'Our AI automatically captures and summarizes key points from lectures, videos, and discussions. Get clear, concise study notes in seconds, so you can revise faster, retain more, and never miss an important detail again.',
      benefits: 'Auto-capture • Smart summaries • Fast revision • Key details saved',
      notesLayout: true
    }
  },
  {
    id: 'grow-smarter',
    progress: 0.6,
    content: {
      title: 'Grow Smarter',
      subtitle: 'Your progress, made visible.',
      description: 'Get personalized performance reports powered by AI. See where you shine, discover areas for improvement, and receive smart recommendations tailored to your learning journey. Stay motivated with insights that help you grow every day.',
      benefits: 'Performance reports • AI insights • Personal recommendations • Progress tracking'
    }
  },
  {
    id: 'quote',
    progress: 1,
    content: {
      quoteLayout: true,
      quote: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
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

  const BlurToFocusText = ({ children, delay = 0, isVisible }: { children: React.ReactNode; delay?: number; isVisible: boolean }) => (
    <motion.div
      initial={{
        opacity: 0.05,
        filter: 'blur(20px)',
        y: 30
      }}
      animate={isVisible ? {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0
      } : {
        opacity: 0.05,
        filter: 'blur(20px)',
        y: 30
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

  const NoteSVG = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 300 400"
        className="w-64 h-80 drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Paper background */}
        <rect x="20" y="20" width="260" height="360" fill="white" rx="8" ry="8"/>
        {/* Paper shadow */}
        <rect x="25" y="25" width="260" height="360" fill="#f8f9fa" rx="8" ry="8"/>
        {/* Lines */}
        <line x1="40" y1="80" x2="260" y2="80" stroke="#e9ecef" strokeWidth="1"/>
        <line x1="40" y1="110" x2="260" y2="110" stroke="#e9ecef" strokeWidth="1"/>
        <line x1="40" y1="140" x2="260" y2="140" stroke="#e9ecef" strokeWidth="1"/>
        <line x1="40" y1="170" x2="260" y2="170" stroke="#e9ecef" strokeWidth="1"/>
        <line x1="40" y1="200" x2="260" y2="200" stroke="#e9ecef" strokeWidth="1"/>
        {/* Red margin line */}
        <line x1="60" y1="50" x2="60" y2="350" stroke="#ff6b6b" strokeWidth="2"/>
      </svg>
      {/* Text overlay */}
      <div className="absolute top-16 left-8 right-4 text-gray-800 text-xs leading-relaxed">
        {children}
      </div>
    </div>
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
            {/* Split Title - "ReImagine" on left, "Learning" on right */}
            <div className="flex justify-between items-center mb-48">
              <BlurToFocusText delay={0} isVisible={isInView}>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight title">
                  ReImagine
                </h1>
              </BlurToFocusText>

              <BlurToFocusText delay={0.4} isVisible={isInView}>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight title">
                  Learning
                </h1>
              </BlurToFocusText>
            </div>

            {/* Centered subtitle */}
            <div className="text-center">
              <BlurToFocusText delay={0.8} isVisible={isInView}>
                <p className="text-2xl md:text-3xl lg:text-4xl font-light text-white/90 mb-12" style={{ fontFamily: 'var(--font-instrument-serif)' }}>
                  Education redesigned for you.
                </p>
              </BlurToFocusText>

              {/* Centered button */}
              <BlurToFocusText delay={1.2} isVisible={isInView}>
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
          </div>
        </div>
      );
    }

    if (section.content.notesLayout) {
      // Special notes layout with SVG notes on both sides
      return (
        <div
          ref={sectionRef}
          key={section.id}
          className="min-h-screen flex items-center justify-center px-6 relative"
        >
          <div className="w-full max-w-7xl mx-auto text-white relative">
            {/* Left note */}
            <BlurToFocusText delay={0.2} isVisible={isInView}>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 hidden lg:block">
                <NoteSVG>
                  <div className="space-y-2">
                    <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-1 bg-gray-300 rounded w-full"></div>
                    <div className="h-1 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-1 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                    <div className="mt-4 space-y-2">
                      <div className="h-1 bg-gray-400 rounded w-4/5"></div>
                      <div className="h-1 bg-gray-400 rounded w-3/5"></div>
                      <div className="h-1 bg-gray-400 rounded w-2/3"></div>
                    </div>
                  </div>
                </NoteSVG>
              </div>
            </BlurToFocusText>

            {/* Right note */}
            <BlurToFocusText delay={0.6} isVisible={isInView}>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 hidden lg:block">
                <NoteSVG>
                  <div className="space-y-2">
                    <div className="h-1 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-1 bg-gray-300 rounded w-full"></div>
                    <div className="h-1 bg-gray-300 rounded w-4/5"></div>
                    <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                    <div className="mt-4 space-y-2">
                      <div className="h-1 bg-gray-400 rounded w-5/6"></div>
                      <div className="h-1 bg-gray-400 rounded w-2/5"></div>
                      <div className="h-1 bg-gray-400 rounded w-3/5"></div>
                    </div>
                  </div>
                </NoteSVG>
              </div>
            </BlurToFocusText>

            {/* Center content */}
            <div className="max-w-4xl mx-auto text-center">
              <BlurToFocusText delay={0.4} isVisible={isInView}>
                <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 title">
                  {section.content.title}
                </h1>
              </BlurToFocusText>

              <BlurToFocusText delay={0.7} isVisible={isInView}>
                <p className="text-xl md:text-2xl font-light text-white/90 mb-8">
                  {section.content.subtitle}
                </p>
              </BlurToFocusText>

              <BlurToFocusText delay={1.0} isVisible={isInView}>
                <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                  {section.content.description}
                </p>
              </BlurToFocusText>

              <BlurToFocusText delay={1.3} isVisible={isInView}>
                <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
                  {section.content.benefits}
                </p>
              </BlurToFocusText>
            </div>
          </div>
        </div>
      );
    }

    if (section.content.quoteLayout) {
      // Quote layout
      return (
        <div
          ref={sectionRef}
          key={section.id}
          className="min-h-screen flex items-center justify-center px-6"
        >
          <div className="max-w-4xl mx-auto text-center text-white">
            <BlurToFocusText delay={0.2} isVisible={isInView}>
              <div className="text-8xl text-white/20 mb-8 font-serif">"</div>
            </BlurToFocusText>

            <BlurToFocusText delay={0.5} isVisible={isInView}>
              <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white/95 mb-12 leading-relaxed" style={{ fontFamily: 'var(--font-instrument-serif)' }}>
                {section.content.quote}
              </p>
            </BlurToFocusText>

            <BlurToFocusText delay={0.8} isVisible={isInView}>
              <p className="text-xl md:text-2xl text-white/70 font-light">
                — {section.content.author}
              </p>
            </BlurToFocusText>

            <BlurToFocusText delay={1.2} isVisible={isInView}>
              <div className="mt-16">
                <Link href="/auth">
                  <button className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-300 hover:shadow-xl mr-4">
                    Start Your Journey
                  </button>
                </Link>
              </div>
            </BlurToFocusText>
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
          <BlurToFocusText delay={0.2} isVisible={isInView}>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 title">
              {section.content.title}
            </h1>
          </BlurToFocusText>

          <BlurToFocusText delay={0.5} isVisible={isInView}>
            <p className="text-xl md:text-2xl font-light text-white/90 mb-8">
              {section.content.subtitle}
            </p>
          </BlurToFocusText>

          <BlurToFocusText delay={0.8} isVisible={isInView}>
            <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              {section.content.description}
            </p>
          </BlurToFocusText>

          {/* Benefits section */}
          {section.content.benefits && (
            <BlurToFocusText delay={1.1} isVisible={isInView}>
              <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
                {section.content.benefits}
              </p>
            </BlurToFocusText>
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

        {/* Spacer div to enable scrolling - extra space for quote at the end */}
        <div style={{ height: '150vh' }} />
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
