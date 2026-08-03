import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
export function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/role-select', {
        state: {
          intent: 'login'
        }
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="flex flex-col h-full items-center justify-center bg-surface relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full bg-accent-sage blur-3xl"></div>
        <div className="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-accent-lavender blur-3xl"></div>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        transition={{
          duration: 0.8,
          ease: 'easeOut'
        }}
        className="z-10 flex flex-col items-center">
        
        <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
          <span className="text-white font-extrabold text-4xl tracking-tighter">
            AB
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2 text-center">
          Authentic Balance
        </h1>
        <p className="text-sm text-text-muted tracking-wide font-medium mb-6">
          Institute
        </p>
        <p className="text-accent-sage text-xs uppercase tracking-[0.25em] font-bold">
          Health · Business · Life Coaching
        </p>
      </motion.div>
    </div>);

}