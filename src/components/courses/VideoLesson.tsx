import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Slide {
  title: string;
  points: string[];
  highlight?: string;
}

interface VideoLessonProps {
  title: string;
  script: string;
  slides: Slide[];
  onComplete?: () => void;
}

const VideoLesson = ({ title, script, slides, onComplete }: VideoLessonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate slide timing based on script length
  const slideDuration = script.length > 0 ? (script.length / 150) * 1000 / slides.length : 5000;

  const generateAudio = async () => {
    if (audioUrl) return audioUrl;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-course-audio', {
        body: { script }
      });

      if (error) throw error;
      
      if (data?.audioBase64) {
        const blob = new Blob(
          [Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        return url;
      }
      throw new Error('No audio data received');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async () => {
    if (!hasStarted) {
      setHasStarted(true);
    }

    if (!audioUrl) {
      const url = await generateAudio();
      if (!url) return;
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
        startSlideTimer();
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (slideTimerRef.current) {
          clearInterval(slideTimerRef.current);
        }
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        startSlideTimer();
      }
    }
  };

  const startSlideTimer = () => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
    }
    
    slideTimerRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev < slides.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, slideDuration);
  };

  const handleRestart = () => {
    setCurrentSlide(0);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      startSlideTimer();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
    }
    setCurrentSlide(slides.length - 1);
    onComplete?.();
  };

  useEffect(() => {
    return () => {
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-elevated">
      {/* Video/Slide Display Area */}
      <div className="relative aspect-video bg-gradient-to-br from-navy via-navy-dark to-navy-light flex items-center justify-center">
        {/* Slide Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
          {!hasStarted ? (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Play className="w-10 h-10 text-secondary ml-1" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-cream">
                {title}
              </h3>
              <p className="text-cream/70 max-w-md">
                Click play to start your AI-guided lesson
              </p>
            </div>
          ) : (
            <div className="animate-fade-up space-y-6 max-w-2xl" key={currentSlide}>
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-cream">
                {currentSlideData?.title}
              </h3>
              <ul className="space-y-3 text-left">
                {currentSlideData?.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-cream/90 text-sm sm:text-base">
                    <span className="w-6 h-6 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary">
                      {i + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {currentSlideData?.highlight && (
                <div className="bg-secondary/20 rounded-xl px-6 py-4 border border-secondary/30">
                  <p className="text-secondary font-medium italic">
                    "{currentSlideData.highlight}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Instructor Avatar */}
        <div className="absolute bottom-4 right-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 border-2 border-secondary/50 flex items-center justify-center">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary/50 ${isPlaying ? 'animate-pulse' : ''}`}>
            <Volume2 className={`w-full h-full p-2 text-cream ${isPlaying ? 'opacity-100' : 'opacity-50'}`} />
          </div>
        </div>

        {/* Slide Indicator */}
        {hasStarted && (
          <div className="absolute top-4 right-4 bg-navy/80 backdrop-blur-sm rounded-full px-3 py-1 text-cream/80 text-sm">
            {currentSlide + 1} / {slides.length}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-muted/50">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-secondary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlay}
              disabled={isLoading}
              className="h-10 w-10"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRestart}
              disabled={!hasStarted}
              className="h-10 w-10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              disabled={!hasStarted}
              className="h-10 w-10"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
          </div>

          <span className="text-sm text-muted-foreground">
            AI Instructor
          </span>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
    </div>
  );
};

export default VideoLesson;
