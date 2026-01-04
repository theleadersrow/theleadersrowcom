import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscript, isProcessing, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      // Set up audio analysis for visual feedback
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start visual animation
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(average / 255);
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
    setRecordingTime(0);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    // For now, we'll use a placeholder - in production, this would call a transcription API
    // The user would integrate with Whisper or another STT service
    
    // Simulate transcription for demo
    setTimeout(() => {
      onTranscript(""); // The actual transcription would go here
    }, 500);
    
    // TODO: Integrate with actual transcription service
    console.log("Audio recorded, size:", audioBlob.size);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center gap-3 py-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <span className="text-sm text-muted-foreground">Processing response...</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        {/* Voice visualization - ChatGPT style pulsing rings */}
        <div className="relative">
          {/* Outer pulsing rings */}
          <div 
            className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
            style={{ 
              transform: `scale(${1 + audioLevel * 0.5})`,
              opacity: 0.3 + audioLevel * 0.4
            }}
          />
          <div 
            className="absolute -inset-2 rounded-full bg-primary/10"
            style={{ 
              transform: `scale(${1 + audioLevel * 0.8})`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          <div 
            className="absolute -inset-4 rounded-full bg-primary/5"
            style={{ 
              transform: `scale(${1 + audioLevel * 1.2})`,
              transition: 'transform 0.15s ease-out'
            }}
          />
          
          {/* Main button */}
          <Button
            onClick={stopRecording}
            variant="destructive"
            size="lg"
            className={cn(
              "relative z-10 w-20 h-20 rounded-full",
              "transition-all duration-200"
            )}
            style={{
              boxShadow: `0 0 ${20 + audioLevel * 40}px ${audioLevel * 20}px rgba(var(--primary), ${0.2 + audioLevel * 0.3})`
            }}
          >
            <Square className="h-6 w-6" />
          </Button>
        </div>

        {/* Audio level bars */}
        <div className="flex items-center gap-1 h-8">
          {Array.from({ length: 7 }).map((_, i) => {
            const barLevel = Math.sin((i / 6) * Math.PI) * audioLevel;
            return (
              <div
                key={i}
                className="w-1 bg-primary rounded-full transition-all duration-75"
                style={{
                  height: `${8 + barLevel * 24}px`,
                  opacity: 0.4 + barLevel * 0.6
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-destructive font-medium animate-pulse">● Recording</span>
          <span className="text-muted-foreground">{formatTime(recordingTime)}</span>
        </div>

        <p className="text-xs text-muted-foreground">Tap to stop and submit</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <Button
        onClick={startRecording}
        variant="outline"
        size="lg"
        disabled={disabled}
        className={cn(
          "w-16 h-16 rounded-full border-2",
          "hover:bg-primary/10 hover:border-primary",
          "transition-all duration-200"
        )}
      >
        <Mic className="h-6 w-6" />
      </Button>
      <p className="text-xs text-muted-foreground">Tap to speak</p>
    </div>
  );
}
