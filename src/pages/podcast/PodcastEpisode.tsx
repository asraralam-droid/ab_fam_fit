import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Headphones,
  Video
} from 'lucide-react';
import { getPodcastEpisode } from '../../data/podcastEpisodes';

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PodcastEpisode() {
  const navigate = useNavigate();
  const { id } = useParams();
  const episode = id ? getPodcastEpisode(id) : undefined;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [id]);

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
  }, [episode?.audioUrl]);

  if (!episode) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 p-6 bg-background">
        <p className="text-text font-bold">Episode not found</p>
        <button
          type="button"
          onClick={() => navigate('/podcast')}
          className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-bold">
          Back to Podcasts
        </button>
      </div>
    );
  }

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {
        /* autoplay / fetch — ignore for demo */
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (Number(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(duration || audio.duration || 0, audio.currentTime + delta)
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="h-14 px-3 flex items-center gap-2 bg-surface border-b border-border sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate('/podcast')}
          className="p-2 -ml-1 text-text hover:bg-surface-2 rounded-full"
          aria-label="Back">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Now streaming
          </p>
          <h1 className="text-sm font-bold text-text truncate">{episode.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 flex flex-col gap-5">
        {episode.type === 'video' && episode.videoEmbedUrl ? (
          <div className="rounded-2xl overflow-hidden border border-border bg-black aspect-video shadow-sm">
            <iframe
              title={episode.title}
              src={episode.videoEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-border aspect-square max-h-[320px] mx-auto w-full shadow-sm">
            <img
              src={episode.coverImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2 py-1 rounded-full mb-2">
                <Headphones className="w-3 h-3" />
                Audio episode
              </span>
              <p className="text-lg font-bold leading-snug">{episode.title}</p>
              <p className="text-sm text-white/80 mt-1">{episode.host}</p>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            {episode.type === 'video' ? (
              <Video className="w-4 h-4 text-primary" />
            ) : (
              <Headphones className="w-4 h-4 text-primary" />
            )}
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {episode.series}
            </p>
          </div>
          <h2 className="text-xl font-bold text-text">{episode.title}</h2>
          <p className="text-sm text-text-muted mt-1">
            {episode.host} · {episode.durationLabel} · {episode.publishedLabel}
          </p>
          <p className="text-sm text-text mt-3 leading-relaxed">
            {episode.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {episode.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {episode.type === 'audio' && episode.audioUrl && (
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
            <audio ref={audioRef} src={episode.audioUrl} preload="metadata" muted={muted} />
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full accent-primary mb-4"
              aria-label="Seek"
            />
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => skip(-15)}
                className="p-2 text-text hover:bg-surface-2 rounded-full"
                aria-label="Back 15 seconds">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25"
                aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => skip(15)}
                className="p-2 text-text hover:bg-surface-2 rounded-full"
                aria-label="Forward 15 seconds">
                <SkipForward className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const audio = audioRef.current;
                  if (!audio) return;
                  audio.muted = !muted;
                  setMuted(!muted);
                }}
                className="p-2 text-text hover:bg-surface-2 rounded-full"
                aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-text-muted text-center mt-3">
              Streaming demo audio · replace with Misty’s episode files anytime
            </p>
          </div>
        )}

        {episode.type === 'video' && (
          <p className="text-[11px] text-text-muted text-center">
            Embedded video stream · replace embed URL with Misty’s podcast video
            host
          </p>
        )}
      </div>
    </div>
  );
}
