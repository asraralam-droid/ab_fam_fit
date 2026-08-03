import React, { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import {
  communitySlice,
  CommunityComment,
  CommunityGroup,
  CommunityPost
} from '../../store/communitySlice';
import {
  Heart,
  MessageCircle,
  Globe,
  ImagePlus,
  X,
  MoreHorizontal,
  Send,
  Users,
  CalendarDays,
  Plus,
  UserPlus,
  ChevronRight,
  Trash2,
  Share2,
  CircleAlert,
  FolderInput,
  MessagesSquare,
  Pin,
  Flag,
  Eye,
  Shield,
  UserX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SheetModal, ReportReasonModal, type ReportTarget } from '../../components/modals';
import { adminSlice } from '../../store/adminSlice';
import {
  containsBadWords,
  moderationErrorMessage
} from '../../utils/contentModeration';
import {
  isUserBanned,
  resolveMemberByName,
  resolveUserId
} from '../../utils/communityUser';
import { buildReportReasonText, type ReportReasonCode } from '../../utils/reportReasons';
const avatarColor: Record<string, string> = {
  sage: 'bg-accent-sage text-white',
  lavender: 'bg-accent-lavender text-primary',
  primary: 'bg-primary text-white',
  gold: 'bg-accent-gold text-white'
};
const SAMPLE_IMAGES = [
'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'];

export function Community() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { posts, groups, selectedGroup, reportedPosts, bannedUsers } =
    useSelector((state: RootState) => state.community);
  const { user } = useSelector((state: RootState) => state.auth);
  const { members: platformMembers } = useSelector(
    (state: RootState) => state.admin
  );
  const isAdmin = user?.role === 'admin';
  const [composeOpen, setComposeOpen] = useState(false);
  const [openPost, setOpenPost] = useState<CommunityPost | null>(null);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [reportedOpen, setReportedOpen] = useState(false);
  const [bannedOpen, setBannedOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState<CommunityGroup | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const joinedGroups = groups.filter((g) => g.joined);

  const openGroupDetail = (groupId: string) => {
    const target = groups.find((g) => g.id === groupId);
    if (target) setDetailGroup(target);
  };

  const handleReportSubmit = ({
    reasonCode,
    description
  }: {
    reasonCode: ReportReasonCode;
    description?: string;
  }) => {
    if (!reportTarget) return;
    const reason = buildReportReasonText(reasonCode, description);
    const reportedBy = user?.name || 'You';

    if (reportTarget.type === 'post') {
      const authorMember = resolveMemberByName(
        reportTarget.authorName,
        platformMembers
      );
      dispatch(
        communitySlice.actions.reportPost({
          reportType: 'post',
          postId: reportTarget.postId,
          reportedBy,
          reasonCode,
          reason,
          description,
          authorName: reportTarget.authorName,
          authorUserId: authorMember?.id
        })
      );
    } else {
      dispatch(
        communitySlice.actions.reportPost({
          reportType: 'user',
          targetUserId: reportTarget.userId,
          targetUserName: reportTarget.userName,
          reportedBy,
          reasonCode,
          reason,
          description
        })
      );
    }
    setReportTarget(null);
    toast.success('Report submitted. Our team will review it.');
  };
  const visiblePosts = useMemo(() => {
    let filtered: CommunityPost[];
    if (selectedGroup === 'all') {
      const joinedIds = new Set(joinedGroups.map((g) => g.id));
      filtered = posts.filter((p) => joinedIds.has(p.group));
    } else {
      filtered = posts.filter((p) => p.group === selectedGroup);
    }
    return [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [posts, selectedGroup, joinedGroups]);
  const activeGroup =
  selectedGroup === 'all' ?
  null :
  groups.find((g) => g.id === selectedGroup) || null;
  const initials = (user?.name || 'M').
  split(' ').
  map((p) => p[0]).
  slice(0, 2).
  join('').
  toUpperCase();
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-text leading-tight">
              Community
            </h1>
            <p className="text-xs text-text-muted">
              {joinedGroups.length} group{joinedGroups.length === 1 ? '' : 's'}{' '}
              · {visiblePosts.length} post
              {visiblePosts.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin &&
            <button
              onClick={() => setReportedOpen(true)}
              className="relative w-9 h-9 rounded-full bg-surface-2 text-text flex items-center justify-center hover:bg-border transition-colors"
              aria-label="Reported posts">
              
                <Flag className="w-4 h-4" strokeWidth={1.75} />
                {reportedPosts.length > 0 &&
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {reportedPosts.length}
                  </span>
              }
              </button>
            }
            {isAdmin &&
            <button
              onClick={() => setBannedOpen(true)}
              className="relative w-9 h-9 rounded-full bg-surface-2 text-text flex items-center justify-center hover:bg-border transition-colors"
              aria-label="Banned users">
              
                <UserX className="w-4 h-4" strokeWidth={1.75} />
                {bannedUsers.length > 0 &&
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {bannedUsers.length}
                  </span>
              }
              </button>
            }
            <button
              onClick={() => navigate('/community/events')}
              className="w-9 h-9 rounded-full bg-surface-2 text-text flex items-center justify-center hover:bg-border transition-colors"
              aria-label="Community events">
              
              <CalendarDays className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setGroupsOpen(true)}
              className="w-9 h-9 rounded-full bg-surface-2 text-text flex items-center justify-center hover:bg-border transition-colors"
              aria-label="Browse groups">
              
              <Users className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Group filter chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 pb-3">
          <ChipButton
            active={selectedGroup === 'all'}
            onClick={() =>
            dispatch(communitySlice.actions.setSelectedGroup('all'))
            }>
            
            <Globe className="w-3 h-3" strokeWidth={2} /> All your groups
          </ChipButton>
          {joinedGroups.map((g) =>
          <ChipButton
            key={g.id}
            active={selectedGroup === g.id}
            onClick={() =>
            dispatch(communitySlice.actions.setSelectedGroup(g.id))
            }>
            
              <span>{g.icon}</span>
              {g.name}
            </ChipButton>
          )}
        </div>
      </div>

      {/* Group hero (when filtered) */}
      {activeGroup &&
      <div className="px-4 pt-4">
          <div
          className="rounded-2xl p-4 text-white relative overflow-hidden"
          style={{
            background: activeGroup.color
          }}>
          
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="flex items-start gap-3 relative">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl">
                {activeGroup.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-extrabold text-base">{activeGroup.name}</h2>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Public group · {activeGroup.members.toLocaleString()} members
                </p>
                <p className="text-xs opacity-90 mt-2 leading-snug">
                  {activeGroup.description}
                </p>
                <button
                  type="button"
                  onClick={() => openGroupDetail(activeGroup.id)}
                  className="mt-3 text-[11px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5">
                  
                  <Users className="w-3.5 h-3.5" />
                  View all members
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      {/* Compose bar */}
      <div className="px-4 pt-4">
        <button
          onClick={() => setComposeOpen(true)}
          className="w-full bg-surface border border-border rounded-2xl p-3 flex items-center gap-3 hover:border-primary/30 transition-all">
          
          <div
            className={`w-10 h-10 rounded-full ${avatarColor.primary} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
            
            {initials}
          </div>
          <span className="text-sm text-text-muted text-left flex-1">
            What's on your mind, {user?.name?.split(' ')[0] || 'friend'}?
          </span>
          <ImagePlus className="w-5 h-5 text-accent-sage" strokeWidth={1.75} />
        </button>
      </div>

      {/* Feed */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {visiblePosts.length === 0 ?
        <div className="p-10 text-center bg-surface border border-border border-dashed rounded-2xl">
            <Users
            className="w-8 h-8 text-text-muted mx-auto mb-3"
            strokeWidth={1.5} />
          
            <p className="text-sm font-bold text-text">No posts yet</p>
            <p className="text-xs text-text-muted mt-1">
              {activeGroup ?
            'Be the first to post in this group.' :
            'Join more groups or share something new.'}
            </p>
          </div> :

        visiblePosts.map((post, i) =>
        <PostCard
          key={post.id}
          post={post}
          groups={groups}
          currentUser={user?.name || 'You'}
          isAdmin={isAdmin}
          onOpen={() => setOpenPost(post)}
          onOpenGroup={openGroupDetail}
          onOpenReport={setReportTarget}
          delay={i * 0.04} />

        )
        }
      </div>

      {/* Compose sheet */}
      <ComposeSheet
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        groups={joinedGroups}
        defaultGroup={
        selectedGroup === 'all' ? joinedGroups[0]?.id : selectedGroup
        } />
      

      {/* Post detail sheet */}
      <PostDetailSheet
        post={openPost}
        groups={groups}
        currentUser={user?.name || 'You'}
        isAdmin={isAdmin}
        onOpenGroup={openGroupDetail}
        onOpenReport={setReportTarget}
        onClose={() => setOpenPost(null)} />
      

      <GroupDetailSheet
        group={detailGroup}
        isAdmin={isAdmin}
        currentUserName={user?.name || 'You'}
        currentUserEmail={user?.email}
        onOpenPost={(post) => {
          setDetailGroup(null);
          setOpenPost(post);
        }}
        onReportUser={(userId, userName) =>
          setReportTarget({ type: 'user', userId, userName })
        }
        onClose={() => setDetailGroup(null)} />
      

      <ReportedPostsSheet
        open={reportedOpen}
        onClose={() => setReportedOpen(false)}
        onViewPost={(post) => {
          setReportedOpen(false);
          setOpenPost(post);
        }} />

      <BannedUsersSheet open={bannedOpen} onClose={() => setBannedOpen(false)} />

      <ReportReasonModal
        open={!!reportTarget}
        target={reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={handleReportSubmit} />

      {/* Groups sheet */}
      <GroupsSheet
        open={groupsOpen}
        onClose={() => setGroupsOpen(false)}
        isAdmin={isAdmin}
        initialGroupId={activeGroup?.id}
        detailGroup={detailGroup}
        setDetailGroup={setDetailGroup} />
    </div>);

}
// ============ Components ============
function ChipButton({
  active,
  onClick,
  children




}: {active: boolean;onClick: () => void;children: React.ReactNode;}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-text border-border hover:border-primary/40'}`}>
      
      {children}
    </button>);

}
function GroupTag({
  group,
  onClick
}: {
  group: { id: string; name: string; icon: string; color: string };
  onClick?: () => void;
}) {
  const className =
    'text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded text-white hover:opacity-90 transition-opacity';
  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={className}
        style={{ background: group.color }}>
        
        {group.icon} {group.name}
      </button>);
  }
  return (
    <span className={className} style={{ background: group.color }}>
      {group.icon} {group.name}
    </span>);

}
function PostCard({
  post,
  groups,
  currentUser,
  isAdmin,
  onOpen,
  onOpenGroup,
  onOpenReport,
  delay











}: {
  post: CommunityPost;
  groups: { id: string; name: string; icon: string; color: string; joined?: boolean }[];
  currentUser: string;
  isAdmin: boolean;
  onOpen: () => void;
  onOpenGroup: (groupId: string) => void;
  onOpenReport: (target: ReportTarget) => void;
  delay: number;
}) {
  const dispatch = useDispatch();
  const group = groups.find((g) => g.id === post.group);
  const isOwn = post.author === currentUser;
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 8
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        delay
      }}
      className="bg-surface border border-border rounded-2xl overflow-hidden">
      
      {/* Header */}
      <div className="p-3 flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0 ${avatarColor[post.avatarColor] || avatarColor.primary}`}>
          
          {post.author.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-bold text-text leading-tight">
              {post.author}
            </p>
            {post.pinned &&
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent-gold">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            }
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {group &&
            <GroupTag
              group={group}
              onClick={() => onOpenGroup(group.id)} />
            }
            <span className="text-[11px] text-text-muted">· {post.time}</span>
          </div>
        </div>
        <PostOptionsMenu
          post={post}
          groups={groups}
          isAdmin={isAdmin}
          isOwn={isOwn}
          onOpenReport={onOpenReport} />
      </div>

      {/* Content */}
      <button
        onClick={onOpen}
        className="w-full px-3 pb-3 text-left hover:opacity-90 transition-opacity">
        
        <p className="text-sm text-text leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </button>

      {/* Image */}
      {post.image &&
      <button onClick={onOpen} className="w-full block">
          <img
          src={post.image}
          alt=""
          className="w-full aspect-[16/10] object-cover border-t border-b border-border" />
        
        </button>
      }

      {/* Counts row */}
      {(post.likes > 0 || post.comments.length > 0) &&
      <div className="px-3 py-2 flex items-center gap-3 text-[11px] text-text-muted">
          {post.likes > 0 &&
        <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 fill-white" />
              </span>
              {post.likes}
            </span>
        }
          {post.comments.length > 0 &&
        <span>
              {post.comments.length} comment
              {post.comments.length === 1 ? '' : 's'}
            </span>
        }
        </div>
      }

      {/* Action row */}
      <div className="border-t border-border grid grid-cols-2">
        <ActionButton
          icon={Heart}
          label="Like"
          active={post.liked}
          activeClass="text-red-500"
          fill={post.liked}
          onClick={() => dispatch(communitySlice.actions.toggleLike(post.id))} />
        
        <ActionButton icon={MessageCircle} label="Comment" onClick={onOpen} />
      </div>
    </motion.article>);

}

