import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ReportReasonCode } from '../utils/reportReasons';

export interface CommunityComment {
  id: string;
  author: string;
  avatarColor: string;
  content: string;
  time: string;
  parentId?: string; // set when replying to a top-level comment
}

export interface CommunityPost {
  id: string;
  author: string;
  avatarColor: string;
  group: string; // group id
  content: string;
  image?: string;
  time: string;
  likes: number;
  liked: boolean;
  shares: number;
  comments: CommunityComment[];
  pinned?: boolean;
  commentsDisabled?: boolean;
}

export type ReportReasonCode =
  | 'abusive'
  | 'harassment'
  | 'hate_speech'
  | 'spam'
  | 'inappropriate'
  | 'misinformation'
  | 'profanity'
  | 'other';

export interface ReportedPost {
  id: string;
  reportType: 'post' | 'user';
  postId?: string;
  targetUserId?: string;
  targetUserName?: string;
  reportedBy: string;
  reasonCode: ReportReasonCode;
  reason: string;
  description?: string;
  reportedAt: string;
  authorName?: string;
  authorUserId?: string;
}

export interface BannedUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  bannedBy: string;
  reason?: string;
  bannedAt: string;
  reportId?: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  members: number;
  memberIds: string[];
  adminIds?: string[];
  description: string;
  joined: boolean;
  color: string;
  icon: string; // emoji
  /** AB pillar this community belongs to (null = nonprofit / special). */
  pillarId?: 'health-wellness' | 'business' | 'life-coaching' | null;
  /** Team Pursuit nonprofit — no AB FamFit cross-links. */
  isNonprofit?: boolean;
  /** Entry fee to join this community after assessment (0 = included). */
  entryPrice?: number;
  landingTagline?: string;
}

export type EventColor = 'orange' | 'purple' | 'blue' | 'green' | 'red';
export type EventLocationType = 'in-person' | 'virtual' | 'hybrid';
export type EventAttendeeScope = 'all-members' | 'group-members' | 'invite-only';

export interface CommunityEvent {
  id: string;
  title: string;
  color: EventColor;
  startAt: string;
  endAt: string;
  timezone: string;
  recurring: boolean;
  location: EventLocationType;
  link: string;
  description: string;
  hideLocation: boolean;
  imageUrl?: string;
  attendeeScope: EventAttendeeScope;
  remindAttendees: boolean;
  hideAttendees: boolean;
  isPaid: boolean;
  price?: number;
  currency?: string;
  paymentLink?: string;
  attendeeIds?: string[];
}

export const EVENT_COLOR_HEX: Record<EventColor, string> = {
  orange: '#F97316',
  purple: '#6D28D9',
  blue: '#2563EB',
  green: '#16A34A',
  red: '#DC2626'
};

interface CommunityState {
  posts: CommunityPost[];
  groups: CommunityGroup[];
  events: CommunityEvent[];
  reportedPosts: ReportedPost[];
  bannedUsers: BannedUser[];
  selectedGroup: string; // 'all' | group id
}

