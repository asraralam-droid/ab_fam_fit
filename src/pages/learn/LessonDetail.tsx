import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { programsSlice } from '../../store/programsSlice';
import { normalizeAdminProgram } from '../../store/adminProgramsSlice';
import {
  itemKey,
  legacyItemKey,
  sortedSections
} from '../../utils/programDisplay';
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react';
import { toast } from 'sonner';

const LESSON_ORDER = [
  'lesson-1',
  'lesson-2',
  'lesson-3',
  'lesson-4',
  'lesson-5'
];

export function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rawPrograms = useSelector(
    (state: RootState) => state.adminPrograms.programs
  );
  const completedItemKeys = useSelector((state: RootState) => {
    const keys = state.programs.completedItemKeys;
    return Array.isArray(keys) ? keys : [];
  });
  const enrolledIds = useSelector((state: RootState) => {
    const ids = state.programs.enrolledIds;
    return Array.isArray(ids) ? ids : [];
  });

  const jabProgram = useMemo(() => {
    const programs = rawPrograms.map((p) =>
      normalizeAdminProgram(p as unknown as Record<string, unknown>)
    );
    return (
      programs.find((p) => p.id === 'prog-jab') ??
      programs.find((p) => enrolledIds.includes(p.id)) ??
      null
    );
  }, [rawPrograms, enrolledIds]);

  const programLessonKeys = useMemo(() => {
    if (!jabProgram) return [] as { key: string; legacyKey: string }[];
    const keys: { key: string; legacyKey: string }[] = [];
    for (const section of sortedSections(jabProgram.sections ?? [])) {
      for (const mod of section.videoLessons ?? []) {
        for (const video of mod.videos ?? []) {
          keys.push({
            key: itemKey(jabProgram.id, section.id, 'video', mod.id, video.id),
            legacyKey: legacyItemKey(jabProgram.id, 'video', mod.id, video.id)
          });
        }
      }
      for (const mod of section.audioLessons ?? []) {
        for (const track of mod.tracks ?? []) {
          keys.push({
            key: itemKey(jabProgram.id, section.id, 'audio', mod.id, track.id),
            legacyKey: legacyItemKey(jabProgram.id, 'audio', mod.id, track.id)
          });
        }
      }
      for (const mod of section.textLessons ?? []) {
        for (const part of mod.parts ?? []) {
          keys.push({
            key: itemKey(jabProgram.id, section.id, 'text', mod.id, part.id),
            legacyKey: legacyItemKey(jabProgram.id, 'text', mod.id, part.id)
          });
        }
      }
      for (const mod of section.imageLessons ?? []) {
        for (const img of mod.images ?? []) {
          keys.push({
            key: itemKey(jabProgram.id, section.id, 'image', mod.id, img.id),
            legacyKey: legacyItemKey(jabProgram.id, 'image', mod.id, img.id)
          });
        }
      }
    }
    return keys;
  }, [jabProgram]);

  const lessonIndex = LESSON_ORDER.indexOf(id || '');
  const mapped =
    lessonIndex >= 0 ? programLessonKeys[lessonIndex] : undefined;
  const isCompleted = mapped
    ? completedItemKeys.includes(mapped.key) ||
      completedItemKeys.includes(mapped.legacyKey)
    : false;

  const [isPlaying, setIsPlaying] = useState(false);
  const handleComplete = () => {
    if (!id || isCompleted) return;
    if (mapped && !completedItemKeys.includes(mapped.key)) {
      dispatch(programsSlice.actions.toggleItemComplete(mapped.key));
    }
    toast.success('Lesson completed!');
    setTimeout(() => navigate(-1), 1000);
  };
  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-text-muted uppercase tracking-wider">
          Module 1
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Video Placeholder */}
        <div
          className="w-full aspect-video bg-black relative group cursor-pointer"
          onClick={() => setIsPlaying(!isPlaying)}>
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"
            alt="Lesson Video"
            className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-50' : 'opacity-80'}`}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-primary/90 text-white rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </div>
          )}
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                Playing video...
              </p>
            </div>
          )}
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-text mb-2">
            Understanding Your Gut
          </h1>
          <p className="text-text-muted text-sm mb-6 flex items-center gap-2">
            <span>8 min read</span>
            <span>•</span>
            <span className="text-primary font-medium">Foundations</span>
          </p>

          <div className="prose prose-sm prose-p:text-text prose-p:leading-relaxed prose-headings:text-text prose-strong:text-text max-w-none">
            <p>
              Your gut is often referred to as your "second brain," and for good
              reason. It houses trillions of bacteria that play a crucial role
              in your overall health, from digestion to immunity and even your
              mood.
            </p>
            <h3 className="text-lg font-bold mt-6 mb-3">The Microbiome</h3>
            <p>
              The gut microbiome is a complex ecosystem. When it's in balance,
              you feel energetic, your digestion is smooth, and your immune
              system is strong. When it's out of balance—often due to poor diet,
              stress, or lack of sleep—you might experience bloating, fatigue,
              and other health issues.
            </p>
            <h3 className="text-lg font-bold mt-6 mb-3">
              Feeding the Good Bacteria
            </h3>
            <p>
              One of the best ways to support a healthy gut is through a
              plant-forward diet. Fiber-rich foods like vegetables, fruits,
              legumes, and whole grains act as prebiotics, feeding the
              beneficial bacteria in your gut.
            </p>
            <div className="bg-accent-sage/10 p-4 rounded-xl border border-accent-sage/20 my-6">
              <p className="font-bold text-accent-sage mb-2">Key Takeaway</p>
              <p className="text-sm text-text m-0">
                Aim for at least 30 different types of plant foods each week to
                maximize gut microbiome diversity.
              </p>
            </div>
            <p>
              In the next lesson, we'll explore specific recipes that are
              designed to soothe and support your digestive system.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-md border-t border-border z-30 max-w-[420px] mx-auto pb-safe">
        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={`w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isCompleted ? 'bg-surface-2 text-text-muted border border-border cursor-not-allowed' : 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-[0.98]'}`}>
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5" /> Completed
            </>
          ) : (
            'Mark Complete'
          )}
        </button>
      </div>
    </div>
  );
}
