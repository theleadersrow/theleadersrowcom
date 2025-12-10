import { useState } from "react";
import { X, Download, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const scrollToLeadMagnet = () => {
    if (isHomePage) {
      const leadMagnetSection = document.getElementById('lead-magnet');
      if (leadMagnetSection) {
        leadMagnetSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const leadMagnetSection = document.getElementById('lead-magnet');
        if (leadMagnetSection) {
          leadMagnetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const scrollToQuiz = () => {
    if (isHomePage) {
      const quizSection = document.querySelector('[data-quiz-section]');
      if (quizSection) {
        quizSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const quizSection = document.querySelector('[data-quiz-section]');
        if (quizSection) {
          quizSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-secondary via-secondary/90 to-secondary text-navy text-sm py-2 px-4 relative z-[60]">
      <div className="container-wide mx-auto flex items-center justify-center gap-4 md:gap-8">
        <button
          onClick={scrollToLeadMagnet}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity font-medium"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Free Blueprint:</span>
          <span className="underline underline-offset-2">Get the 200K Method Guide</span>
        </button>
        
        <span className="hidden md:block text-navy/40">|</span>
        
        <button
          onClick={scrollToQuiz}
          className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity font-medium"
        >
          <Sparkles className="w-4 h-4" />
          <span className="underline underline-offset-2">Take Career Quiz</span>
        </button>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          aria-label="Close announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;