const initialState: CommunityState = {
  groups: [
  {
    id: 'g-health',
    name: 'Health & Wellness',
    members: 128,
    memberIds: ['u2', 'u3', 'u4'],
    adminIds: ['u1'],
    description:
      'Fitness, nutrition, juicing, and daily wellness accountability.',
    joined: false,
    color: '#7E9568',
    icon: '🌿',
    pillarId: 'health-wellness',
    entryPrice: 0,
    landingTagline: 'Build lasting health habits with Authentic Balance.'
  },
  {
    id: 'g-business',
    name: 'Business Consulting',
    members: 64,
    memberIds: ['u5', 'u7'],
    adminIds: ['u1'],
    description:
      'Strategy, front-end consulting, and back-end automation with Misty.',
    joined: false,
    color: '#2D1B5E',
    icon: '💼',
    pillarId: 'business',
    entryPrice: 77,
    landingTagline: 'Grow your business the Authentic Balance way.'
  },
  {
    id: 'g-coaching',
    name: 'Life Coaching / Mental Wellness',
    members: 92,
    memberIds: ['u3', 'u8'],
    adminIds: ['u1'],
    description:
      'Mindset, emotional wellness, and life-coaching accountability.',
    joined: false,
    color: '#8B7BB8',
    icon: '🧠',
    pillarId: 'life-coaching',
    entryPrice: 0,
    landingTagline: 'Clarity, calm, and coaching support.'
  },
  {
    id: 'g-team',
    name: 'Team Pursuit Hub',
    members: 5,
    memberIds: ['u1', 'u2', 'u3', 'u5', 'u7'],
    adminIds: ['u1'],
    description:
      "Team Pursuit nonprofit community. Separate from Authentic Balance business — promo codes connect the two when needed.",
    joined: false,
    color: '#B89150',
    icon: '🦁',
    pillarId: null,
    isNonprofit: true,
    entryPrice: 0,
    landingTagline: 'Nonprofit community — protect this space together.'
  },
  {
    id: 'g-juice',
    name: 'Juice Cleanse Crew',
    members: 4,
    memberIds: ['u2', 'u3', 'u4', 'u7'],
    adminIds: ['u2'],
    description: 'For everyone running juice resets together.',
    joined: false,
    color: '#7E9568',
    icon: '🥬',
    pillarId: 'health-wellness',
    entryPrice: 0,
    landingTagline: 'Juice resets with community support.'
  },
  {
    id: 'g-recipes',
    name: 'Plant-Based Recipes',
    members: 3,
    memberIds: ['u3', 'u7', 'u9'],
    description: 'Recipe swaps, meal prep ideas, and plant-forward eats.',
    joined: false,
    color: '#7E9568',
    icon: '🥗',
    pillarId: 'health-wellness',
    entryPrice: 0,
    landingTagline: 'Share meals that fuel authentic balance.'
  }],


  posts: [
  {
    id: 'p1',
    author: 'Misty Smith',
    avatarColor: 'primary',
    group: 'g-team',
    content:
    "Welcome to the Team Pursuit Community Hub! This is your home. You belong here. Share what's on your mind, lift others up, and let's protect this space together.",
    time: '8mo ago',
    likes: 142,
    liked: true,
    shares: 18,
    comments: [
    {
      id: 'c1',
      author: 'Jordan Lee',
      avatarColor: 'sage',
      content: 'So happy to be here 💛',
      time: '8mo ago'
    },
    {
      id: 'c1r1',
      author: 'Misty Smith',
      avatarColor: 'primary',
      content: 'So glad you found us, Jordan!',
      time: '8mo ago',
      parentId: 'c1'
    },
    {
      id: 'c1r2',
      author: 'Alex Chen',
      avatarColor: 'lavender',
      content: 'Same here — this community is the best.',
      time: '7mo ago',
      parentId: 'c1'
    },
    {
      id: 'c2',
      author: 'Sam Rivera',
      avatarColor: 'lavender',
      content: 'Block by block. Love this energy.',
      time: '7mo ago'
    },
    {
      id: 'c2r1',
      author: 'Priya Singh',
      avatarColor: 'gold',
      content: 'That motto got me through my first month.',
      time: '7mo ago',
      parentId: 'c2'
    }]

  },
  {
    id: 'p2',
    author: 'Misty Smith',
    avatarColor: 'primary',
    group: 'g-team',
    content:
    'Community Resources & Opportunities Now Live\n\nOur Resource Directory is officially open under the "Learning" tab. You can now explore: • Job and training opportunities • Youth programs • Support services • Business and organization directories',
    time: '5mo ago',
    likes: 68,
    liked: false,
    shares: 24,
    comments: [
    {
      id: 'c2a',
      author: 'Alex Chen',
      avatarColor: 'lavender',
      content: 'Just bookmarked the job board — thank you!',
      time: '5mo ago'
    },
    {
      id: 'c2a-r1',
      author: 'Misty Smith',
      avatarColor: 'primary',
      content: 'Happy to help! New listings go up every Monday.',
      time: '5mo ago',
      parentId: 'c2a'
    },
    {
      id: 'c2b',
      author: 'Diana K.',
      avatarColor: 'sage',
      content: 'The youth programs section is incredible.',
      time: '4mo ago'
    },
    {
      id: 'c2b-r1',
      author: 'Sam Rivera',
      avatarColor: 'lavender',
      content: 'My niece signed up last week!',
      time: '4mo ago',
      parentId: 'c2b'
    },
    {
      id: 'c2b-r2',
      author: 'Diana K.',
      avatarColor: 'sage',
      content: 'That makes my day 🙌',
      time: '4mo ago',
      parentId: 'c2b'
    }]
  },
  {
    id: 'p3',
    author: 'Jordan Lee',
    avatarColor: 'sage',
    group: 'g-juice',
    content:
    'Just finished day 3 of the green juice reset and I feel AMAZING. Energy is through the roof. Anyone else on this challenge?',
    image:
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80',
    time: '2h ago',
    likes: 32,
    liked: false,
    shares: 4,
    comments: [
    {
      id: 'c3',
      author: 'Sam Rivera',
      avatarColor: 'lavender',
      content: 'Day 2 here — same! Cravings finally calming down.',
      time: '1h ago'
    },
    {
      id: 'c4',
      author: 'Priya Singh',
      avatarColor: 'gold',
      content: 'Joining tomorrow!',
      time: '45m ago'
    },
    {
      id: 'c4r',
      author: 'Jordan Lee',
      avatarColor: 'sage',
      content: 'Welcome! Day 1 is the hardest — you got this.',
      time: '30m ago',
      parentId: 'c3'
    },
    {
      id: 'c3r2',
      author: 'Misty Smith',
      avatarColor: 'primary',
      content: 'Keep going — day 4 is when it really clicks.',
      time: '50m ago',
      parentId: 'c3'
    },
    {
      id: 'c4r1',
      author: 'Priya Singh',
      avatarColor: 'gold',
      content: 'Thanks Jordan! Starting my prep tonight.',
      time: '25m ago',
      parentId: 'c4'
    },
    {
      id: 'c4r2',
      author: 'Sam Rivera',
      avatarColor: 'lavender',
      content: 'Pro tip: prep your juices the night before.',
      time: '20m ago',
      parentId: 'c4'
    }]

  },
  {
    id: 'p4',
    author: 'Alex Chen',
    avatarColor: 'lavender',
    group: 'g-health',
    content:
    'Hit my 7-day streak today 🔥 My kids are starting to ask for smoothies in the morning. Big win.',
    time: '5h ago',
    likes: 47,
    liked: true,
    shares: 2,
    comments: [
    {
      id: 'c5',
      author: 'Misty Smith',
      avatarColor: 'primary',
      content: 'This is everything 💛',
      time: '4h ago'
    },
    {
      id: 'c5r1',
      author: 'Alex Chen',
      avatarColor: 'lavender',
      content: 'Thanks Misty! The kids are my biggest motivator.',
      time: '3h ago',
      parentId: 'c5'
    },
    {
      id: 'c5r2',
      author: 'Jordan Lee',
      avatarColor: 'sage',
      content: '7 days is huge — congrats!',
      time: '3h ago',
      parentId: 'c5'
    },
    {
      id: 'c5b',
      author: 'Priya Singh',
      avatarColor: 'gold',
      content: 'What smoothie recipe are they loving?',
      time: '2h ago'
    },
    {
      id: 'c5b-r1',
      author: 'Alex Chen',
      avatarColor: 'lavender',
      content: 'Berry banana with spinach — they call it "purple power."',
      time: '2h ago',
      parentId: 'c5b'
    }]

  },
  {
    id: 'p5',
    author: 'Priya Singh',
    avatarColor: 'gold',
    group: 'g-coaching',
    content:
    'New here! Just enrolled in the Foundations program. Any tips for week one?',
    time: 'Yesterday',
    likes: 12,
    liked: false,
    shares: 0,
    comments: [
    {
      id: 'c6',
      author: 'Misty Smith',
      avatarColor: 'primary',
      content: 'Welcome! Start with the hydration lesson — game changer.',
      time: '20h ago'
    },
    {
      id: 'c6r1',
      author: 'Priya Singh',
      avatarColor: 'gold',
      content: 'Perfect — doing that first thing tomorrow morning.',
      time: '19h ago',
      parentId: 'c6'
    },
    {
      id: 'c6r2',
      author: 'Sam Rivera',
      avatarColor: 'lavender',
      content: 'Also set a daily reminder in the app — helped me a ton.',
      time: '18h ago',
      parentId: 'c6'
    },
    {
      id: 'c6b',
      author: 'Jordan Lee',
      avatarColor: 'sage',
      content: "Week one tip: don't try to change everything at once.",
      time: '16h ago'
    },
    {
      id: 'c6b-r1',
      author: 'Priya Singh',
      avatarColor: 'gold',
      content: 'Needed to hear that. One habit at a time.',
      time: '15h ago',
      parentId: 'c6b'
    }]

  },
  {
    id: 'p6',
    author: 'Diana K.',
    avatarColor: 'sage',
    group: 'g-recipes',
    content:
    "Tried the Zucchini Noodle Pesto from this week's recipe drop. 10/10. Husband didn't even notice it wasn't pasta 😂",
    image:
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    time: 'Yesterday',
    likes: 89,
    liked: true,
    shares: 11,
    comments: [
    {
      id: 'c7',
      author: 'Sam Rivera',
      avatarColor: 'lavender',
      content: 'Saving this recipe — looks delicious!',
      time: 'Yesterday'
    },
    {
      id: 'c7r1',
      author: 'Diana K.',
      avatarColor: 'sage',
      content: 'It is in the Recipes tab under "Zucchini Noodle Pesto."',
      time: 'Yesterday',
      parentId: 'c7'
    },
    {
      id: 'c7b',
      author: 'Alex Chen',
      avatarColor: 'lavender',
      content: 'My husband said the same thing 😂',
      time: 'Yesterday'
    },
    {
      id: 'c7b-r1',
      author: 'Misty Smith',
      avatarColor: 'primary',
      content: 'The secret is fresh basil — makes all the difference.',
      time: 'Yesterday',
      parentId: 'c7b'
    },
    {
      id: 'c7b-r2',
      author: 'Alex Chen',
      avatarColor: 'lavender',
      content: 'Noted! Trying that this weekend.',
      time: 'Yesterday',
      parentId: 'c7b'
    }]
  }],

  events: [
  {
    id: 'ev1',
    title: 'Community Mobilization Meeting',
    color: 'purple',
    startAt: '2026-06-09T04:00:00',
    endAt: '2026-06-09T06:00:00',
    timezone: 'GMT+05:00 Asia/Karachi (PKT)',
    recurring: false,
    location: 'in-person',
    link: 'Ford Resource Engagement Center, Detroit, MI',
    description: 'Monthly community mobilization and planning session.',
    hideLocation: false,
    imageUrl:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    attendeeScope: 'all-members',
    remindAttendees: true,
    hideAttendees: false,
    isPaid: false,
    attendeeIds: ['u1', 'u2', 'u3', 'u4']
  },
  {
    id: 'ev2',
    title: 'Tentative: Iron Man Challenge Kickoff',
    color: 'orange',
    startAt: '2026-06-14T00:00:00',
    endAt: '2026-06-14T01:00:00',
    timezone: 'GMT+05:00 Asia/Karachi (PKT)',
    recurring: false,
    location: 'hybrid',
    link: 'Community Center, Block 12',
    description: 'Kickoff for the summer fitness challenge. Details TBD.',
    hideLocation: false,
    imageUrl:
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    attendeeScope: 'all-members',
    remindAttendees: true,
    hideAttendees: false,
    isPaid: true,
    price: 25,
    currency: 'USD',
    paymentLink: 'https://pay.example.com/ironman',
    attendeeIds: ['u2', 'u5']
  },
  {
    id: 'ev3',
    title: 'Community Mobilization Meeting',
    color: 'purple',
    startAt: '2026-06-23T04:00:00',
    endAt: '2026-06-23T05:30:00',
    timezone: 'GMT+05:00 Asia/Karachi (PKT)',
    recurring: true,
    location: 'virtual',
    link: 'https://meet.example.com/community-mobilize',
    description: 'Recurring mobilization check-in for all members.',
    hideLocation: false,
    imageUrl:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    attendeeScope: 'all-members',
    remindAttendees: true,
    hideAttendees: false,
    isPaid: false,
    attendeeIds: ['u1', 'u3', 'u7']
  }],

  reportedPosts: [
  {
    id: 'rp1',
    reportType: 'post',
    postId: 'p5',
    reportedBy: 'Alex Chen',
    reasonCode: 'spam',
    reason: 'Spam or scam',
    reportedAt: '2 days ago',
    authorName: 'Priya Singh',
    authorUserId: 'u4'
  }],

  bannedUsers: [],

  selectedGroup: 'all'
};

