import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
}

export interface DirectChat {
  id: string;
  participantIds: string[];
  messages: ChatMessage[];
  updatedAt: string;
  unreadCount: number;
}

export interface GroupChat {
  id: string;
  name: string;
  icon: string;
  memberIds: string[];
  messages: ChatMessage[];
  updatedAt: string;
  unreadCount: number;
}

interface ChatState {
  directChats: DirectChat[];
  groupChats: GroupChat[];
}

const now = () => new Date().toISOString();

const initialState: ChatState = {
  directChats: [
    {
      id: 'dc-u5-u2',
      participantIds: ['u5', 'u2'],
      updatedAt: '2026-07-06T09:15:00.000Z',
      unreadCount: 1,
      messages: [
        {
          id: 'dm1',
          senderId: 'u2',
          senderName: 'Jordan Lee',
          content: 'Hey Alex! Did you finish the juice reset module?',
          sentAt: '2026-07-06T09:10:00.000Z'
        },
        {
          id: 'dm2',
          senderId: 'u5',
          senderName: 'Alex Chen',
          content: 'Almost done — one lesson left tonight.',
          sentAt: '2026-07-06T09:12:00.000Z'
        },
        {
          id: 'dm3',
          senderId: 'u2',
          senderName: 'Jordan Lee',
          content: 'Nice! Let me know if you want to do a check-in call.',
          sentAt: '2026-07-06T09:15:00.000Z'
        }
      ]
    },
    {
      id: 'dc-u5-u3',
      participantIds: ['u5', 'u3'],
      updatedAt: '2026-07-05T18:40:00.000Z',
      unreadCount: 0,
      messages: [
        {
          id: 'dm4',
          senderId: 'u5',
          senderName: 'Alex Chen',
          content: 'Sam, thanks for sharing that recipe yesterday.',
          sentAt: '2026-07-05T18:30:00.000Z'
        },
        {
          id: 'dm5',
          senderId: 'u3',
          senderName: 'Sam Rivera',
          content: 'Anytime! Happy to swap more meal ideas.',
          sentAt: '2026-07-05T18:40:00.000Z'
        }
      ]
    },
    {
      id: 'dc-u1-u2',
      participantIds: ['u1', 'u2'],
      updatedAt: '2026-07-06T08:00:00.000Z',
      unreadCount: 0,
      messages: [
        {
          id: 'dm6',
          senderId: 'u1',
          senderName: 'Misty Alvarez',
          content: 'Jordan — can you help moderate the newcomers group this week?',
          sentAt: '2026-07-06T08:00:00.000Z'
        }
      ]
    },
    {
      id: 'dc-u2-u4',
      participantIds: ['u2', 'u4'],
      updatedAt: '2026-07-04T14:20:00.000Z',
      unreadCount: 0,
      messages: [
        {
          id: 'dm7',
          senderId: 'u4',
          senderName: 'Priya Singh',
          content: 'Thanks for the welcome message!',
          sentAt: '2026-07-04T14:20:00.000Z'
        }
      ]
    }
  ],
  groupChats: [
    {
      id: 'gc-team',
      name: 'Team Pursuit Hub',
      icon: '🦁',
      memberIds: ['u1', 'u2', 'u3', 'u5', 'u7'],
      updatedAt: '2026-07-06T10:30:00.000Z',
      unreadCount: 2,
      messages: [
        {
          id: 'gm1',
          senderId: 'u1',
          senderName: 'Misty Alvarez',
          content: 'Welcome everyone — weekly accountability starts Monday!',
          sentAt: '2026-07-06T08:00:00.000Z'
        },
        {
          id: 'gm2',
          senderId: 'u2',
          senderName: 'Jordan Lee',
          content: 'I am in. Posting my step goal in the thread.',
          sentAt: '2026-07-06T09:45:00.000Z'
        },
        {
          id: 'gm3',
          senderId: 'u7',
          senderName: 'Diana K.',
          content: 'Same here — aiming for 8k steps daily.',
          sentAt: '2026-07-06T10:30:00.000Z'
        }
      ]
    },
    {
      id: 'gc-juice',
      name: 'Juice Cleanse Crew',
      icon: '🥬',
      memberIds: ['u2', 'u3', 'u4', 'u7'],
      updatedAt: '2026-07-05T16:10:00.000Z',
      unreadCount: 0,
      messages: [
        {
          id: 'gm4',
          senderId: 'u3',
          senderName: 'Sam Rivera',
          content: 'Day 3 of the cleanse — feeling great!',
          sentAt: '2026-07-05T15:00:00.000Z'
        },
        {
          id: 'gm5',
          senderId: 'u4',
          senderName: 'Priya Singh',
          content: 'Which green juice recipe are you using?',
          sentAt: '2026-07-05T16:10:00.000Z'
        }
      ]
    },
    {
      id: 'gc-family',
      name: 'Family Accountability',
      icon: '👨‍👩‍👧',
      memberIds: ['u2', 'u5', 'u9'],
      updatedAt: '2026-07-03T20:00:00.000Z',
      unreadCount: 0,
      messages: [
        {
          id: 'gm6',
          senderId: 'u9',
          senderName: 'Casey Mitchell',
          content: 'Family walk after dinner tonight — who is joining?',
          sentAt: '2026-07-03T20:00:00.000Z'
        }
      ]
    }
  ]
};

function touchConversation<T extends { updatedAt: string }>(item: T) {
  item.updatedAt = now();
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    sendDirectMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: ChatMessage;
      }>
    ) => {
      const chat = state.directChats.find((c) => c.id === action.payload.chatId);
      if (!chat) return;
      chat.messages.push(action.payload.message);
      touchConversation(chat);
    },
    sendGroupMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: ChatMessage;
      }>
    ) => {
      const chat = state.groupChats.find((c) => c.id === action.payload.chatId);
      if (!chat) return;
      chat.messages.push(action.payload.message);
      touchConversation(chat);
    },
    markDirectChatRead: (state, action: PayloadAction<string>) => {
      const chat = state.directChats.find((c) => c.id === action.payload);
      if (chat) chat.unreadCount = 0;
    },
    markGroupChatRead: (state, action: PayloadAction<string>) => {
      const chat = state.groupChats.find((c) => c.id === action.payload);
      if (chat) chat.unreadCount = 0;
    },
    addGroupMember: (
      state,
      action: PayloadAction<{ chatId: string; memberId: string }>
    ) => {
      const chat = state.groupChats.find((c) => c.id === action.payload.chatId);
      if (!chat) return;
      if (!chat.memberIds.includes(action.payload.memberId)) {
        chat.memberIds.push(action.payload.memberId);
        touchConversation(chat);
      }
    },
    removeGroupMember: (
      state,
      action: PayloadAction<{ chatId: string; memberId: string }>
    ) => {
      const chat = state.groupChats.find((c) => c.id === action.payload.chatId);
      if (!chat) return;
      chat.memberIds = chat.memberIds.filter(
        (id) => id !== action.payload.memberId
      );
      touchConversation(chat);
    }
  }
});

export const {
  sendDirectMessage,
  sendGroupMessage,
  markDirectChatRead,
  markGroupChatRead,
  addGroupMember,
  removeGroupMember
} = chatSlice.actions;
