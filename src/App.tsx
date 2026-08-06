import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from './store';
import { ThemeProvider } from './components/ThemeProvider';
// Layouts
import { MobileFrame } from './components/layout/MobileFrame';
import { AppShell } from './components/layout/AppShell';
// Auth Pages
import { Splash } from './pages/auth/Splash';
import { RoleSelect } from './pages/auth/RoleSelect';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
// Onboarding & Checkout
import { Checkout } from './pages/checkout/Checkout';
import { Onboarding } from './pages/onboarding/Onboarding';
import { WorkWithMisty } from './pages/membership/WorkWithMisty';
// Main Pages
import { Home } from './pages/home/Home';
import { LogFood } from './pages/log/LogFood';
import { Recipes } from './pages/recipes/Recipes';
import { RecipeDetail } from './pages/recipes/RecipeDetail';
import { Learn } from './pages/learn/Learn';
import { LessonDetail } from './pages/learn/LessonDetail';
import { BookRead } from './pages/learn/BookRead';
import { BookListen } from './pages/learn/BookListen';
import { Profile } from './pages/profile/Profile';
import { Bestie } from './pages/bestie/Bestie';
import { Notifications } from './pages/notifications/Notifications';
// New Pages
import { Discover } from './pages/discover/Discover';
import { Activity } from './pages/activity/Activity';
import { Community } from './pages/community/Community';
import { CommunityEvents } from './pages/community/CommunityEvents';
import { CommunityJoin } from './pages/community/CommunityJoin';
import { Challenges } from './pages/challenges/Challenges';
import { ChallengeDetail } from './pages/challenges/ChallengeDetail';
import { ChallengeCreate } from './pages/challenges/ChallengeCreate';
import { AffiliateShell } from './pages/affiliate/AffiliateShell';
import { AffiliateJoin } from './pages/affiliate/AffiliateJoin';
import { AffiliateHome } from './pages/affiliate/AffiliateHome';
import { AffiliateEarnings } from './pages/affiliate/AffiliateEarnings';
import { AffiliateProfile } from './pages/affiliate/AffiliateProfile';
import { AffiliateAccountSettings } from './pages/affiliate/AffiliateAccountSettings';
import { AffiliatePaymentMethods } from './pages/affiliate/AffiliatePaymentMethods';
import { AffiliateHelpSupport } from './pages/affiliate/AffiliateHelpSupport';
import { AdminAffiliateOverview } from './pages/affiliate/admin/AdminAffiliateOverview';
import { AdminAffiliatesList } from './pages/affiliate/admin/AdminAffiliatesList';
import { AdminCommissionRules } from './pages/affiliate/admin/AdminCommissionRules';
import { AdminReferralsList } from './pages/affiliate/admin/AdminReferralsList';
import { AdminPayouts } from './pages/affiliate/admin/AdminPayouts';
import { AdminFraud } from './pages/affiliate/admin/AdminFraud';
import { Programs } from './pages/programs/Programs';
import { ProgramDetail } from './pages/programs/ProgramDetail';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMembers } from './pages/admin/AdminMembers';
import { AdminPromos } from './pages/admin/AdminPromos';
import { AdminRecipes } from './pages/admin/AdminRecipes';
import { AdminPricing } from './pages/admin/AdminPricing';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminPrograms } from './pages/admin/AdminPrograms';
import { AdminActivity } from './pages/admin/AdminActivity';
import { Chat } from './pages/chat/Chat';
import { Podcast } from './pages/podcast/Podcast';
import { PodcastEpisode } from './pages/podcast/PodcastEpisode';
import { PillarShell } from './pages/pillars/PillarShell';
import { PillarHome } from './pages/pillars/PillarHome';
import { PillarIntroduction } from './pages/pillars/PillarIntroduction';
import { PillarCheckIn } from './pages/pillars/PillarCheckIn';
import { PillarLessons } from './pages/pillars/PillarLessons';
import { PillarVideos } from './pages/pillars/PillarVideos';
import { PillarBooks } from './pages/pillars/PillarBooks';
import { PillarWorksheets } from './pages/pillars/PillarWorksheets';
import { PillarProducts } from './pages/pillars/PillarProductsPage';
import { PillarProgress } from './pages/pillars/PillarProgress';
export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}>
          <MobileFrame>
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<Splash />} />
              <Route path="/role-select" element={<RoleSelect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Onboarding Routes */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Authenticated Routes (with AppShell) */}
              <Route element={<AppShell />}>
                <Route path="/home" element={<Home />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/recipes/:id" element={<RecipeDetail />} />
                <Route path="/log" element={<LogFood />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/lesson/:id" element={<LessonDetail />} />
                <Route path="/learn/book/:id/read" element={<BookRead />} />
                <Route path="/learn/book/:id/listen" element={<BookListen />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/bestie" element={<Bestie />} />
                <Route path="/work-with-misty" element={<WorkWithMisty />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/chat" element={<Chat />} />

                {/* New feature routes */}
                <Route path="/discover" element={<Discover />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community/join/:groupId" element={<CommunityJoin />} />
                <Route path="/community/events" element={<CommunityEvents />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/challenges/new" element={<ChallengeCreate />} />
                <Route path="/challenges/:id" element={<ChallengeDetail />} />
                <Route path="/affiliate" element={<AffiliateShell />}>
                  <Route index element={<AffiliateHome />} />
                  <Route path="join" element={<AffiliateJoin />} />
                  <Route path="earnings" element={<AffiliateEarnings />} />
                  <Route path="profile" element={<AffiliateProfile />} />
                  <Route path="profile/settings" element={<AffiliateAccountSettings />} />
                  <Route path="profile/payment" element={<AffiliatePaymentMethods />} />
                  <Route path="profile/help" element={<AffiliateHelpSupport />} />
                </Route>
                <Route path="/programs" element={<Programs />} />
                <Route path="/programs/:id" element={<ProgramDetail />} />
                <Route path="/programs/:id/section/:sectionId" element={<ProgramDetail />} />
                <Route path="/podcast" element={<Podcast />} />
                <Route path="/podcast/:id" element={<PodcastEpisode />} />
                <Route path="/pillars/:pillarId" element={<PillarShell />}>
                  <Route index element={<PillarHome />} />
                  <Route path="introduction" element={<PillarIntroduction />} />
                  <Route path="check-in" element={<PillarCheckIn />} />
                  <Route path="lessons" element={<PillarLessons />} />
                  <Route path="videos" element={<PillarVideos />} />
                  <Route path="podcast" element={<Podcast />} />
                  <Route path="books" element={<PillarBooks />} />
                  <Route path="worksheets" element={<PillarWorksheets />} />
                  <Route path="challenges" element={<Challenges />} />
                  <Route path="products" element={<PillarProducts />} />
                  <Route path="bestie" element={<Bestie />} />
                  <Route path="progress" element={<PillarProgress />} />
                </Route>
                <Route path="/dashboard" element={<Navigate to="/home" replace />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/members" element={<AdminMembers />} />
                <Route path="/admin/promos" element={<AdminPromos />} />
                <Route path="/admin/recipes" element={<AdminRecipes />} />
                <Route path="/admin/pricing" element={<AdminPricing />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/admin/programs" element={<AdminPrograms />} />
                <Route path="/admin/activity" element={<AdminActivity />} />
                <Route path="/admin/affiliate" element={<AdminAffiliateOverview />} />
                <Route path="/admin/affiliate/affiliates" element={<AdminAffiliatesList />} />
                <Route path="/admin/affiliate/rules" element={<AdminCommissionRules />} />
                <Route path="/admin/affiliate/referrals" element={<AdminReferralsList />} />
                <Route path="/admin/affiliate/payouts" element={<AdminPayouts />} />
                <Route path="/admin/affiliate/fraud" element={<AdminFraud />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-center" />
          </MobileFrame>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>);

}