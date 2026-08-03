import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Video,
  Headphones,
  FileText,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { RootState } from '../../store';
import {
  adminProgramsSlice,
  AdminProgram,
  AudioLessonModule,
  BookLessonModule,
  normalizeAdminProgram,
  TextLessonModule,
  VideoLessonModule
} from '../../store/adminProgramsSlice';
import { SheetModal, ConfirmModal } from '../../components/modals';
import {
  AudioTracksEditor,
  BookItemBadge,
  BookTopicsEditor,
  Field,
  TextPartsEditor,
  LessonTopicAccordion,
  sortByOrder,
  renumberOrders,
  VideoItemsEditor
} from './adminProgramLessonUi';

type LessonTab = 'books' | 'video' | 'audio' | 'text';
type View = 'list' | 'detail';

const LESSON_TABS: { id: LessonTab; label: string; icon: typeof BookOpen }[] = [
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'audio', label: 'Audio', icon: Headphones },
  { id: 'text', label: 'Text', icon: FileText }
];

function EmptyModules({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="p-8 text-center text-sm text-text-muted bg-surface border border-dashed border-border rounded-xl">
      <p className="mb-3">No {label}s yet.</p>
      <button
        type="button"
        onClick={onAdd}
        className="h-9 px-4 bg-primary text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 hover:bg-primary-hover">
        <Plus className="w-3.5 h-3.5" />
        Add topic
      </button>
    </div>
  );
}

function sortedByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function AdminPrograms() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { programs: rawPrograms } = useSelector(
    (state: RootState) => state.adminPrograms
  );

  const programs = useMemo(
    () =>
      rawPrograms.map((p) =>
        normalizeAdminProgram(p as unknown as Record<string, unknown>)
      ),
    [rawPrograms]
  );

  useEffect(() => {
    dispatch(adminProgramsSlice.actions.migratePrograms());
  }, [dispatch]);

  const [view, setView] = useState<View>('list');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [lessonTab, setLessonTab] = useState<LessonTab>('books');

  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [programIsNew, setProgramIsNew] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AdminProgram | null>(null);
  const [deleteProgramOpen, setDeleteProgramOpen] = useState(false);

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookIsNew, setBookIsNew] = useState(false);
  const [editingBook, setEditingBook] = useState<BookLessonModule | null>(null);

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoIsNew, setVideoIsNew] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoLessonModule | null>(null);

  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [audioIsNew, setAudioIsNew] = useState(false);
  const [editingAudio, setEditingAudio] = useState<AudioLessonModule | null>(null);

  const [textModalOpen, setTextModalOpen] = useState(false);
  const [textIsNew, setTextIsNew] = useState(false);
  const [editingText, setEditingText] = useState<TextLessonModule | null>(null);

  const [deleteLesson, setDeleteLesson] = useState<{
    tab: LessonTab;
    id: string;
    title: string;
  } | null>(null);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId) ?? null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const openProgramList = () => {
    setView('list');
    setSelectedProgramId(null);
  };

  const openProgramDetail = (id: string) => {
    setSelectedProgramId(id);
    setLessonTab('books');
    setView('detail');
  };

  const emptyProgram = (): AdminProgram => ({
    id: `prog-${Date.now()}`,
    title: '',
    subtitle: '',
    description: '',
    active: true,
    bookLessons: [],
    videoLessons: [],
    audioLessons: [],
    textLessons: []
  });

  const openNewProgram = () => {
    setEditingProgram(emptyProgram());
    setProgramIsNew(true);
    setProgramModalOpen(true);
  };

  const openEditProgram = () => {
    if (!selectedProgram) return;
    setEditingProgram({ ...selectedProgram });
    setProgramIsNew(false);
    setProgramModalOpen(true);
  };

  const saveProgram = () => {
    if (!editingProgram?.title.trim()) {
      toast.error('Program title is required');
      return;
    }
    const payload = {
      ...editingProgram,
      title: editingProgram.title.trim(),
      subtitle: editingProgram.subtitle.trim(),
      description: editingProgram.description.trim()
    };
    if (programIsNew) {
      dispatch(adminProgramsSlice.actions.addProgram(payload));
      toast.success('Program created');
      setProgramModalOpen(false);
      setEditingProgram(null);
      openProgramDetail(payload.id);
    } else {
      dispatch(adminProgramsSlice.actions.updateProgram(payload));
      toast.success('Program updated');
      setProgramModalOpen(false);
      setEditingProgram(null);
    }
  };

  const confirmDeleteProgram = () => {
    if (!selectedProgram) return;
    dispatch(adminProgramsSlice.actions.deleteProgram(selectedProgram.id));
    toast.success('Program deleted');
    setDeleteProgramOpen(false);
    openProgramList();
  };

  const nextOrder = (items: { order: number }[]) =>
    items.length ? Math.max(...items.map((i) => i.order)) + 1 : 1;

  // --- Book lessons ---
  const openNewBook = () => {
    if (!selectedProgram) return;
    setEditingBook({
      id: `bl-${Date.now()}`,
      title: '',
      description: '',
      order: nextOrder(selectedProgram.bookLessons),
      topics: []
    });
    setBookIsNew(true);
    setBookModalOpen(true);
  };

  const openEditBook = (lesson: BookLessonModule) => {
    setEditingBook({
      ...lesson,
      topics: (lesson.topics ?? []).map((t) => ({
        ...t,
        parts: [...(t.parts ?? [])]
      }))
    });
    setBookIsNew(false);
    setBookModalOpen(true);
  };

  const saveBook = () => {
    if (!selectedProgram || !editingBook?.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    const payload = {
      ...editingBook,
      title: editingBook.title.trim(),
      description: editingBook.description.trim(),
      topics: renumberOrders(editingBook.topics ?? []).map((t) => ({
        ...t,
        parts: renumberOrders(t.parts ?? [])
      }))
    };
    if (bookIsNew) {
      dispatch(
        adminProgramsSlice.actions.addBookLesson({
          programId: selectedProgram.id,
          lesson: payload
        })
      );
      toast.success('Book added');
    } else {
      dispatch(
        adminProgramsSlice.actions.updateBookLesson({
          programId: selectedProgram.id,
          lesson: payload
        })
      );
      toast.success('Book saved');
    }
    setBookModalOpen(false);
    setEditingBook(null);
  };

  // --- Video lessons ---
  const openNewVideo = () => {
    if (!selectedProgram) return;
    setEditingVideo({
      id: `vl-${Date.now()}`,
      title: '',
      description: '',
      order: nextOrder(selectedProgram.videoLessons),
      videos: []
    });
    setVideoIsNew(true);
    setVideoModalOpen(true);
  };

  const openEditVideo = (lesson: VideoLessonModule) => {
    setEditingVideo({ ...lesson, videos: [...(lesson.videos ?? [])] });
    setVideoIsNew(false);
    setVideoModalOpen(true);
  };

  const saveVideo = () => {
    if (!selectedProgram || !editingVideo?.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    const payload = {
      ...editingVideo,
      title: editingVideo.title.trim(),
      description: editingVideo.description.trim(),
      videos: renumberOrders(editingVideo.videos ?? [])
    };
    if (videoIsNew) {
      dispatch(
        adminProgramsSlice.actions.addVideoLesson({
          programId: selectedProgram.id,
          lesson: payload
        })
      );
      toast.success('Video module added');
    } else {
      dispatch(
        adminProgramsSlice.actions.updateVideoLesson({
          programId: selectedProgram.id,
          lesson: payload
        })
      );
      toast.success('Video module saved');
    }
    setVideoModalOpen(false);
    setEditingVideo(null);
  };

  // --- Audio lessons ---
  const openNewAudio = () => {
    if (!selectedProgram) return;
    setEditingAudio({
      id: `al-${Date.now()}`,
      title: '',
      description: '',
      order: nextOrder(selectedProgram.audioLessons),
      tracks: []
    });
    setAudioIsNew(true);
    setAudioModalOpen(true);
  };

  const openEditAudio = (lesson: AudioLessonModule) => {
    setEditingAudio({ ...lesson, tracks: [...(lesson.tracks ?? [])] });
    setAudioIsNew(false);
    setAudioModalOpen(true);
  };

  const saveAudio = () => {
    if (!selectedProgram || !editingAudio?.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    const payload = {
      ...editingAudio,
      title: editingAudio.title.trim(),
      description: editingAudio.description.trim(),
      tracks: renumberOrders(editingAudio.tracks ?? [])
    };
    if (audioIsNew) {
      dispatch(
        adminProgramsSlice.actions.addAudioLesson({
          programId: selectedProgram.id,
          lesson: payload
        })
      );
      toast.success('Audio module added');
    } else {
      dispatch(
        adminProgramsSlice.actions.updateAudioLesson({
          programId: selectedProgram.id,
          lesson: payload
        })
      );
      toast.success('Audio module saved');
    }
    setAudioModalOpen(false);
    setEditingAudio(null);
  };

  // --- Text lessons ---
  const openNewText = () => {
    if (!selectedProgram) return;
    setEditingText({
      id: `tl-${Date.now()}`,
      title: '',
      description: '',
      order: nextOrder(selectedProgram.textLessons),
      parts: []
    });
    setTextIsNew(true);
    setTextModalOpen(true);
  };

  const openEditText = (lesson: TextLessonModule) => {
    setEditingText({ ...lesson, parts: [...(lesson.parts ?? [])] });
    setTextIsNew(false);
    setTextModalOpen(true);
  };

  const saveText = () => {
    if (!selectedProgram || !editingText?.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    const payload = {
      ...editingText,
      title: editingText.title.trim(),
      description: editingText.description.trim(),
      parts: renumberOrders(editingText.parts ?? [])
    };
    if (textIsNew) {
      dispatch(
        adminProgramsSlice.actions.addTextLesson({
          programId: selectedProgram.id,
          lesson: payload
        })
      );
      toast.success('Text module added');
    } else {
      dispatch(
        adminProgramsSlice.actions.updateTextLesson({
          programId: selectedProgram.id,
          lesson: payload
        })
      );
      toast.success('Text module saved');
    }
    setTextModalOpen(false);
    setEditingText(null);
  };

  const confirmDeleteLesson = () => {
    if (!selectedProgram || !deleteLesson) return;
    const { tab, id } = deleteLesson;
    const programId = selectedProgram.id;
    if (tab === 'books') {
      dispatch(adminProgramsSlice.actions.deleteBookLesson({ programId, lessonId: id }));
    } else if (tab === 'video') {
      dispatch(adminProgramsSlice.actions.deleteVideoLesson({ programId, lessonId: id }));
    } else if (tab === 'audio') {
      dispatch(adminProgramsSlice.actions.deleteAudioLesson({ programId, lessonId: id }));
    } else {
      dispatch(adminProgramsSlice.actions.deleteTextLesson({ programId, lessonId: id }));
    }
    toast.success('Module removed');
    setDeleteLesson(null);
  };

  const moduleCount = (p: AdminProgram) => {
    const segments =
      (p.bookLessons?.length ?? 0) +
      (p.videoLessons?.length ?? 0) +
      (p.audioLessons?.length ?? 0) +
      (p.textLessons?.length ?? 0);
    const items =
      (p.bookLessons ?? []).reduce(
        (n, s) =>
          n + (s.topics ?? []).reduce((tn, t) => tn + (t.parts?.length ?? 0), 0),
        0
      ) +
      (p.videoLessons ?? []).reduce((n, s) => n + (s.videos?.length ?? 0), 0) +
      (p.audioLessons ?? []).reduce((n, s) => n + (s.tracks?.length ?? 0), 0) +
      (p.textLessons ?? []).reduce((n, s) => n + (s.parts?.length ?? 0), 0);
    return { segments, items };
  };

  const renderModuleActions = (
    tab: LessonTab,
    lessonId: string,
    title: string,
    onEdit: () => void
  ) => (
    <div className="flex flex-col gap-1 shrink-0">
      <button
        type="button"
        onClick={onEdit}
        className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface-2"
        aria-label="Edit module">
        <Pencil className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setDeleteLesson({ tab, id: lessonId, title })}
        className="p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
        aria-label="Delete module">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  const openAddForTab = () => {
    if (lessonTab === 'books') openNewBook();
    else if (lessonTab === 'video') openNewVideo();
    else if (lessonTab === 'audio') openNewAudio();
    else openNewText();
  };

  const countBookParts = (book: BookLessonModule) =>
    (book.topics ?? []).reduce((n, t) => n + (t.parts?.length ?? 0), 0);

  const tabLabel =
    lessonTab === 'books'
      ? 'book'
      : lessonTab === 'video'
        ? 'video'
        : lessonTab === 'audio'
          ? 'audio'
          : 'text';

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      <div className="bg-primary text-white">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (view === 'detail' ? openProgramList() : navigate(-1))}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold">
            {view === 'detail' && selectedProgram
              ? selectedProgram.title
              : 'Programs'}
          </span>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 pt-5 max-w-3xl mx-auto w-full">
        {view === 'list' && (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-2xl font-extrabold text-accent-sage">Programs</h2>
              <button
                type="button"
                onClick={openNewProgram}
                className="h-10 px-4 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-md shadow-primary/20 hover:bg-primary-hover shrink-0">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Add Program
              </button>
            </div>

            {programs.length === 0 ? (
              <div className="p-10 text-center text-sm text-text-muted bg-surface border border-dashed border-border rounded-2xl">
                No programs yet. Tap Add Program to create your first LMS program.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {programs.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => openProgramDetail(p.id)}
                      className="w-full text-left bg-surface border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-base font-bold text-text leading-snug">
                            {p.title}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.active ? 'bg-accent-sage/15 text-accent-sage border border-accent-sage/30' : 'bg-surface-2 text-text-muted border border-border'}`}>
                            {p.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {p.subtitle && (
                          <p className="text-xs text-text-muted mt-0.5">{p.subtitle}</p>
                        )}
                        <p className="text-xs text-text-muted mt-2">
                          {p.bookLessons.length} book
                          {p.bookLessons.length === 1 ? '' : 's'} ·{' '}
                          {p.videoLessons.length +
                            p.audioLessons.length +
                            p.textLessons.length}{' '}
                          other topics · {moduleCount(p).items} media items
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {view === 'detail' && selectedProgram && (
          <>
            <div className="bg-accent-lavender/15 border border-accent-lavender/25 rounded-2xl p-5 mb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-text leading-snug">
                    {selectedProgram.title}
                  </h3>
                  {selectedProgram.subtitle && (
                    <p className="text-sm text-text-muted mt-1">
                      {selectedProgram.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={openEditProgram}
                    className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface/80"
                    aria-label="Edit program">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteProgramOpen(true)}
                    className="p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                    aria-label="Delete program">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {selectedProgram.description && (
                <p className="text-sm text-text leading-relaxed">
                  {selectedProgram.description}
                </p>
              )}
            </div>

            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Lesson types
            </p>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-4">
              {LESSON_TABS.map(({ id, label, icon: Icon }) => {
                const active = lessonTab === id;
                const count =
                  id === 'books'
                    ? selectedProgram.bookLessons.length
                    : id === 'video'
                      ? selectedProgram.videoLessons.length
                      : id === 'audio'
                        ? selectedProgram.audioLessons.length
                        : selectedProgram.textLessons.length;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLessonTab(id)}
                    className={`px-3 h-10 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0 flex items-center gap-1.5 ${active ? 'bg-primary text-white border-primary' : 'bg-surface text-text border-border hover:border-primary/40'}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-text capitalize">
                {lessonTab === 'books' ? 'Books' : `${tabLabel} topics`}
              </h4>
              <button
                type="button"
                onClick={openAddForTab}
                className="h-9 px-3 bg-primary text-white rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-primary-hover">
                <Plus className="w-3.5 h-3.5" />
                {lessonTab === 'books' ? 'Add book' : 'Add topic'}
              </button>
            </div>

            {lessonTab === 'books' &&
              (selectedProgram.bookLessons.length === 0 ? (
                <EmptyModules label="book" onAdd={openNewBook} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedByOrder(selectedProgram.bookLessons).map((m) => (
                    <div
                      key={m.id}
                      className="bg-surface border border-border rounded-xl p-3 flex gap-3">
                      <GripVertical className="w-4 h-4 text-text-muted shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text">
                          #{m.order} {m.title}
                        </p>
                        {m.description && (
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">
                            {m.description}
                          </p>
                        )}
                        <BookItemBadge
                          topicCount={m.topics?.length ?? 0}
                          partCount={countBookParts(m)}
                        />
                        {sortByOrder(m.topics ?? [])
                          .slice(0, 2)
                          .map((topic) => (
                            <p
                              key={topic.id}
                              className="text-[10px] text-text-muted mt-1 truncate">
                              · #{topic.order} {topic.title} (
                              {topic.parts?.length ?? 0} files)
                            </p>
                          ))}
                      </div>
                      {renderModuleActions('books', m.id, m.title, () =>
                        openEditBook(m)
                      )}
                    </div>
                  ))}
                </div>
              ))}

            {lessonTab === 'video' &&
              (selectedProgram.videoLessons.length === 0 ? (
                <EmptyModules label="video topic" onAdd={openNewVideo} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedByOrder(selectedProgram.videoLessons).map((m, idx) => (
                    <LessonTopicAccordion
                      key={m.id}
                      order={m.order}
                      title={m.title}
                      description={m.description}
                      mediaKind="video"
                      defaultExpanded={idx === 0}
                      items={sortByOrder(m.videos ?? []).map((v) => ({
                        id: v.id,
                        order: v.order,
                        label: v.label,
                        hasFile: !!(v.fileName || v.embedUrl),
                        meta:
                          v.type === 'embed'
                            ? v.embedUrl
                              ? 'VIDEO · Embed link'
                              : 'VIDEO · Embed (no URL)'
                            : v.fileName
                              ? `VIDEO · ${v.fileName}`
                              : 'VIDEO · Upload pending'
                      }))}
                      onEdit={() => openEditVideo(m)}
                      onDelete={() =>
                        setDeleteLesson({ tab: 'video', id: m.id, title: m.title })
                      }
                    />
                  ))}
                </div>
              ))}

            {lessonTab === 'audio' &&
              (selectedProgram.audioLessons.length === 0 ? (
                <EmptyModules label="audio topic" onAdd={openNewAudio} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedByOrder(selectedProgram.audioLessons).map((m, idx) => (
                    <LessonTopicAccordion
                      key={m.id}
                      order={m.order}
                      title={m.title}
                      description={m.description}
                      mediaKind="audio"
                      defaultExpanded={idx === 0}
                      items={sortByOrder(m.tracks ?? []).map((t) => ({
                        id: t.id,
                        order: t.order,
                        label: t.label,
                        hasFile: !!t.fileName,
                        meta: t.fileName
                          ? `AUDIO · ${t.fileName}`
                          : 'AUDIO · Not uploaded'
                      }))}
                      onEdit={() => openEditAudio(m)}
                      onDelete={() =>
                        setDeleteLesson({ tab: 'audio', id: m.id, title: m.title })
                      }
                    />
                  ))}
                </div>
              ))}

            {lessonTab === 'text' &&
              (selectedProgram.textLessons.length === 0 ? (
                <EmptyModules label="text topic" onAdd={openNewText} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedByOrder(selectedProgram.textLessons).map((m, idx) => (
                    <LessonTopicAccordion
                      key={m.id}
                      order={m.order}
                      title={m.title}
                      description={m.description}
                      mediaKind="text"
                      defaultExpanded={idx === 0}
                      items={sortByOrder(m.parts ?? []).map((part) => ({
                        id: part.id,
                        order: part.order,
                        label: part.label,
                        hasFile: !!part.content?.trim(),
                        meta: part.content?.trim()
                          ? `TEXT · ${part.content.trim().slice(0, 48)}${part.content.length > 48 ? '…' : ''}`
                          : 'TEXT · Empty section'
                      }))}
                      onEdit={() => openEditText(m)}
                      onDelete={() =>
                        setDeleteLesson({ tab: 'text', id: m.id, title: m.title })
                      }
                    />
                  ))}
                </div>
              ))}
          </>
        )}
      </div>

      <SheetModal
        open={programModalOpen}
        title={programIsNew ? 'Add Program' : 'Edit Program'}
        onClose={() => {
          setProgramModalOpen(false);
          setEditingProgram(null);
        }}>
        {editingProgram && (
          <div className="flex flex-col gap-4">
            <Field label="Title" required>
              <input
                type="text"
                value={editingProgram.title}
                onChange={(e) =>
                  setEditingProgram({ ...editingProgram, title: e.target.value })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Subtitle">
              <input
                type="text"
                value={editingProgram.subtitle}
                onChange={(e) =>
                  setEditingProgram({ ...editingProgram, subtitle: e.target.value })
                }
                placeholder="e.g. By Misty Angelique"
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={editingProgram.description}
                onChange={(e) =>
                  setEditingProgram({
                    ...editingProgram,
                    description: e.target.value
                  })
                }
                rows={4}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </Field>
            <ToggleSwitch
              label="Active"
              checked={editingProgram.active}
              onChange={(active) =>
                setEditingProgram({ ...editingProgram, active })
              }
            />
            <button
              type="button"
              onClick={saveProgram}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
              {programIsNew ? 'Create Program' : 'Save Program'}
            </button>
          </div>
        )}
      </SheetModal>

      <SheetModal
        open={bookModalOpen}
        wide
        title={bookIsNew ? 'Add book' : 'Edit book'}
        onClose={() => {
          setBookModalOpen(false);
          setEditingBook(null);
        }}>
        {editingBook && (
          <div className="flex flex-col gap-4">
            <Field label="Book title" required>
              <input
                type="text"
                value={editingBook.title}
                onChange={(e) =>
                  setEditingBook({ ...editingBook, title: e.target.value })
                }
                placeholder="e.g. Book 1 — The Foundation"
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={editingBook.description}
                onChange={(e) =>
                  setEditingBook({ ...editingBook, description: e.target.value })
                }
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </Field>
            <Field label="Book order">
              <input
                type="number"
                min={1}
                value={editingBook.order}
                onChange={(e) =>
                  setEditingBook({
                    ...editingBook,
                    order: Math.max(1, Number(e.target.value) || 1)
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <BookTopicsEditor
              topics={editingBook.topics ?? []}
              onChange={(topics) => setEditingBook({ ...editingBook, topics })}
            />
            <button
              type="button"
              onClick={saveBook}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover">
              {bookIsNew ? 'Save' : 'Save changes'}
            </button>
          </div>
        )}
      </SheetModal>

      <SheetModal
        open={videoModalOpen}
        wide
        title={videoIsNew ? 'Add video topic' : 'Edit video topic'}
        onClose={() => {
          setVideoModalOpen(false);
          setEditingVideo(null);
        }}>
        {editingVideo && (
          <div className="flex flex-col gap-4">
            <Field label="Topic title" required>
              <input
                type="text"
                value={editingVideo.title}
                onChange={(e) =>
                  setEditingVideo({ ...editingVideo, title: e.target.value })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={editingVideo.description}
                onChange={(e) =>
                  setEditingVideo({ ...editingVideo, description: e.target.value })
                }
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </Field>
            <Field label="Order">
              <input
                type="number"
                min={1}
                value={editingVideo.order}
                onChange={(e) =>
                  setEditingVideo({
                    ...editingVideo,
                    order: Math.max(1, Number(e.target.value) || 1)
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <VideoItemsEditor
              videos={editingVideo.videos ?? []}
              onChange={(videos) => setEditingVideo({ ...editingVideo, videos })}
            />
            <button
              type="button"
              onClick={saveVideo}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover">
              {videoIsNew ? 'Save' : 'Save changes'}
            </button>
          </div>
        )}
      </SheetModal>

      <SheetModal
        open={audioModalOpen}
        wide
        title={audioIsNew ? 'Add audio topic' : 'Edit audio topic'}
        onClose={() => {
          setAudioModalOpen(false);
          setEditingAudio(null);
        }}>
        {editingAudio && (
          <div className="flex flex-col gap-4">
            <Field label="Topic title" required>
              <input
                type="text"
                value={editingAudio.title}
                onChange={(e) =>
                  setEditingAudio({ ...editingAudio, title: e.target.value })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={editingAudio.description}
                onChange={(e) =>
                  setEditingAudio({ ...editingAudio, description: e.target.value })
                }
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </Field>
            <Field label="Order">
              <input
                type="number"
                min={1}
                value={editingAudio.order}
                onChange={(e) =>
                  setEditingAudio({
                    ...editingAudio,
                    order: Math.max(1, Number(e.target.value) || 1)
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <AudioTracksEditor
              tracks={editingAudio.tracks ?? []}
              onChange={(tracks) => setEditingAudio({ ...editingAudio, tracks })}
            />
            <button
              type="button"
              onClick={saveAudio}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover">
              {audioIsNew ? 'Save' : 'Save changes'}
            </button>
          </div>
        )}
      </SheetModal>

      <SheetModal
        open={textModalOpen}
        wide
        title={textIsNew ? 'Add text topic' : 'Edit text topic'}
        onClose={() => {
          setTextModalOpen(false);
          setEditingText(null);
        }}>
        {editingText && (
          <div className="flex flex-col gap-4">
            <Field label="Topic title" required>
              <input
                type="text"
                value={editingText.title}
                onChange={(e) =>
                  setEditingText({ ...editingText, title: e.target.value })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={editingText.description}
                onChange={(e) =>
                  setEditingText({ ...editingText, description: e.target.value })
                }
                rows={2}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </Field>
            <Field label="Order">
              <input
                type="number"
                min={1}
                value={editingText.order}
                onChange={(e) =>
                  setEditingText({
                    ...editingText,
                    order: Math.max(1, Number(e.target.value) || 1)
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <TextPartsEditor
              parts={editingText.parts ?? []}
              onChange={(parts) => setEditingText({ ...editingText, parts })}
            />
            <button
              type="button"
              onClick={saveText}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover">
              {textIsNew ? 'Save' : 'Save changes'}
            </button>
          </div>
        )}
      </SheetModal>

      <ConfirmModal
        open={deleteProgramOpen}
        title="Delete program?"
        message={
          selectedProgram
            ? `Remove "${selectedProgram.title}" and all its lesson modules?`
            : undefined
        }
        onClose={() => setDeleteProgramOpen(false)}
        onConfirm={confirmDeleteProgram}
      />

      <ConfirmModal
        open={!!deleteLesson}
        title="Delete module?"
        message={
          deleteLesson
            ? `Remove "${deleteLesson.title}" from this program?`
            : undefined
        }
        onClose={() => setDeleteLesson(null)}
        onConfirm={confirmDeleteLesson}
      />
    </div>
  );
}