export const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setSelectedGroup: (state, action: PayloadAction<string>) => {
      state.selectedGroup = action.payload;
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
      }
    },
    addPost: (state, action: PayloadAction<CommunityPost>) => {
      state.posts.unshift(action.payload);
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
      state.reportedPosts = state.reportedPosts.filter(
        (r) => r.postId !== action.payload
      );
    },
    addComment: (
    state,
    action: PayloadAction<{postId: string;comment: CommunityComment;}>) =>
    {
      const post = state.posts.find((p) => p.id === action.payload.postId);
      if (!post || post.commentsDisabled) return;
      post.comments.push(action.payload.comment);
    },
    reportPost: (
    state,
    action: PayloadAction<{
      reportType: 'post' | 'user';
      postId?: string;
      targetUserId?: string;
      targetUserName?: string;
      reportedBy: string;
      reasonCode: ReportReasonCode;
      reason: string;
      description?: string;
      authorName?: string;
      authorUserId?: string;
    }>) =>
    {
      const exists = state.reportedPosts.some((r) => {
        if (action.payload.reportType === 'post') {
          return (
            r.reportType === 'post' &&
            r.postId === action.payload.postId &&
            r.reportedBy === action.payload.reportedBy
          );
        }
        return (
          r.reportType === 'user' &&
          r.targetUserId === action.payload.targetUserId &&
          r.reportedBy === action.payload.reportedBy
        );
      });
      if (exists) return;
      state.reportedPosts.unshift({
        id: `rp-${Date.now()}`,
        reportType: action.payload.reportType,
        postId: action.payload.postId,
        targetUserId: action.payload.targetUserId,
        targetUserName: action.payload.targetUserName,
        reportedBy: action.payload.reportedBy,
        reasonCode: action.payload.reasonCode,
        reason: action.payload.reason,
        description: action.payload.description,
        reportedAt: 'just now',
        authorName: action.payload.authorName,
        authorUserId: action.payload.authorUserId
      });
    },
    dismissReport: (state, action: PayloadAction<string>) => {
      state.reportedPosts = state.reportedPosts.filter(
        (r) => r.id !== action.payload
      );
    },
    movePostToGroup: (
    state,
    action: PayloadAction<{postId: string;groupId: string;}>) =>
    {
      const post = state.posts.find((p) => p.id === action.payload.postId);
      if (post) post.group = action.payload.groupId;
    },
    togglePostComments: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) post.commentsDisabled = !post.commentsDisabled;
    },
    togglePostPin: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (!post) return;
      post.pinned = !post.pinned;
      if (post.pinned) {
        const idx = state.posts.indexOf(post);
        state.posts.splice(idx, 1);
        state.posts.unshift(post);
      }
    },
    sharePost: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) post.shares += 1;
    },
    toggleGroupJoin: (state, action: PayloadAction<string>) => {
      const group = state.groups.find((g) => g.id === action.payload);
      if (group) {
        group.joined = !group.joined;
      }
    },
    setGroupJoined: (
      state,
      action: PayloadAction<{ groupId: string; joined: boolean }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (!group) return;
      const wasJoined = group.joined;
      group.joined = action.payload.joined;
      if (!wasJoined && action.payload.joined) {
        group.members += 1;
      } else if (wasJoined && !action.payload.joined) {
        group.members = Math.max(0, group.members - 1);
      }
    },
    createGroup: (
    state,
    action: PayloadAction<{
      name: string;
      description: string;
      icon: string;
      color: string;
    }>) =>
    {
      const group: CommunityGroup = {
        id: `g-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        icon: action.payload.icon,
        color: action.payload.color,
        memberIds: [],
        adminIds: [],
        members: 0,
        joined: true
      };
      state.groups.unshift(group);
    },
    inviteUserToGroup: (
    state,
    action: PayloadAction<{groupId: string;userId: string;}>) =>
    {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (!group) return;
      if (group.memberIds.includes(action.payload.userId)) return;
      group.memberIds.push(action.payload.userId);
      group.members = group.memberIds.length;
    },
    removeUserFromGroup: (
    state,
    action: PayloadAction<{groupId: string;userId: string;}>) =>
    {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (!group) return;
      group.memberIds = group.memberIds.filter(
        (id) => id !== action.payload.userId
      );
      group.members = group.memberIds.length;
      if (group.adminIds) {
        group.adminIds = group.adminIds.filter(
          (id) => id !== action.payload.userId
        );
      }
    },
    setGroupAdmin: (
    state,
    action: PayloadAction<{
      groupId: string;
      userId: string;
      promote: boolean;
    }>) =>
    {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (!group) return;
      const adminIds = group.adminIds ?? [];
      if (action.payload.promote) {
        if (!group.memberIds.includes(action.payload.userId)) {
          group.memberIds.push(action.payload.userId);
          group.members = group.memberIds.length;
        }
        if (!adminIds.includes(action.payload.userId)) {
          group.adminIds = [...adminIds, action.payload.userId];
        }
      } else {
        group.adminIds = adminIds.filter((id) => id !== action.payload.userId);
      }
    },
    banUser: (state, action: PayloadAction<BannedUser>) => {
      if (state.bannedUsers.some((b) => b.userId === action.payload.userId)) {
        return;
      }
      state.bannedUsers.unshift(action.payload);
      state.groups.forEach((group) => {
        if (group.memberIds.includes(action.payload.userId)) {
          group.memberIds = group.memberIds.filter(
            (id) => id !== action.payload.userId
          );
          group.members = group.memberIds.length;
        }
        if (group.adminIds?.includes(action.payload.userId)) {
          group.adminIds = group.adminIds.filter(
            (id) => id !== action.payload.userId
          );
        }
      });
    },
    unbanUser: (state, action: PayloadAction<string>) => {
      state.bannedUsers = state.bannedUsers.filter(
        (b) => b.userId !== action.payload
      );
    },
    addEvent: (state, action: PayloadAction<CommunityEvent>) => {
      state.events.push({
        ...action.payload,
        attendeeIds: action.payload.attendeeIds ?? []
      });
    },
    updateEvent: (
    state,
    action: PayloadAction<{id: string;patch: Partial<CommunityEvent>}>) =>
    {
      const event = state.events.find((e) => e.id === action.payload.id);
      if (event) {
        Object.assign(event, action.payload.patch);
      }
    },
    registerForEvent: (
    state,
    action: PayloadAction<{eventId: string;userId: string;}>) =>
    {
      const event = state.events.find((e) => e.id === action.payload.eventId);
      if (!event) return;
      const ids = event.attendeeIds ?? [];
      if (!ids.includes(action.payload.userId)) {
        event.attendeeIds = [...ids, action.payload.userId];
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((e) => e.id !== action.payload);
    }
  }
});