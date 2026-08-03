import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { bestieSlice } from '../../store/slices';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function Bestie() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { messages } = useSelector((state: RootState) => state.bestie);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const mockReplies = [
  "That's a great question about juicing! Remember to always include a leafy green for maximum nutrients.",
  "Progress not perfection. You're doing amazing on your journey!",
  "I'd recommend checking out Module 2 for more insights on that topic.",
  'Hydration is key! Have you hit your water goal today?',
  'Authentic balance is about finding what works for your unique body and family.'];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Add user message
    dispatch(
      bestieSlice.actions.addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: input.trim()
      })
    );
    setInput('');
    setIsTyping(true);
    // Mock AI reply
    setTimeout(() => {
      const randomReply =
      mockReplies[Math.floor(Math.random() * mockReplies.length)];
      dispatch(
        bestieSlice.actions.addMessage({
          id: (Date.now() + 1).toString(),
          role: 'bestie',
          content: randomReply
        })
      );
      setIsTyping(false);
    }, 1500);
  };
  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-surface z-10">
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
            Your AI Companion
          </span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background">
        <AnimatePresence initial={false}>
          {messages.map((msg) =>
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
            
              {msg.role === 'bestie' &&
              <img
                src="/assets/authentic-bestie-avatar.png"
                alt="Authentic Bestie"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-border" />
              }
              <div
              className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface border border-border text-text rounded-tl-sm shadow-sm'}`}>
              
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          )}

          {isTyping &&
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
                className="w-2 h-2 bg-text-muted rounded-full" />
              
                <motion.div
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: 0.2
                }}
                className="w-2 h-2 bg-text-muted rounded-full" />
              
                <motion.div
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: 0.4
                }}
                className="w-2 h-2 bg-text-muted rounded-full" />
              
              </div>
            </motion.div>
          }
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface border-t border-border pb-safe">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about juicing, habits, etc..."
            className="flex-1 h-12 px-4 rounded-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" />
          
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors flex-shrink-0">
            
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>);

}