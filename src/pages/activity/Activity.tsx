import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { activitySlice } from '../../store/slices';
import {
  ArrowLeft,
  Heart,
  Plus,
  Trophy,
  Utensils,
  Dumbbell } from
'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SheetModal } from '../../components/modals';
const filters = ['All', 'Meals', 'Workouts', 'Wins'] as const;
type Filter = (typeof filters)[number];
const iconFor = (type: string) => {
  switch (type) {
    case 'meal':
      return Utensils;
    case 'workout':
      return Dumbbell;
    case 'win':
      return Trophy;
    default:
      return Heart;
  }
};
export function Activity() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { feed } = useSelector((state: RootState) => state.activity);
  const { familyCode } = useSelector((state: RootState) => state.auth);
  const { familyMembers } = useSelector((state: RootState) => state.profile);
  const [filter, setFilter] = useState<Filter>('All');
  const [showSheet, setShowSheet] = useState(false);
  const filtered = feed.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Meals') return item.type === 'meal';
    if (filter === 'Workouts') return item.type === 'workout';
    if (filter === 'Wins')
    return item.type === 'win' || item.type === 'check-in';
    return true;
  });
  const post = (label: string) => {
    dispatch(
      activitySlice.actions.addActivity({
        id: Date.now().toString(),
        userId: 'misty',
        userName: 'Misty',
        type: 'win',
        content: label,
        time: 'just now',
        likes: 0
      })
    );
    toast.success('Posted to family feed');
    setShowSheet(false);
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-32 bg-surface">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold text-text">Family Activity</h1>
          <p className="text-[11px] text-text-muted">
            {familyMembers.length} members
          </p>
        </div>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-surface-2 border border-border border-dashed p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted">
              Family Code
            </p>
            <p className="text-lg font-bold text-primary tracking-widest">
              {familyCode || 'ABFAM2K9'}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(familyCode || 'ABFAM2K9');
              toast.success('Code copied');
            }}
            className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg bg-surface border border-border">
            
            Copy
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-3 hide-scrollbar">
          {filters.map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-surface border border-border text-text hover:bg-surface-2'}`}>
            
              {f}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3">
        {filtered.length === 0 ?
        <div className="p-8 text-center text-text-muted text-sm">
            No {filter.toLowerCase()} yet — be the first.
          </div> :

        filtered.map((item) => {
          const Icon = iconFor(item.type);
          return (
            <motion.div
              key={item.id}
              initial={{
                opacity: 0,
                y: 8
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
              
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                    {item.userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-text text-sm">
                        {item.userName}
                      </span>
                      <span className="text-[10px] text-text-muted bg-surface-2 px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-text mb-2">{item.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">
                        {item.time}
                      </span>
                      <button
                      onClick={() =>
                      dispatch(activitySlice.actions.likeActivity(item.id))
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-red-500 transition-colors">
                      
                        <Heart className="w-4 h-4" />
                        {item.likes}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>);

        })
        }
      </div>

      {/* Floating action button */}
      <button
        onClick={() => setShowSheet(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-hover transition-all active:scale-95 z-20"
        style={{
          left: 'calc(50% + 210px - 72px)'
        }}>
        
        <Plus className="w-6 h-6" />
      </button>

      <SheetModal
        open={showSheet}
        onClose={() => setShowSheet(false)}
        title="Share with family">
            <div className="flex flex-col gap-2">
              {[
            {
              label: 'Log a workout',
              text: 'just logged a workout 💪'
            },
            {
              label: 'Share a win',
              text: 'shared a win 🎉'
            },
            {
              label: 'Post a check-in',
              text: 'posted a check-in 💜'
            }].
            map((opt) =>
            <button
              key={opt.label}
              onClick={() => post(opt.text)}
              className="w-full p-4 text-left rounded-xl bg-surface-2 hover:bg-border transition-colors font-semibold text-text">
              
                  {opt.label}
                </button>
            )}
            </div>
      </SheetModal>
    </div>);

}