import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX } from
'lucide-react';
const DUMMY_AUDIO =
'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const bookMeta: Record<
  string,
  {
    title: string;
    author: string;
    cover: string;
  }> =
{
  'book-1': {
    title: 'Juicing for Authentic Balance',
    author: 'Misty A.',
    cover:
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80'
  },
  'book-2': {
    title: 'The 30-Day Reset',
    author: 'Misty A.',
    cover:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80'
  },
  'book-3': {
    title: 'Maintaining the Lifestyle',
    author: 'Misty A.',
    cover:
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80'
  }
};
const sections = [
{
  id: 1,
  title: 'Introduction',
  duration: '4:12'
},
{
  id: 2,
  title: 'Why Juice?',
  duration: '8:30'
},
{
  id: 3,
  title: 'Choosing Your Greens',
  duration: '6:45'
},
{
  id: 4,
  title: 'Recipes to Start With',
  duration: '12:18'
},
{
  id: 5,
  title: 'Building the Habit',
  duration: '9:05'
}];

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
export function BookListen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const meta = id && bookMeta[id] || bookMeta['book-1'];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [activeSection, setActiveSection] = useState(2);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnd = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {

        /* autoplay policy or fetch error — ignore */});
      setIsPlaying(true);
    }
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = Number(e.target.value) / 100 * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(duration || 0, audio.currentTime + delta)
    );
  };
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };
  const progressPercent = duration ? currentTime / duration * 100 : 0;
  return (
    <div className="flex flex-col h-full bg-surface">
      <audio ref={audioRef} src={DUMMY_AUDIO} preload="metadata" />

      <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-surface z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Now Listening
          </span>
          <h1 className="text-sm font-bold text-text">Audio Book</h1>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Cover & metadata */}
        <div className="px-6 pt-6 flex flex-col items-center text-center">
          <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-xl bg-surface-2 mb-6">
            <img
              src={meta.cover}
              alt={meta.title}
              className="w-full h-full object-cover" />
            
          </div>
          <h2 className="text-xl font-bold text-text mb-1">{meta.title}</h2>
          <p className="text-sm text-text-muted">{meta.author}</p>
          <p className="text-xs text-primary font-semibold mt-3">
            Section {activeSection} of {sections.length} —{' '}
            {sections.find((s) => s.id === activeSection)?.title}
          </p>
        </div>

        {/* Scrubber */}
        <div className="px-6 mt-8">
          <input
            type="range"
            min={0}
            max={100}
            value={progressPercent}
            onChange={handleSeek}
            className="w-full h-1 accent-primary cursor-pointer" />
          
          <div className="flex justify-between text-xs text-text-muted mt-2 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-6 px-6">
          <button
            onClick={toggleMute}
            className="w-10 h-10 flex items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            aria-label="Toggle mute">
            
            {muted ?
            <VolumeX className="w-5 h-5" /> :

            <Volume2 className="w-5 h-5" />
            }
          </button>
          <button
            onClick={() => skip(-15)}
            className="w-12 h-12 flex items-center justify-center rounded-full text-text hover:bg-surface-2 transition-colors"
            aria-label="Back 15 seconds">
            
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}>
            
            {isPlaying ?
            <Pause className="w-7 h-7" /> :

            <Play className="w-7 h-7 ml-0.5" />
            }
          </button>
          <button
            onClick={() => skip(15)}
            className="w-12 h-12 flex items-center justify-center rounded-full text-text hover:bg-surface-2 transition-colors"
            aria-label="Forward 15 seconds">
            
            <SkipForward className="w-6 h-6" />
          </button>
          <div className="w-10" />
        </div>

        {/* Sections list */}
        <div className="px-6 mt-8">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">
            Sections
          </h3>
          <div className="bg-surface-2 rounded-2xl border border-border overflow-hidden">
            {sections.map((section, idx) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${idx !== sections.length - 1 ? 'border-b border-border' : ''} ${isActive ? 'bg-primary/5' : 'hover:bg-surface'}`}>
                  
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${isActive ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}>
                    
                    {section.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-text'}`}>
                      
                      {section.title}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted font-medium">
                    {section.duration}
                  </span>
                </button>);

            })}
          </div>
        </div>
      </div>
    </div>);

}