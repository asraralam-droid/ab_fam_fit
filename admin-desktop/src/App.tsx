import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from './store';
import { ThemeProvider } from './components/ThemeProvider';
import { AdminDesktopLayout } from './layouts/AdminDesktopLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMembers } from './pages/admin/AdminMembers';
import { AdminPromos } from './pages/admin/AdminPromos';
import { AdminRecipes } from './pages/admin/AdminRecipes';
import { AdminPricing } from './pages/admin/AdminPricing';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminPrograms } from './pages/admin/AdminPrograms';
import { AdminActivity } from './pages/admin/AdminActivity';
import { AdminAffiliateOverview } from './pages/affiliate/admin/AdminAffiliateOverview';
import { AdminAffiliatesList } from './pages/affiliate/admin/AdminAffiliatesList';
import { AdminCommissionRules } from './pages/affiliate/admin/AdminCommissionRules';
import { AdminReferralsList } from './pages/affiliate/admin/AdminReferralsList';
import { AdminPayouts } from './pages/affiliate/admin/AdminPayouts';
import { AdminFraud } from './pages/affiliate/admin/AdminFraud';

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route element={<AdminDesktopLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/members" element={<AdminMembers />} />
              <Route path="/admin/promos" element={<AdminPromos />} />
              <Route path="/admin/recipes" element={<AdminRecipes />} />
              <Route path="/admin/pricing" element={<AdminPricing />} />
              <Route path="/admin/content" element={<AdminContent />} />
              <Route path="/admin/programs" element={<AdminPrograms />} />
              <Route path="/admin/activity" element={<AdminActivity />} />
              <Route path="/admin/affiliate" element={<AdminAffiliateOverview />} />
              <Route
                path="/admin/affiliate/affiliates"
                element={<AdminAffiliatesList />}
              />
              <Route
                path="/admin/affiliate/rules"
                element={<AdminCommissionRules />}
              />
              <Route
                path="/admin/affiliate/referrals"
                element={<AdminReferralsList />}
              />
              <Route path="/admin/affiliate/payouts" element={<AdminPayouts />} />
              <Route path="/admin/affiliate/fraud" element={<AdminFraud />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