function PostOptionsMenu({
  post,
  groups,
  isAdmin,
  isOwn,
  onDeleted,
  onOpenReport
}: {
  post: CommunityPost;
  groups: { id: string; name: string; icon: string; color: string; joined?: boolean }[];
  isAdmin: boolean;
  isOwn: boolean;
  onDeleted?: () => void;
  onOpenReport: (target: ReportTarget) => void;
}) {
  const dispatch = useDispatch();
  const { members: platformMembers } = useSelector(
    (state: RootState) => state.admin
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const canModerate = isAdmin || isOwn;
  const canDelete = isAdmin || isOwn;
  const authorMember = resolveMemberByName(post.author, platformMembers);

  const closeMenu = () => setMenuOpen(false);

  const copyLink = () => {
    const url = `${window.location.origin}/community#post-${post.id}`;
    navigator.clipboard.writeText(url);
    closeMenu();
    toast.success('Link copied to clipboard');
  };

  const openReportPost = () => {
    closeMenu();
    onOpenReport({
      type: 'post',
      postId: post.id,
      authorName: post.author,
      preview: post.content.slice(0, 160)
    });
  };

  const openReportUser = () => {
    closeMenu();
    onOpenReport({
      type: 'user',
      userId:
        authorMember?.id ??
        resolveUserId(undefined, post.author, platformMembers),
      userName: post.author
    });
  };

  const deletePost = () => {
    dispatch(communitySlice.actions.deletePost(post.id));
    closeMenu();
    onDeleted?.();
    toast.success('Post deleted');
  };

  const toggleComments = () => {
    dispatch(communitySlice.actions.togglePostComments(post.id));
    closeMenu();
    toast.success(
      post.commentsDisabled ?
        'Comments enabled' :
        'Comments disabled'
    );
  };

  const togglePin = () => {
    dispatch(communitySlice.actions.togglePostPin(post.id));
    closeMenu();
    toast.success(post.pinned ? 'Post unpinned' : 'Post pinned');
  };

  const menuItems: {
    key: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    onClick: () => void;
    danger?: boolean;
    show: boolean;
  }[] = [
    {
      key: 'copy',
      label: 'Copy Link',
      icon: Share2,
      onClick: copyLink,
      show: true
    },
    {
      key: 'report',
      label: 'Report Post',
      icon: CircleAlert,
      onClick: openReportPost,
      show: !isOwn
    },
    {
      key: 'report-user',
      label: 'Report User',
      icon: Flag,
      onClick: openReportUser,
      show: !isOwn
    },
    {
      key: 'delete',
      label: 'Delete Post',
      icon: Trash2,
      onClick: deletePost,
      danger: true,
      show: canDelete
    },
    {
      key: 'move',
      label: 'Move to Channel',
      icon: FolderInput,
      onClick: () => {
        closeMenu();
        setMoveOpen(true);
      },
      show: canModerate
    },
    {
      key: 'comments',
      label: post.commentsDisabled ? 'Enable Comments' : 'Disable Comments',
      icon: MessagesSquare,
      onClick: toggleComments,
      show: isAdmin
    },
    {
      key: 'pin',
      label: post.pinned ? 'Unpin' : 'Pin',
      icon: Pin,
      onClick: togglePin,
      show: isAdmin
    }
  ];

  return (
    <>
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-muted"
          aria-label="More options">
          
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuOpen &&
        <>
            <div className="fixed inset-0 z-30" onClick={closeMenu} />
            <div className="absolute right-0 top-9 z-40 bg-surface border border-border rounded-xl shadow-xl overflow-hidden min-w-[200px] py-1">
              {menuItems.
              filter((item) => item.show).
              map((item) =>
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={`w-full px-4 py-2.5 text-sm font-medium flex items-center gap-3 text-left hover:bg-surface-2 transition-colors ${item.danger ? 'text-red-500' : 'text-text'}`}>
                
                  <item.icon className="w-4 h-4 flex-shrink-0 opacity-80" />
                  {item.label}
                </button>
              )}
            </div>
          </>
        }
      </div>

      <MovePostSheet
        open={moveOpen}
        post={post}
        groups={groups}
        isAdmin={isAdmin}
        onClose={() => setMoveOpen(false)} />
    </>);

}

