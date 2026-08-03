import React, { useState, Component } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Briefcase, User, ChevronRight, ArrowLeft } from 'lucide-react';
import type { UserRole } from '../../store/slices';
type RoleOption = {
  id: UserRole;
  label: string;
  description: string;
  icon: ComponentType<{
    className?: string;
  }>;
};
const roles: RoleOption[] = [
{
  id: 'end-user',
  label: 'Member',
  description: 'Track your wellness journey with your family.',
  icon: User
},
{
  id: 'staff',
  label: 'Staff',
  description: 'Support members and manage day-to-day content.',
  icon: Briefcase
},
{
  id: 'admin',
  label: 'Admin',
  description: 'Full access to manage the platform and users.',
  icon: Shield
}];

export function RoleSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  // intent: which screen to go to after selecting a role
  const intent: 'login' | 'signup' =
  (
  location.state as {
    intent?: 'login' | 'signup';
  })?.
  intent ?? 'login';
  const [selected, setSelected] = useState<UserRole>('end-user');
  const handleContinue = () => {
    navigate(intent === 'signup' ? '/signup' : '/login', {
      state: {
        role: selected
      }
    });
  };
  return (
    <div className="flex flex-col h-full bg-surface px-6 py-8 overflow-y-auto">
      <button
        onClick={() => navigate('/')}
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
          <h1 className="text-3xl font-bold text-text mb-2">
            Choose your role
          </h1>
          <p className="text-text-muted">
            Select how you'll be using Authentic Balance.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-surface hover:border-primary/40'}`}>
                
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted'}`}>
                  
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-text'}`}>
                    
                    {role.label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 leading-snug">
                    {role.description}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-border bg-surface'}`}>
                  
                  {isSelected &&
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  }
                </div>
              </button>);

          })}
        </div>

        <button
          onClick={handleContinue}
          className="w-full h-12 bg-primary text-white rounded-xl font-semibold shadow-md shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="mt-auto pt-8 text-center">
          <p className="text-text-muted text-sm">
            {intent === 'signup' ?
            <>
                Already have an account?{' '}
                <Link
                to="/role-select"
                state={{
                  intent: 'login'
                }}
                className="text-primary font-semibold hover:underline"
                replace>
                
                  Log in
                </Link>
              </> :

            <>
                New to Authentic Balance?{' '}
                <Link
                to="/role-select"
                state={{
                  intent: 'signup'
                }}
                className="text-primary font-semibold hover:underline"
                replace>
                
                  Sign up
                </Link>
              </>
            }
          </p>
        </div>
      </motion.div>
    </div>);

}