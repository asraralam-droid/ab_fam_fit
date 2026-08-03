import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authSlice } from '../../store/slices';
import type { UserRole } from '../../store/slices';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { RoleBadge } from '../../components/auth/RoleBadge';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
export function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasCode, setHasCode] = useState(false);
  const [familyCode, setFamilyCode] = useState('');
  const role = (
  location.state as {
    role?: UserRole;
  })?.
  role;
  if (!role) {
    return (
      <Navigate
        to="/role-select"
        state={{
          intent: 'signup'
        }}
        replace />);


  }
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasCode && familyCode) {
      toast.success("Joined Misty's family team!");
    }
    dispatch(
      authSlice.actions.login({
        user: {
          name: name || 'New User',
          email: email || 'user@example.com',
          role
        },
        familyCode: hasCode ? familyCode : undefined
      })
    );
    // End-users must pay the $77 book package before onboarding (no free tier).
    // Admin/staff also go through checkout (staff bypass payment UI).
    navigate('/checkout');
  };
  return (
    <div className="flex flex-col h-full bg-surface px-6 py-8 overflow-y-auto">
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
        
        <div className="mb-6 mt-2">
          <h1 className="text-3xl font-bold text-text mb-2">Create Account</h1>
          <p className="text-text-muted">
            Start your health transformation today.
          </p>
        </div>

        <RoleBadge role={role} intent="signup" />

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misty A."
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              required />
            
          </div>

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

          {role === 'end-user' &&
          <div className="mt-2 p-4 rounded-xl bg-surface-2 border border-border flex flex-col gap-3">
              <ToggleSwitch
                label="Have a family code?"
                checked={hasCode}
                onChange={setHasCode}
                size="sm"
              />

              {hasCode &&
            <motion.div
              initial={{
                opacity: 0,
                height: 0
              }}
              animate={{
                opacity: 1,
                height: 'auto'
              }}
              className="mt-4">
              
                  <input
                type="text"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                placeholder="e.g. ABFAM2K9"
                className="w-full h-12 px-4 rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all uppercase" />
              
                </motion.div>
            }
            </div>
          }

          <button
            type="submit"
            className="w-full h-12 mt-6 bg-primary text-white rounded-xl font-semibold shadow-md shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all">
            
            Create Account
          </button>
        </form>

        <div className="mt-8 mb-6 text-center">
          <p className="text-text-muted text-sm">
            Already have an account?{' '}
            <Link
              to="/role-select"
              state={{
                intent: 'login'
              }}
              className="text-primary font-semibold hover:underline">
              
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>);

}