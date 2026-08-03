import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authSlice } from '../../store/slices';
import type { UserRole } from '../../store/slices';
import { membershipSlice } from '../../store/membershipSlice';
import { motion } from 'framer-motion';
import { RoleBadge } from '../../components/auth/RoleBadge';
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = (
  location.state as {
    role?: UserRole;
  })?.
  role;
  // If no role selected yet, send back to role select
  if (!role) {
    return (
      <Navigate
        to="/role-select"
        state={{
          intent: 'login'
        }}
        replace />);


  }
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login — role-aware name/email defaults
    const defaultName =
    role === 'admin' ?
    'Alex Admin' :
    role === 'staff' ?
    'Sam Staff' :
    'Misty A.';
    const defaultEmail =
    role === 'admin' ?
    'admin@example.com' :
    role === 'staff' ?
    'staff@example.com' :
    'misty@example.com';
    dispatch(
      authSlice.actions.login({
        user: {
          name: defaultName,
          email: email || defaultEmail,
          role
        },
        familyCode: 'ABFAM2K9'
      })
    );
    // Returning members already paid entry; demo tiers for mock login
    dispatch(
      membershipSlice.actions.setMembershipTier(
        role === 'end-user' ? 'books' : 'coaching'
      )
    );
    navigate('/home');
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
        
        <div className="mb-6 mt-4">
          <h1 className="text-3xl font-bold text-text mb-2">Welcome back</h1>
          <p className="text-text-muted">Log in to continue your journey.</p>
        </div>

        <RoleBadge role={role} intent="login" />

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              required />
            
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              required />
            
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary-hover">
              
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-4 bg-primary text-white rounded-xl font-semibold shadow-md shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all">
            
            Log In
          </button>
        </form>

        <div className="mt-auto pt-8 text-center">
          <p className="text-text-muted text-sm">
            Don't have an account?{' '}
            <Link
              to="/role-select"
              state={{
                intent: 'signup'
              }}
              className="text-primary font-semibold hover:underline">
              
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>);

}