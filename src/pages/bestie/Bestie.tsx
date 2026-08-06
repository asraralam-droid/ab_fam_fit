import { useEffect, useMemo, useState, useRef } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { RootState } from '../../store';
import { bestieSlice, isDumpedBestiePrompt } from '../../store/slices';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBestieReply } from '../../utils/bestieReply';
import {
  buildBestieUserContext,
  buildBestieWelcome,
  getContextChips,
  getPersonalizedSuggestedPrompts
} from '../../utils/bestieUserContext';
import type { PillarOutletContext } from '../pillars/pillarOutletContext';
import { pillarById, type AbPillarId } from '../../utils/abPillars';

type BestieNavState = {
  seedMessage?: string;
  notificationId?: string;
};

function seedMessageId(notificationId: string | undefined, seed: string) {
  if (notificationId) return `notif-${notificationId}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `seed-${hash.toString(36)}`;
}

export function Bestie() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ pillarId?: string }>();
  const outlet = useOutletContext<PillarOutletContext | undefined>();
  const pillarId = outlet?.pillarId || params.pillarId;
  const pillar = pillarId
    ? pillarById(pillarId as AbPillarId)
    : undefined;
  const inPillarShell = !!outlet?.pillarId;
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const auth = useSelector((s: RootState) => s.auth);
  const onboarding = useSelector((s: RootState) => s.onboarding);
  const membership = useSelector((s: RootState) => s.membership);
  const programs = useSelector((s: RootState) => s.programs);
  const adminPrograms = useSelector((s: RootState) => s.adminPrograms);
  const home = useSelector((s: RootState) => s.home);
  const meals = useSelector((s: RootState) => s.meals);
  const { messages } = useSelector((s: RootState) => s.bestie);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeAppliedRef = useRef(false);
  const repairedRef = useRef(false);
  const mountedRef = useRef(true);

  const userContext = useMemo(
    () =>
      buildBestieUserContext({
        auth,
        onboarding,
        membership,
        programs,
        adminPrograms,
        home,
        meals
      }),
    [auth, onboarding, membership, programs, adminPrograms, home, meals]
  );
  const contextChips = useMemo(() => getContextChips(userContext), [userContext]);
  const suggestedPrompts = useMemo(
    () => getPersonalizedSuggestedPrompts(userContext),
    [userContext]
  );
  const showPrompts = messages.length <= 1 && !isTyping;
  const welcomeText = useMemo(() => buildBestieWelcome(userContext), [userContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Personalize opening greeting from Redux profile / progress (demo MCP-style context).
  useEffect(() => {
    if (welcomeAppliedRef.current) return;
    if (messages.length !== 1 || messages[0]?.role !== 'bestie') return;
    if (messages[0].content === welcomeText) {
      welcomeAppliedRef.current = true;
      return;
    }
    welcomeAppliedRef.current = true;
    dispatch(bestieSlice.actions.setWelcomeMessage(welcomeText));
  }, [dispatch, messages, welcomeText]);

  const queueBestieReply = (userMessageId: string, userText: string) => {
    const replyId = `${userMessageId}-reply`;
    const existing = store.getState().bestie.messages;
    if (existing.some((m) => m.id === replyId)) return;

    if (mountedRef.current) setIsTyping(true);
    const { reply } = getBestieReply(userText, userContext);
    // Do not clear this timer on unmount — Strict Mode remounts would drop the reply.
    window.setTimeout(() => {
      const latest = store.getState().bestie.messages;
      if (!latest.some((m) => m.id === replyId)) {
        dispatch(
          bestieSlice.actions.addMessage({
            id: replyId,
            role: 'bestie',
            content: reply
          })
        );
      }
      if (mountedRef.current) setIsTyping(false);
    }, 900);
  };

  const postUserAsk = (text: string, messageId: string) => {
    const content = text.trim();
    if (!content) return;

    const existing = store.getState().bestie.messages;
    const alreadyUser = existing.some(
      (m) => m.id === messageId || (m.role === 'user' && m.content === content)
    );
    if (!alreadyUser) {
      dispatch(
        bestieSlice.actions.addMessage({
          id: messageId,
          role: 'user',
          content
        })
      );
    }

    const after = store.getState().bestie.messages;
    const userIdx = after.findIndex(
      (m) => m.id === messageId || (m.role === 'user' && m.content === content)
    );
    const next = userIdx >= 0 ? after[userIdx + 1] : undefined;
    if (next?.role === 'bestie' && !isDumpedBestiePrompt(next.content)) return;

    queueBestieReply(messageId, content);
  };

  // Fix older chats where notification text was stored as Bestie messages.
  useEffect(() => {
    if (repairedRef.current) return;
    repairedRef.current = true;

    dispatch(bestieSlice.actions.repairDumpedPrompts());

    const msgs = store.getState().bestie.messages;
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i];
      if (m.role !== 'user' || !isDumpedBestiePrompt(m.content)) continue;
      const next = msgs[i + 1];
      if (next?.role === 'bestie' && !isDumpedBestiePrompt(next.content)) continue;
      queueBestieReply(m.id, m.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time history repair
  }, [dispatch, store]);

  // When opened from a notification / "Ask Bestie" CTA: ask on the user side, Bestie answers.
  useEffect(() => {
    const navState = (location.state || {}) as BestieNavState;
    const seed = navState.seedMessage?.trim();
    if (!seed) return;

    const messageId = seedMessageId(navState.notificationId, seed);

    // Clear nav state so refresh / back doesn't re-seed.
    navigate(location.pathname, { replace: true, state: {} });

    postUserAsk(seed, messageId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when nav seed arrives
  }, [location.state, location.pathname, navigate]);

  const sendMessage = (text: string) => {
    const content = text.trim();
    if (!content || isTyping) return;
    setInput('');
    postUserAsk(content, `user-${Date.now()}`);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="px-4 pt-3 pb-3 border-b border-border bg-surface z-10">
        {!inPillarShell && (
          <div className="h-10 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
              <h1 className="text-lg font-bold text-text flex items-center gap-2">
                <img
                  src="/assets/authentic-bestie-avatar.png"
                  alt=""
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-accent-sage/40"
                />
                Authentic Bestie
              </h1>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                Personalized for you
              </span>
            </div>
            <div className="w-10"></div>
          </div>
        )}

        {pillar && (
          <div
            className={`rounded-xl border border-accent-sage/30 bg-accent-sage/10 px-3 py-2 ${
              inPillarShell ? '' : 'mt-2'
            }`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent-sage">
              Pillar-scoped Bestie
            </p>
            <p className="text-xs text-text mt-0.5">
              Coaching focus: {pillar.label} — {pillar.description}
            </p>
          </div>
        )}

        {contextChips.length > 0 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1">
            {contextChips.map((chip) => (
              <span
                key={chip}
                className="flex-shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full bg-accent-sage/15 text-text border border-accent-sage/25">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {msg.role === 'bestie' && (
                <img
                  src="/assets/authentic-bestie-avatar.png"
                  alt="Authentic Bestie"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-border"
                />
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface border border-border text-text rounded-tl-sm shadow-sm'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.9
              }}
              className="flex justify-start">
              <div className="bg-surface border border-border p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                <motion.div
                  animate={{
                    y: [0, -5, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: 0
                  }}
                  className="w-2 h-2 bg-text-muted rounded-full"
                />
                <motion.div
                  animate={{
                    y: [0, -5, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: 0.2
                  }}
                  className="w-2 h-2 bg-text-muted rounded-full"
                />
                <motion.div
                  animate={{
                    y: [0, -5, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: 0.4
                  }}
                  className="w-2 h-2 bg-text-muted rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {showPrompts && suggestedPrompts.length > 0 && (
        <div className="px-4 pb-2 bg-surface border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-2 pt-3">
            Try asking
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="flex-shrink-0 text-xs px-3 py-2 rounded-full border border-border bg-surface-2 text-text hover:border-primary hover:text-primary transition-colors whitespace-nowrap">
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div
        className={`p-4 bg-surface pb-safe ${showPrompts ? '' : 'border-t border-border'}`}>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your progress, goals, meals..."
            className="flex-1 h-12 px-4 rounded-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors flex-shrink-0">
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
