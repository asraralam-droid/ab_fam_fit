import type { AdminMember } from '../store/adminSlice';
import type { UserRole } from '../store/slices';

export function getChatUserId(
  user: { name: string; email: string; role: UserRole } | null,
  members: AdminMember[]
): string {
  if (!user) return 'guest';

  const byEmail = members.find((m) => m.email === user.email);
  if (byEmail) return byEmail.id;

  const byName = members.find((m) => m.name === user.name);
  if (byName) return byName.id;

  if (user.role === 'admin') {
    return members.find((m) => m.role === 'admin')?.id ?? 'u1';
  }
  if (user.role === 'staff') {
    return members.find((m) => m.role === 'staff')?.id ?? 'u5';
  }

  return members.find((m) => m.id === 'u2')?.id ?? `guest-${user.email}`;
}

export function getMemberName(memberId: string, members: AdminMember[]) {
  return members.find((m) => m.id === memberId)?.name ?? 'Member';
}

export function formatChatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}