function MovePostSheet({
  open,
  post,
  groups,
  isAdmin,
  onClose
}: {
  open: boolean;
  post: CommunityPost;
  groups: { id: string; name: string; icon: string; color: string; joined?: boolean }[];
  isAdmin: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const targets = isAdmin ?
    groups.filter((g) => g.id !== post.group) :
    groups.filter((g) => g.joined && g.id !== post.group);

  const moveTo = (groupId: string) => {
    dispatch(
      communitySlice.actions.movePostToGroup({
        postId: post.id,
        groupId
      })
    );
    const group = groups.find((g) => g.id === groupId);
    toast.success(`Moved to ${group?.name ?? 'channel'}`);
    onClose();
  };

  return (
    <SheetModal open={open} onClose={onClose} title="Move to channel">
      <div className="flex flex-col gap-2">
        {targets.length === 0 ?
        <p className="text-sm text-text-muted text-center py-6">
            No other channels available.
          </p> :

        targets.map((g) =>
        <button
          key={g.id}
          type="button"
          onClick={() => moveTo(g.id)}
          className="flex items-center gap-3 p-3 bg-surface border border-border rounded-2xl hover:border-primary/40 transition-colors text-left">
          
            <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background: g.color + '20'
            }}>
            
              {g.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text text-sm">{g.name}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        )}
      </div>
    </SheetModal>);

}

function ReportedPostsSheet({
  open,
  onClose,
  onViewPost
}: {
  open: boolean;
  onClose: () => void;
  onViewPost: (post: CommunityPost) => void;
}) {
  const dispatch = useDispatch();
  const { reportedPosts, posts, groups, bannedUsers } = useSelector(
    (state: RootState) => state.community
  );
  const { members: platformMembers } = useSelector(
    (state: RootState) => state.admin
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const banReportedAuthor = (
  report: (typeof reportedPosts)[number],
  post: CommunityPost | undefined
  ) => {
    const authorName =
      report.reportType === 'user' ?
        report.targetUserName :
        report.authorName ?? post?.author;
    if (!authorName) {
      toast.error('Could not identify the reported user');
      return;
    }
    const member = resolveMemberByName(authorName, platformMembers);
    const userId =
      report.reportType === 'user' ?
        report.targetUserId :
        report.authorUserId ??
        member?.id ??
        resolveUserId(member?.email, authorName, platformMembers);
    if (!userId) {
      toast.error('Could not identify the reported user');
      return;
    }
    if (
      bannedUsers.some((b) => b.userId === userId) ||
      member?.status === 'banned'
    ) {
      toast.error('This user is already banned');
      return;
    }
    dispatch(
      communitySlice.actions.banUser({
        id: `ban-${Date.now()}`,
        userId,
        name: member?.name ?? authorName,
        email: member?.email ?? '',
        bannedBy: user?.name || 'Admin',
        reason: report.reason ?? 'Reported post violation',
        bannedAt: 'just now',
        reportId: report.id
      })
    );
    if (member) {
      dispatch(
        adminSlice.actions.banMember({
          id: member.id,
          reason: report.reason
        })
      );
    }
    dispatch(communitySlice.actions.dismissReport(report.id));
    toast.success(`${authorName} has been banned`);
  };

  return (
    <SheetModal open={open} onClose={onClose} title="Reports">
      {reportedPosts.length === 0 ?
      <div className="py-12 text-center">
          <Flag className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-bold text-text">No reports yet</p>
          <p className="text-xs text-text-muted mt-1">
            Member reports will appear here for review.
          </p>
        </div> :

      <div className="flex flex-col gap-3">
          {reportedPosts.map((report) => {
            const post =
              report.reportType === 'post' && report.postId ?
                posts.find((p) => p.id === report.postId) :
                undefined;
            const group = post ?
              groups.find((g) => g.id === post.group) :
              null;
            const isUserReport = report.reportType === 'user';
            return (
              <div
                key={report.id}
                className="bg-surface border border-border rounded-2xl p-3">
                
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                        <CircleAlert className="w-3.5 h-3.5" />
                        Reported by {report.reportedBy}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-2 text-text-muted">
                        {isUserReport ? 'User' : 'Post'}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {report.reportedAt}
                      {report.reason ? ` · ${report.reason}` : ''}
                    </p>
                    {report.description &&
                <p className="text-[11px] text-text-muted mt-1 italic">
                        "{report.description}"
                      </p>
                }
                  </div>
                </div>

                {isUserReport ?
              <>
                    <p className="text-sm font-bold text-text">
                      {report.targetUserName}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      User report — review profile and activity.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <button
                    type="button"
                    onClick={() => banReportedAuthor(report, undefined)}
                    className="flex-1 min-w-[90px] h-9 rounded-lg bg-amber-500/15 text-amber-700 text-xs font-bold hover:bg-amber-500/25 flex items-center justify-center gap-1.5">
                    
                        <UserX className="w-3.5 h-3.5" />
                        Ban user
                      </button>
                      <button
                    type="button"
                    onClick={() => {
                      dispatch(
                        communitySlice.actions.dismissReport(report.id)
                      );
                      toast.success('Report dismissed');
                    }}
                    className="px-3 h-9 rounded-lg border border-border text-xs font-bold text-text-muted hover:bg-surface-2">
                    
                        Dismiss
                      </button>
                    </div>
                  </> :
              post ?
              <>
                    <p className="text-sm font-bold text-text truncate">
                      {post.author}
                      {group &&
                  <span className="text-text-muted font-normal">
                          {' '}
                          · {group.icon} {group.name}
                        </span>
                  }
                    </p>
                    <p className="text-sm text-text-muted line-clamp-2 mt-1">
                      {post.content}
                    </p>
                    {report.authorName &&
                <p className="text-[11px] text-text-muted mt-1">
                        Author: {report.authorName}
                      </p>
                }
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <button
                    type="button"
                    onClick={() => onViewPost(post)}
                    className="flex-1 min-w-[90px] h-9 rounded-lg border border-border text-xs font-bold text-text hover:bg-surface-2 flex items-center justify-center gap-1.5">
                    
                        <Eye className="w-3.5 h-3.5" />
                        View post
                      </button>
                      <button
                    type="button"
                    onClick={() => banReportedAuthor(report, post)}
                    className="flex-1 min-w-[90px] h-9 rounded-lg bg-amber-500/15 text-amber-700 text-xs font-bold hover:bg-amber-500/25 flex items-center justify-center gap-1.5">
                    
                        <UserX className="w-3.5 h-3.5" />
                        Ban user
                      </button>
                      <button
                    type="button"
                    onClick={() => {
                      dispatch(communitySlice.actions.deletePost(post.id));
                      toast.success('Post deleted');
                    }}
                    className="flex-1 min-w-[90px] h-9 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 flex items-center justify-center gap-1.5">
                    
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                      <button
                    type="button"
                    onClick={() => {
                      dispatch(
                        communitySlice.actions.dismissReport(report.id)
                      );
                      toast.success('Report dismissed');
                    }}
                    className="px-3 h-9 rounded-lg border border-border text-xs font-bold text-text-muted hover:bg-surface-2">
                    
                        Dismiss
                      </button>
                    </div>
                  </> :

              <div className="py-2">
                    <p className="text-sm text-text-muted italic">
                      {isUserReport ?
                    'User report could not be loaded.' :
                    'Original post was removed.'}
                    </p>
                    <button
                  type="button"
                  onClick={() => {
                    dispatch(
                      communitySlice.actions.dismissReport(report.id)
                    );
                    toast.success('Report dismissed');
                  }}
                  className="mt-2 text-xs font-bold text-primary">
                  
                      Dismiss report
                    </button>
                  </div>
              }
              </div>);

          })}
        </div>
      }
    </SheetModal>);

}

function BannedUsersSheet({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const { bannedUsers } = useSelector((state: RootState) => state.community);

  const unban = (userId: string, name: string) => {
    dispatch(communitySlice.actions.unbanUser(userId));
    dispatch(adminSlice.actions.unbanMember(userId));
    toast.success(`${name} has been unbanned`);
  };

  return (
    <SheetModal open={open} onClose={onClose} title="Banned users">
      {bannedUsers.length === 0 ?
      <div className="py-12 text-center">
          <UserX className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-bold text-text">No banned users</p>
          <p className="text-xs text-text-muted mt-1">
            Users banned from reports or moderation will appear here.
          </p>
        </div> :

      <div className="flex flex-col gap-3">
          {bannedUsers.map((banned) =>
          <div
            key={banned.id}
            className="bg-surface border border-border rounded-2xl p-3">
            
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {banned.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text">{banned.name}</p>
                  {banned.email &&
                <p className="text-xs text-text-muted truncate">
                      {banned.email}
                    </p>
                }
                  <p className="text-[11px] text-text-muted mt-1">
                    Banned by {banned.bannedBy} · {banned.bannedAt}
                  </p>
                  {banned.reason &&
                <p className="text-xs text-text-muted mt-1">{banned.reason}</p>
                }
                </div>
              </div>
              <button
              type="button"
              onClick={() => unban(banned.userId, banned.name)}
              className="mt-3 w-full h-9 rounded-lg border border-border text-xs font-bold text-text hover:bg-surface-2">
              
                Unban user
              </button>
            </div>
          )}
        </div>
      }
    </SheetModal>);

}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
  activeClass = '',
  fill = false







}: {icon: ComponentType<any>;label: string;onClick: () => void;active?: boolean;activeClass?: string;fill?: boolean;}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors ${active ? activeClass : 'text-text-muted hover:text-text hover:bg-surface-2'}`}>
      
      <Icon
        className="w-4 h-4"
        strokeWidth={1.75}
        fill={fill ? 'currentColor' : 'none'} />
      
      {label}
    </button>);

}
// ============ Compose ============
function ComposeSheet({
  open,
  onClose,
  groups,
  defaultGroup










}: {open: boolean;onClose: () => void;groups: {id: string;name: string;icon: string;color: string;}[];defaultGroup?: string;}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bannedUsers } = useSelector((state: RootState) => state.community);
  const { members: platformMembers } = useSelector(
    (state: RootState) => state.admin
  );
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [groupId, setGroupId] = useState(defaultGroup || groups[0]?.id || '');
  useEffect(() => {
    if (open) {
      setContent('');
      setImage(null);
      setGroupId(defaultGroup || groups[0]?.id || '');
    }
  }, [open, defaultGroup, groups]);
  const submit = () => {
    if (!content.trim()) {
      toast.error('Write something first');
      return;
    }
    if (!groupId) {
      toast.error('Pick a group');
      return;
    }
    if (
      isUserBanned(
        user?.name || 'You',
        user?.email,
        bannedUsers,
        platformMembers
      )
    ) {
      toast.error('Your account is banned from posting');
      return;
    }
    const moderation = containsBadWords(content);
    if (moderation.blocked) {
      toast.error(moderationErrorMessage(moderation.matches));
      return;
    }
    dispatch(
      communitySlice.actions.addPost({
        id: `p-${Date.now()}`,
        author: user?.name || 'You',
        avatarColor: 'primary',
        group: groupId,
        content: content.trim(),
        image: image || undefined,
        time: 'just now',
        likes: 0,
        liked: false,
        shares: 0,
        comments: []
      })
    );
    toast.success('Post published');
    onClose();
  };
  const initials = (user?.name || 'M').
  split(' ').
  map((p) => p[0]).
  slice(0, 2).
  join('').
  toUpperCase();
  return (
    <SheetModal open={open} onClose={onClose} title="Create post">
            <div className="flex items-center gap-3 mb-3">
              <div
              className={`w-10 h-10 rounded-full ${avatarColor.primary} flex items-center justify-center font-bold text-sm`}>
              
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text">
                  {user?.name || 'You'}
                </p>
                <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded outline-none border-0">
                
                  {groups.map((g) =>
                <option key={g.id} value={g.id}>
                      {g.icon} {g.name}
                    </option>
                )}
                </select>
              </div>
            </div>

            <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={5}
            autoFocus
            className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none mb-3" />
          

            {image &&
          <div className="relative mb-3 rounded-xl overflow-hidden">
                <img
              src={image}
              alt=""
              className="w-full aspect-video object-cover" />
            
                <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur">
              
                  <X className="w-4 h-4" />
                </button>
              </div>
          }

            <button
            onClick={() => {
              const next =
              SAMPLE_IMAGES[
              Math.floor(Math.random() * SAMPLE_IMAGES.length)];

              setImage(next);
            }}
            className="w-full p-3 rounded-xl border border-border border-dashed text-xs font-bold text-text-muted hover:text-text hover:border-primary/40 transition-colors flex items-center justify-center gap-2 mb-4">
            
              <ImagePlus className="w-4 h-4" /> Add photo
            </button>

            <button
            onClick={submit}
            disabled={!content.trim()}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            
              Post
            </button>
    </SheetModal>);

}
// ============ Post detail ============
function PostDetailSheet({
  post,
  groups,
  currentUser,
  isAdmin,
  onOpenGroup,
  onOpenReport,
  onClose










}: {
  post: CommunityPost | null;
  groups: { id: string; name: string; icon: string; color: string; joined?: boolean }[];
  currentUser: string;
  isAdmin: boolean;
  onOpenGroup: (groupId: string) => void;
  onOpenReport: (target: ReportTarget) => void;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const livePost = useSelector((state: RootState) =>
  post ?
  state.community.posts.find((p) => p.id === post.id) ?? post :
  null
  );
  const { bannedUsers } = useSelector((state: RootState) => state.community);
  const { members: platformMembers } = useSelector(
    (state: RootState) => state.admin
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    author: string;
  } | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (post) {
      setComment('');
      setReplyingTo(null);
    }
  }, [post]);
  if (!livePost) return null;
  const group = groups.find((g) => g.id === livePost.group);
  const isOwn = livePost.author === currentUser;
  const topLevelComments = livePost.comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
  livePost.comments.filter((c) => c.parentId === parentId);
  const startReply = (target: CommunityComment) => {
    if (livePost.commentsDisabled) return;
    const threadId = target.parentId ?? target.id;
    const threadRoot =
    livePost.comments.find((c) => c.id === threadId) ?? target;
    setReplyingTo({
      id: threadId,
      author: threadRoot.author
    });
    commentInputRef.current?.focus();
  };
  const submitComment = () => {
    if (!comment.trim() || livePost.commentsDisabled) return;
    if (
      isUserBanned(
        currentUser,
        user?.email,
        bannedUsers,
        platformMembers
      )
    ) {
      toast.error('Your account is banned from commenting');
      return;
    }
    const moderation = containsBadWords(comment);
    if (moderation.blocked) {
      toast.error(moderationErrorMessage(moderation.matches));
      return;
    }
    dispatch(
      communitySlice.actions.addComment({
        postId: livePost.id,
        comment: {
          id: `c-${Date.now()}`,
          author: currentUser,
          avatarColor: 'primary',
          content: comment.trim(),
          time: 'just now',
          ...(replyingTo ? {
            parentId: replyingTo.id
          } : {})
        }
      })
    );
    setComment('');
    setReplyingTo(null);
  };
  const renderComment = (
  c: CommunityComment,
  { nested = false }: {nested?: boolean;} = {}) =>
  <div
    key={c.id}
    className={`flex items-start gap-2 ${nested ? 'ml-10' : ''}`}>
    
      <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${nested ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs'} ${avatarColor[c.avatarColor] || avatarColor.primary}`}>
      
        {c.author.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-surface-2 rounded-2xl px-3 py-2">
          <p className="text-xs font-bold text-text">{c.author}</p>
          <p className="text-sm text-text leading-snug mt-0.5">{c.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-3">
          <p className="text-[10px] text-text-muted">{c.time}</p>
          <button
          type="button"
          onClick={() => startReply(c)}
          disabled={livePost.commentsDisabled}
          className="text-[10px] font-bold text-text-muted hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          
            Reply
          </button>
        </div>
      </div>
    </div>;

  return (
    <SheetModal
      open={!!post}
      onClose={onClose}
      hideHeader
      noPadding
      panelClassName="flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">Post</h3>
              <div className="flex items-center gap-1">
                <PostOptionsMenu
                  post={livePost}
                  groups={groups}
                  isAdmin={isAdmin}
                  isOwn={isOwn}
                  onDeleted={onClose}
                  onOpenReport={onOpenReport} />
                
                <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 text-text-muted hover:text-text">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Post */}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div
                  className={`w-11 h-11 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0 ${avatarColor[livePost.avatarColor] || avatarColor.primary}`}>
                  
                    {livePost.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text">{livePost.author}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {group &&
                    <GroupTag
                      group={group}
                      onClick={() => {
                        onOpenGroup(group.id);
                        onClose();
                      }} />
                    }
                      <span className="text-[11px] text-text-muted">
                        · {livePost.time}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-text leading-relaxed whitespace-pre-line mb-3">
                  {livePost.content}
                </p>

                {livePost.image &&
              <img
                src={livePost.image}
                alt=""
                className="w-full aspect-[16/10] object-cover rounded-xl mb-3" />

              }

                {/* Stats */}
                {(livePost.likes > 0 || livePost.comments.length > 0) &&
              <div className="flex items-center gap-3 text-xs text-text-muted py-2 border-y border-border">
                    {livePost.likes > 0 &&
                <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <Heart className="w-2.5 h-2.5 fill-white" />
                        </span>
                        {livePost.likes}
                      </span>
                }
                    {livePost.comments.length > 0 &&
                <span>{livePost.comments.length} comments</span>
                }
                  </div>
              }

                {/* Actions */}
                <div className="grid grid-cols-2 py-1">
                  <ActionButton
                  icon={Heart}
                  label="Like"
                  active={livePost.liked}
                  activeClass="text-red-500"
                  fill={livePost.liked}
                  onClick={() =>
                  dispatch(communitySlice.actions.toggleLike(livePost.id))
                  } />
                
                  <ActionButton
                  icon={MessageCircle}
                  label="Comment"
                  onClick={() => {
                    if (livePost.commentsDisabled) {
                      toast.error('Comments are disabled on this post');
                      return;
                    }
                    const el = document.getElementById(
                      'community-comment-input'
                    );
                    el?.focus();
                  }} />
                </div>
              </div>

              {/* Comments */}
              <div className="px-4 pb-4 border-t border-border pt-3">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  Comments ({livePost.comments.length})
                </p>
                {livePost.commentsDisabled ?
              <p className="text-sm text-text-muted text-center py-4">
                    Comments have been disabled on this post.
                  </p> :
              topLevelComments.length === 0 ?
              <p className="text-sm text-text-muted text-center py-4">
                    Be the first to comment.
                  </p> :

              <div className="flex flex-col gap-4">
                    {topLevelComments.map((c) =>
                <div key={c.id} className="flex flex-col gap-2">
                        {renderComment(c)}
                        {getReplies(c.id).map((reply) =>
                  renderComment(reply, {
                    nested: true
                  })
                  )}
                      </div>
                )}
                  </div>
              }
              </div>
            </div>

            {/* Comment input */}
            {!livePost.commentsDisabled &&
            <div className="border-t border-border bg-surface">
              {replyingTo &&
            <div className="px-4 pt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-text-muted">
                    Replying to{' '}
                    <span className="font-bold text-text">
                      {replyingTo.author}
                    </span>
                  </p>
                  <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-text-muted hover:text-text p-1"
                aria-label="Cancel reply">
                
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
            }
              <div className="p-3 flex items-center gap-2">
                <input
              ref={commentInputRef}
              id="community-comment-input"
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitComment();
              }}
              placeholder={
              replyingTo ?
              `Reply to ${replyingTo.author}...` :
              'Write a comment...'
              }
              className="flex-1 h-11 px-4 rounded-full bg-surface-2 border border-border focus:border-primary outline-none text-sm" />
            
              <button
              onClick={submitComment}
              disabled={!comment.trim()}
              className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary-hover transition-colors"
              aria-label="Send">
              
                <Send className="w-4 h-4" strokeWidth={1.75} />
              </button>
              </div>
            </div>
            }
    </SheetModal>);

}
// ============ Groups sheet ============
const GROUP_COLORS = [
'#B89150',
'#7E9568',
'#2D1B5E',
'#C9BDD9',
'#2563EB',
'#DC2626'];
const GROUP_ICONS = ['🦁', '🥬', '👨‍👩‍👧', '🌱', '🥗', '💪', '📚', '✨'];

function GroupsSheet({
  open,
  onClose,
  isAdmin,
  initialGroupId,
  detailGroup,
  setDetailGroup
}: {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  initialGroupId?: string;
  detailGroup: CommunityGroup | null;
  setDetailGroup: (group: CommunityGroup | null) => void;
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { groups } = useSelector((state: RootState) => state.community);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (open && initialGroupId && !detailGroup) {
      const target = groups.find((g) => g.id === initialGroupId);
      if (target) setDetailGroup(target);
    }
  }, [open, initialGroupId, groups, detailGroup, setDetailGroup]);

  const handleClose = () => {
    setDetailGroup(null);
    onClose();
  };

  return (
    <>
      <SheetModal
        open={open && !detailGroup}
        onClose={handleClose}
        title="Browse groups"
        header={
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">Browse groups</h3>
            <div className="flex items-center gap-1">
              {isAdmin &&
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="p-2 text-primary hover:bg-surface-2 rounded-full"
              aria-label="Create group">
              
                  <Plus className="w-5 h-5" />
                </button>
            }
              <button
              type="button"
              onClick={handleClose}
              className="p-2 -mr-2 text-text-muted hover:text-text"
              aria-label="Close">
              
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        }
        panelClassName="max-h-[88vh]">
        
        <div className="flex flex-col gap-2">
          {groups.map((g) =>
          <div
            key={g.id}
            className="bg-surface border border-border rounded-2xl p-3 flex items-center gap-3">
            
              <button
              type="button"
              onClick={() => setDetailGroup(g)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-90 transition-opacity">
              
                <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: g.color + '20'
                }}>
                
                  {g.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text text-sm">{g.name}</p>
                  <p className="text-[11px] text-text-muted truncate">
                    {g.members.toLocaleString()} member
                    {g.members === 1 ? '' : 's'} · {g.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </button>
              <button
              onClick={() => {
                if (g.joined) {
                  dispatch(communitySlice.actions.toggleGroupJoin(g.id));
                } else {
                  navigate(`/community/join/${g.id}`);
                }
              }}
              className={`text-xs font-bold px-3 h-8 rounded-lg transition-colors flex-shrink-0 ${g.joined ? 'bg-surface-2 text-text border border-border' : 'bg-primary text-white'}`}>
              
                {g.joined ? 'Leave' : 'Join'}
              </button>
            </div>
          )}
        </div>
      </SheetModal>

      <CreateGroupSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)} />
      
    </>);

}

