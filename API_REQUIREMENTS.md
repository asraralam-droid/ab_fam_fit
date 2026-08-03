# Misty AB FamFit - Backend API Requirements

This project is currently frontend-first (React + Redux + localStorage) and does not yet call a real backend.
To complete the project end-to-end, the following Node.js APIs are required.

---

## 1) Recommended Backend Architecture

- Runtime: Node.js (LTS)
- Framework: Express or Fastify
- Database: PostgreSQL
- ORM: Prisma (recommended)
- Auth: JWT access token + refresh token
- File storage: S3/Cloudinary (meal photos, progress photos, post images)
- Real-time (optional but useful): Socket.IO for live activity/community updates

---

## 2) Authentication APIs

Used by login, signup, forgot password, reset password, protected routes, role-based access.

- `POST /api/v1/auth/signup`
  - Create user account (`role`, `name`, `email`, `password`, optional `familyCode`)
- `POST /api/v1/auth/login`
  - Authenticate and return tokens + user profile
- `POST /api/v1/auth/logout`
  - Invalidate refresh token/session
- `POST /api/v1/auth/refresh`
  - Rotate and return new access token
- `GET /api/v1/auth/me`
  - Return currently authenticated user
- `POST /api/v1/auth/forgot-password`
  - Send reset link/token email
- `POST /api/v1/auth/reset-password`
  - Reset password with secure token
- `PATCH /api/v1/auth/change-password`
  - Change password for logged-in user

---

## 3) User Profile + Onboarding APIs

