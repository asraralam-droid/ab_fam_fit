import type { BannedUser } from '../store/communitySlice';
import type { AdminMember } from '../store/adminSlice';

export function resolveUserId(
  email: string | undefined,
  name: string | undefined,
  members: AdminMember[]
) {
  if (email) {
    const byEmail = members.find((m) => m.email === email);
    if (byEmail) return byEmail.id;
  }
  if (name) {
    const byName = members.find((m) => m.name === name);
    if (byName) return byName.id;
  }
  if (email) return `guest-${email}`;
  if (name) return `guest-${name.replace(/\s+/g, '-').toLowerCase()}`;
  return 'guest';
}

export function resolveMemberByName(name: string, members: AdminMember[]) {
  return members.find((m) => m.name === name) ?? null;
}

export function isUserBanned(
  userName: string,
  userEmail: string | undefined,
  bannedUsers: BannedUser[],
  platformMembers: AdminMember[]
) {
  const member = platformMembers.find(
    (m) => m.email === userEmail || m.name === userName
  );
  if (member?.status === 'banned') return true;
  const userId = resolveUserId(userEmail, userName, platformMembers);
  return bannedUsers.some(
    (b) =>
      b.userId === userId ||
      b.name === userName ||
      (userEmail && b.email === userEmail)
  );
}
