import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Reset link sent to your email');
    setTimeout(() => navigate('/reset-password'), 1500);
  };
  return (
    <div className="flex flex-col h-full bg-surface px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-2 text-text hover:bg-border transition-colors mb-6">
        
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="flex-1 flex flex-col">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Reset Password</h1>
          <p className="text-text-muted">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="misty@example.com"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              required />
            
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-4 bg-primary text-white rounded-xl font-semibold shadow-md shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all">
            
            Send Link
          </button>
        </form>
      </motion.div>
    </div>);

}