Used by onboarding flow, profile screen, weight tracking, and account data.

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/onboarding/me`
- `POST /api/v1/onboarding/complete`
- `POST /api/v1/progress/weight`
- `GET /api/v1/progress/weight?range=7w`
- `POST /api/v1/progress/photos` (multipart upload)
- `GET /api/v1/progress/photos`

---

## 4) Family / Team APIs

Used by family code workflows, team members view, and family activity.

- `POST /api/v1/families/join`
  - Join family by invite/family code
- `GET /api/v1/families/me`
  - Current family details and code
- `GET /api/v1/families/me/members`
  - Family member list
- `POST /api/v1/families/me/invite`
  - Generate invite link/code (optional if static code strategy)
- `GET /api/v1/families/me/activity`
  - Family feed items
- `POST /api/v1/families/me/activity`
  - Create family activity entry
- `POST /api/v1/families/me/activity/:id/like`
  - Like an activity item

---

## 5) Meals / Food Logging APIs

Used by `LogFood`, profile food tab, and dashboard-level meal stats.

- `POST /api/v1/meals`
  - Create meal log (type, description, time, image)
- `GET /api/v1/meals?from=&to=&page=&limit=`
  - Paginated meal history
- `GET /api/v1/meals/:id`
- `DELETE /api/v1/meals/:id`
- `GET /api/v1/stats/meals/daily?days=7`

---

## 6) Learning + Programs APIs

Used by lessons, lesson completion, JAB books, and programs enrollment/progress.

- `GET /api/v1/learn/modules`
- `GET /api/v1/learn/lessons/:id`
- `POST /api/v1/learn/lessons/:id/complete`
- `GET /api/v1/learn/progress`
- `GET /api/v1/books`
- `GET /api/v1/books/:id`
- `GET /api/v1/books/:id/sections`
- `POST /api/v1/books/:id/progress`
- `GET /api/v1/programs`
- `GET /api/v1/programs/:id`
- `POST /api/v1/programs/:id/enroll`
- `POST /api/v1/programs/:programId/items/:itemId/toggle-complete`

---

## 7) Community APIs

Used by groups, posts, comments, likes, shares, report flow.

- `GET /api/v1/community/groups`
- `POST /api/v1/community/groups/:id/join`
- `DELETE /api/v1/community/groups/:id/join`
- `GET /api/v1/community/posts?groupId=&scope=joined&page=&limit=`
- `POST /api/v1/community/posts`
- `DELETE /api/v1/community/posts/:id`
- `POST /api/v1/community/posts/:id/like`
- `DELETE /api/v1/community/posts/:id/like`
- `POST /api/v1/community/posts/:id/share`
- `GET /api/v1/community/posts/:id/comments`
- `POST /api/v1/community/posts/:id/comments`
- `POST /api/v1/community/posts/:id/report`

---

## 8) Challenges APIs

Used by challenge listing, create challenge, join/leave, and leaderboard.

- `GET /api/v1/challenges`
- `POST /api/v1/challenges`
- `GET /api/v1/challenges/:id`
- `POST /api/v1/challenges/:id/join`
- `POST /api/v1/challenges/:id/leave`
- `GET /api/v1/challenges/:id/leaderboard`

---

## 9) Notifications APIs

Used by notifications center and mark-all-read action.

- `GET /api/v1/notifications?page=&limit=`
- `PATCH /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/mark-all-read`

---

## 10) Affiliate APIs

Used by referral dashboard and earnings summary.

- `GET /api/v1/affiliate/me`
- `GET /api/v1/affiliate/referrals?page=&limit=`
- `GET /api/v1/affiliate/earnings/summary`
- `POST /api/v1/affiliate/code/regenerate` (optional)

---

## 11) Admin APIs (role protected: admin/staff)

Used by admin dashboard, members, promos, pricing/family, and content management.

### 11.1 Admin Dashboard
- `GET /api/v1/admin/dashboard/stats`
  - Daily food logs, signups, activity trends, summary counts

### 11.2 Members Management
- `GET /api/v1/admin/members?page=&limit=&query=&status=`
- `PATCH /api/v1/admin/members/:id/role`
- `PATCH /api/v1/admin/members/:id/status`

### 11.3 Promo Codes
- `GET /api/v1/admin/promos`
- `POST /api/v1/admin/promos`
- `PATCH /api/v1/admin/promos/:id`
- `PATCH /api/v1/admin/promos/:id/toggle`
- `DELETE /api/v1/admin/promos/:id`

### 11.4 Pricing + Family Settings
- `GET /api/v1/admin/pricing/tiers`
- `POST /api/v1/admin/pricing/tiers`
- `PATCH /api/v1/admin/pricing/tiers/:id`
- `PATCH /api/v1/admin/pricing/tiers/:id/toggle`
- `DELETE /api/v1/admin/pricing/tiers/:id`
- `GET /api/v1/admin/family/settings`
- `PATCH /api/v1/admin/family/settings`

### 11.5 Content Management
- Recipes
  - `GET /api/v1/admin/content/recipes`
  - `POST /api/v1/admin/content/recipes`
  - `PATCH /api/v1/admin/content/recipes/:id`
  - `PATCH /api/v1/admin/content/recipes/:id/toggle-status`
  - `DELETE /api/v1/admin/content/recipes/:id`
- Categories
  - `GET /api/v1/admin/content/categories`
  - `POST /api/v1/admin/content/categories`
  - `PATCH /api/v1/admin/content/categories/:id`
  - `DELETE /api/v1/admin/content/categories/:id`
- Lessons
  - `GET /api/v1/admin/content/lessons`
  - `POST /api/v1/admin/content/lessons`
  - `PATCH /api/v1/admin/content/lessons/:id`
  - `PATCH /api/v1/admin/content/lessons/:id/toggle-status`
  - `DELETE /api/v1/admin/content/lessons/:id`
- Quotes
  - `GET /api/v1/admin/content/quotes`
  - `POST /api/v1/admin/content/quotes`
  - `PATCH /api/v1/admin/content/quotes/:id`
  - `PATCH /api/v1/admin/content/quotes/:id/toggle-status`
  - `DELETE /api/v1/admin/content/quotes/:id`
- AI Recipes
  - `GET /api/v1/admin/ai-recipes`
  - `POST /api/v1/admin/ai-recipes`
  - `PATCH /api/v1/admin/ai-recipes/:id`
  - `PATCH /api/v1/admin/ai-recipes/:id/favorite`
  - `DELETE /api/v1/admin/ai-recipes/:id`

---

## 12) Shared Technical Requirements

- Auth middleware for protected routes
- RBAC middleware for admin endpoints
- Validation (`zod`/`joi`) for all request payloads
- Pagination and sorting on list endpoints
- Unified error format:
  - `{ success: false, error: { code, message, details? } }`
- Unified success format:
  - `{ success: true, data, meta? }`
- API versioning: `/api/v1`
- Rate limiting (especially auth and public endpoints)
- File upload endpoint:
  - `POST /api/v1/uploads/image`

---

## 13) Suggested Build Order (Practical)

1. Auth + user profile + onboarding
2. Meals + family activity
3. Community + challenges
4. Learn + programs + books progress
5. Notifications + affiliate
6. Admin modules (dashboard, members, promos, pricing, content)

This order lets the app become usable quickly while still reaching full parity with the current UI.