function CreateGroupSheet({
  open,
  onClose



}: {open: boolean;onClose: () => void;}) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(GROUP_ICONS[0]);
  const [color, setColor] = useState(GROUP_COLORS[0]);

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setIcon(GROUP_ICONS[0]);
      setColor(GROUP_COLORS[0]);
    }
  }, [open]);

  const submit = () => {
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    dispatch(
      communitySlice.actions.createGroup({
        name: name.trim(),
        description: description.trim(),
        icon,
        color
      })
    );
    toast.success('Group created');
    onClose();
  };

  return (
    <SheetModal open={open} onClose={onClose} title="Create group">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm" />
          
        </div>
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group about?"
            rows={3}
            className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none" />
          
        </div>
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {GROUP_ICONS.map((emoji) =>
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-colors ${icon === emoji ? 'border-primary bg-primary/10' : 'border-border bg-surface-2'}`}>
              
                {emoji}
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {GROUP_COLORS.map((c) =>
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-xl border-2 transition-all ${color === c ? 'border-text scale-105' : 'border-transparent'}`}
              style={{
                background: c
              }}
              aria-label="Group color" />

            )}
          </div>
        </div>
        <button
          onClick={submit}
          className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
          
          Create group
        </button>
      </div>
    </SheetModal>);

}

function GroupDetailSheet({
  group,
  isAdmin,
  currentUserName,
  currentUserEmail,
  onOpenPost,
  onReportUser,
  onClose
}: {
  group: CommunityGroup | null;
  isAdmin: boolean;
  currentUserName: string;
  currentUserEmail?: string;
  onOpenPost?: (post: CommunityPost) => void;
  onReportUser?: (userId: string, userName: string) => void;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { members: platformMembers } = useSelector(
    (state: RootState) => state.admin
  );
  const { posts } = useSelector((state: RootState) => state.community);
  const liveGroup = useSelector((state: RootState) =>
  group ?
  state.community.groups.find((g) => g.id === group.id) ?? group :
  null
  );
  const [inviteQuery, setInviteQuery] = useState('');

  useEffect(() => {
    if (group) setInviteQuery('');
  }, [group]);

  if (!liveGroup) return null;

  const currentUserId = resolveUserId(
    currentUserEmail,
    currentUserName,
    platformMembers
  );
  const isGroupMember =
    liveGroup.joined || liveGroup.memberIds.includes(currentUserId);
  const canInvite = isGroupMember || isAdmin;
  const adminIds = liveGroup.adminIds ?? [];

  const groupMembers = liveGroup.memberIds.map((id) => {
    const member = platformMembers.find((m) => m.id === id);
    return {
      id,
      name: member?.name ?? `Member ${id}`,
      email: member?.email ?? '',
      status: member?.status,
      isGroupAdmin: adminIds.includes(id)
    };
  });

  const invitableMembers = platformMembers.filter(
    (m) =>
    !liveGroup.memberIds.includes(m.id) &&
    m.status !== 'banned' &&
    (m.name.toLowerCase().includes(inviteQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(inviteQuery.toLowerCase()))
  );

  const canRemoveMember = (memberId: string) =>
    (isAdmin || adminIds.includes(currentUserId)) &&
    memberId !== currentUserId;

  const groupPosts =
    liveGroup.joined ?
      posts.filter((p) => p.group === liveGroup.id) :
      [];

  return (
    <SheetModal
      open={!!group}
      onClose={onClose}
      hideHeader
      noPadding
      panelClassName="flex flex-col max-h-[92vh]">
      
      <div
        className="p-4 text-white relative overflow-hidden"
        style={{
          background: liveGroup.color
        }}>
        
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="flex items-start justify-between relative">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl flex-shrink-0">
              {liveGroup.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base">{liveGroup.name}</h3>
              <p className="text-[11px] opacity-80 mt-0.5">
                {liveGroup.members} member{liveGroup.members === 1 ? '' : 's'}
              </p>
              <p className="text-xs opacity-90 mt-2 leading-snug">
                {liveGroup.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white flex-shrink-0"
            aria-label="Close">
            
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Posts ({groupPosts.length})
        </p>
        {!liveGroup.joined ?
        <p className="text-sm text-text-muted text-center py-6 bg-surface-2 rounded-2xl border border-dashed border-border mb-6">
            Join this group to see posts.
          </p> :
        groupPosts.length === 0 ?
        <p className="text-sm text-text-muted text-center py-6 bg-surface-2 rounded-2xl border border-dashed border-border mb-6">
            No posts in this group yet.
          </p> :

        <div className="flex flex-col gap-2 mb-6">
            {groupPosts.map((groupPost) =>
          <button
            key={groupPost.id}
            type="button"
            onClick={() => onOpenPost?.(groupPost)}
            className="w-full text-left p-3 bg-surface border border-border rounded-2xl hover:border-primary/40 transition-colors">
            
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-text truncate">
                    {groupPost.author}
                  </p>
                  <span className="text-[11px] text-text-muted flex-shrink-0">
                    {groupPost.time}
                  </span>
                </div>
                <p className="text-sm text-text-muted line-clamp-2">
                  {groupPost.content}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted">
                  <span>{groupPost.likes} likes</span>
                  <span>{groupPost.comments.length} comments</span>
                </div>
              </button>
          )}
          </div>
        }

        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Members ({groupMembers.length})
        </p>
        {groupMembers.length === 0 ?
        <p className="text-sm text-text-muted text-center py-6 bg-surface-2 rounded-2xl border border-dashed border-border">
            No members yet.
            {canInvite ? ' Invite users below.' : ''}
          </p> :

        <div className="flex flex-col gap-2 mb-6">
            {groupMembers.map((member) =>
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 bg-surface border border-border rounded-2xl">
            
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-bold text-text truncate">
                      {member.name}
                    </p>
                    {member.isGroupAdmin &&
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                }
                    {member.status === 'banned' &&
                <span className="text-[10px] font-bold text-amber-700 bg-amber-500/15 px-1.5 py-0.5 rounded">
                        Banned
                      </span>
                }
                  </div>
                  <p className="text-xs text-text-muted truncate">
                    {member.email || 'Community member'}
                  </p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {member.id !== currentUserId && onReportUser &&
              <button
                type="button"
                onClick={() => onReportUser(member.id, member.name)}
                className="text-[10px] font-bold text-red-500 px-2 py-1 hover:bg-red-500/10 rounded-lg transition-colors whitespace-nowrap">
                
                    Report
                  </button>
              }
                  {isAdmin &&
              <button
                type="button"
                onClick={() => {
                  dispatch(
                    communitySlice.actions.setGroupAdmin({
                      groupId: liveGroup.id,
                      userId: member.id,
                      promote: !member.isGroupAdmin
                    })
                  );
                  toast.success(
                    member.isGroupAdmin ?
                      `${member.name} is no longer a group admin` :
                      `${member.name} is now a group admin`
                  );
                }}
                className="text-[10px] font-bold text-primary px-2 py-1 hover:bg-primary/10 rounded-lg transition-colors whitespace-nowrap">
                
                    {member.isGroupAdmin ? 'Remove admin' : 'Make admin'}
                  </button>
              }
                  {canRemoveMember(member.id) &&
              <button
                type="button"
                onClick={() => {
                  dispatch(
                    communitySlice.actions.removeUserFromGroup({
                      groupId: liveGroup.id,
                      userId: member.id
                    })
                  );
                  toast.success(`${member.name} removed`);
                }}
                className="text-[10px] font-bold text-red-500 px-2 py-1 hover:bg-red-500/10 rounded-lg transition-colors whitespace-nowrap">
                
                    Remove
                  </button>
              }
                </div>
              </div>
          )}
          </div>
        }

        {canInvite &&
        <>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Invite members
            </p>
            <input
            value={inviteQuery}
            onChange={(e) => setInviteQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm mb-3" />
          
            <div className="flex flex-col gap-2">
              {invitableMembers.length === 0 ?
            <p className="text-sm text-text-muted text-center py-4">
                  {inviteQuery ?
              'No matching users found.' :
              'All platform members are already in this group.'}
                </p> :

            invitableMembers.map((member) =>
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-surface border border-border rounded-2xl">
              
                  <div className="w-9 h-9 rounded-full bg-surface-2 text-text flex items-center justify-center font-bold text-xs flex-shrink-0 border border-border">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {member.email}
                    </p>
                  </div>
                  <button
                type="button"
                onClick={() => {
                  dispatch(
                    communitySlice.actions.inviteUserToGroup({
                      groupId: liveGroup.id,
                      userId: member.id
                    })
                  );
                  toast.success(`${member.name} invited`);
                }}
                className="text-xs font-bold px-3 h-8 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors flex-shrink-0">
                
                    Invite
                  </button>
                </div>
            )
            }
            </div>
          </>
        }
      </div>

      {liveGroup.joined ?
      <div className="p-4 border-t border-border bg-surface">
          <button
            type="button"
            onClick={() => {
              dispatch(communitySlice.actions.toggleGroupJoin(liveGroup.id));
              if (
                currentUserId &&
                liveGroup.memberIds.includes(currentUserId)
              ) {
                dispatch(
                  communitySlice.actions.removeUserFromGroup({
                    groupId: liveGroup.id,
                    userId: currentUserId
                  })
                );
              }
              toast.success(`Left ${liveGroup.name}`);
              onClose();
            }}
            className="w-full h-11 rounded-xl border border-border text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors">
            Leave group
          </button>
        </div> :
      <div className="p-4 border-t border-border bg-surface">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/community/join/${liveGroup.id}`);
            }}
            className="w-full h-11 rounded-xl bg-primary text-white text-sm font-bold">
            Join community
          </button>
        </div>
      }
    </SheetModal>);

}