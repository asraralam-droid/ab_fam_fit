import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    navigate('/login');
  };
  return (
    <div className="flex flex-col h-full bg-surface px-6 py-12">
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
        
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-text mb-2">
            Create New Password
          </h1>
          <p className="text-text-muted">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              required />
            
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              required />
            
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-4 bg-primary text-white rounded-xl font-semibold shadow-md shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all">
            
            Reset Password
          </button>
        </form>
      </motion.div>
    </div>);

}