import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Headphones,
  PlayCircle,
  Video,
  Clock,
  ChevronRight
} from 'lucide-react';
import { episodesForPillar, type PodcastMediaType } from '../../data/podcastEpisodes';
import type { PillarOutletContext } from '../pillars/pillarOutletContext';
import { pillarById, type AbPillarId } from '../../utils/abPillars';

type FilterTab = 'all' | PodcastMediaType;

export function Podcast() {
  const navigate = useNavigate();
  const params = useParams<{ pillarId?: string }>();
  const outlet = useOutletContext<PillarOutletContext | undefined>();
  const pillarId = outlet?.pillarId || params.pillarId;
  const pillar = pillarId
    ? pillarById(pillarId as AbPillarId)
    : undefined;
  const inPillarShell = !!outlet?.pillarId;
  const [tab, setTab] = useState<FilterTab>('all');

  const catalog = useMemo(
    () => episodesForPillar(pillarId) ,
    [pillarId]
  );

  const episodes = useMemo(() => {
    if (tab === 'all') return catalog;
    return catalog.filter((ep) => ep.type === tab);
  }, [tab, catalog]);

  const tabs: { id: FilterTab; label: string; icon: typeof Headphones }[] = [
    { id: 'all', label: 'All', icon: PlayCircle },
    { id: 'audio', label: 'Audio', icon: Headphones },
    { id: 'video', label: 'Video', icon: Video }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {!inPillarShell && (
        <div className="px-4 pt-4 pb-3 bg-surface border-b border-border sticky top-0 z-10">
          <div className="h-10 flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors"
              aria-label="Back">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-text">Podcasts</h1>
              <p className="text-[11px] text-text-muted font-medium">
                Stream audio & video with Misty
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-2 text-text border-border'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 flex flex-col gap-3">
        {inPillarShell && (
          <div className="flex gap-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-2 text-text border-border'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl border border-accent-sage/30 bg-accent-sage/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-accent-sage mb-1">
            {pillar ? `${pillar.label} podcasts` : 'Demo streaming'}
          </p>
          <p className="text-sm text-text leading-relaxed">
            {pillar
              ? `Episodes scoped to ${pillar.label}. Open the global Podcasts hub to browse everything.`
              : 'Dedicated podcast hub for Authentic Balance episodes. Audio uses sample streams; video uses embedded players — swap for Misty’s real library later.'}
          </p>
        </div>

        {episodes.length === 0 && (
          <div className="p-6 rounded-2xl bg-surface-2 border border-dashed border-border text-center text-sm text-text-muted">
            No podcasts for this pillar yet.
            <button
              type="button"
              onClick={() => navigate('/podcast')}
              className="block mx-auto mt-3 text-primary font-bold">
              Browse all podcasts
            </button>
          </div>
        )}

        {episodes.map((ep) => (
          <button
            key={ep.id}
            type="button"
            onClick={() => navigate(`/podcast/${ep.id}`)}
            className="w-full text-left bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:border-primary/40 transition-colors flex">
            <div className="w-28 flex-shrink-0 relative bg-surface-2">
              <img
                src={ep.coverImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-black/55 text-white">
                {ep.type === 'video' ? (
                  <Video className="w-3 h-3" />
                ) : (
                  <Headphones className="w-3 h-3" />
                )}
                {ep.type}
              </span>
            </div>
            <div className="flex-1 p-3.5 min-w-0 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                {ep.series}
              </p>
              <h2 className="text-sm font-bold text-text line-clamp-2 leading-snug">
                {ep.title}
              </h2>
              <p className="text-xs text-text-muted mt-1 line-clamp-2">
                {ep.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-text-muted">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {ep.durationLabel}
                </span>
                <span>·</span>
                <span>{ep.publishedLabel}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-text-muted" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
