import { useEffect, useMemo, useState } from 'react';
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
  GripVertical,
  Layers,
  ImageIcon,
  Lock
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
  ImageLessonModule,
  ProgramModule,
  ProgramSection,
  flattenProgramSections,
  findProgramSection,
  TextLessonModule,
  VideoLessonModule
} from '../../store/adminProgramsSlice';
import {
  countProgramItems,
  countProgramModules,
  countSectionItems,
  formatSectionLockDaysLabel,
  formatSectionLockDaysBadge,
  formatSectionLockProgressDetail,
  formatLockDaysUpdatedAt,
  formatUnlockDate,
  getSectionLockPreview,
  isFirstProgramSection,
  moduleCoverImage,
  programCoverImage,
  programSectionsForLocks,
  SECTION_UNLOCK_INTERVAL_DAYS,
  sectionCoverImage,
  sectionSummaryLabel
} from '../../utils/programDisplay';
import { SheetModal, ConfirmModal } from '../../components/modals';
import {
  AudioTracksEditor,
  BookItemBadge,
  BookTopicsEditor,
  Field,
  ImageItemsEditor,
  ImageUploadField,
  TextPartsEditor,
  LessonTopicAccordion,
  sortByOrder,
  renumberOrders,
  VideoItemsEditor
} from './adminProgramLessonUi';

type LessonTab = 'books' | 'video' | 'audio' | 'images' | 'text';
type View = 'list' | 'modules' | 'sections' | 'sectionDetail';

const LESSON_TABS: { id: LessonTab; label: string; icon: typeof BookOpen }[] = [
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'audio', label: 'Audio', icon: Headphones },
  { id: 'images', label: 'Images', icon: ImageIcon },
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
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [lessonTab, setLessonTab] = useState<LessonTab>('books');

  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [programIsNew, setProgramIsNew] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AdminProgram | null>(null);
  const [deleteProgramOpen, setDeleteProgramOpen] = useState(false);

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionIsNew, setSectionIsNew] = useState(false);
  const [restartLockCountdown, setRestartLockCountdown] = useState(false);
  const [editingSection, setEditingSection] = useState<ProgramSection | null>(null);
  const [deleteSectionOpen, setDeleteSectionOpen] = useState(false);

  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleIsNew, setModuleIsNew] = useState(false);
  const [editingModule, setEditingModule] = useState<ProgramModule | null>(null);
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookIsNew, setBookIsNew] = useState(false);
  const [editingBook, setEditingBook] = useState<BookLessonModule | null>(null);

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoIsNew, setVideoIsNew] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoLessonModule | null>(null);

  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [audioIsNew, setAudioIsNew] = useState(false);
  const [editingAudio, setEditingAudio] = useState<AudioLessonModule | null>(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageIsNew, setImageIsNew] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageLessonModule | null>(null);

  const [textModalOpen, setTextModalOpen] = useState(false);
  const [textIsNew, setTextIsNew] = useState(false);
  const [editingText, setEditingText] = useState<TextLessonModule | null>(null);

  const [deleteLesson, setDeleteLesson] = useState<{
    tab: LessonTab;
    id: string;
    title: string;
  } | null>(null);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId) ?? null;
  const selectedModule =
    selectedProgram?.modules.find((m) => m.id === selectedModuleId) ?? null;
  const selectedSection =
    selectedProgram && selectedSectionId
      ? findProgramSection(selectedProgram, selectedSectionId) ?? null
      : null;

  const lockSections = selectedProgram ? programSectionsForLocks(selectedProgram) : [];

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return <Navigate to="/home" replace />;
  }

  const openProgramList = () => {
    setView('list');
    setSelectedProgramId(null);
    setSelectedModuleId(null);
    setSelectedSectionId(null);
  };

  const openProgramModules = (id: string) => {
    setSelectedProgramId(id);
    setSelectedModuleId(null);
    setSelectedSectionId(null);
    setView('modules');
  };

  const openModuleSections = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedSectionId(null);
    setView('sections');
  };

  const openSectionDetail = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setLessonTab('books');
    setView('sectionDetail');
  };

  const emptyProgram = (): AdminProgram => ({
    id: `prog-${Date.now()}`,
    title: '',
    subtitle: '',
    description: '',
    active: true,
    modules: []
  });

  const emptyModule = (order: number): ProgramModule => ({
    id: `mod-${Date.now()}`,
    title: '',
    description: '',
    order,
    sections: []
  });

  const emptySection = (order: number, programSectionIndex: number): ProgramSection => ({
    id: `sec-${Date.now()}`,
    title: '',
    description: '',
    order,
    lockDays: programSectionIndex === 0 ? 0 : SECTION_UNLOCK_INTERVAL_DAYS,
    bookLessons: [],
    videoLessons: [],
    audioLessons: [],
    imageLessons: [],
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
      description: editingProgram.description.trim(),
      modules: editingProgram.modules ?? []
    };
    if (programIsNew) {
      if (payload.modules.length === 0) {
        payload.modules = [
          {
            id: `mod-${payload.id}-1`,
            title: 'Module 1',
            description: '',
            order: 1,
            sections: []
          }
        ];
      }
      dispatch(adminProgramsSlice.actions.addProgram(payload));
      toast.success('Program created');
      setProgramModalOpen(false);
      setEditingProgram(null);
      openProgramModules(payload.id);
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

  const openNewModule = () => {
    if (!selectedProgram) return;
    setEditingModule(emptyModule(nextOrder(selectedProgram.modules)));
    setModuleIsNew(true);
    setModuleModalOpen(true);
  };

  const openEditModule = (mod: ProgramModule) => {
    setEditingModule({ ...mod });
    setModuleIsNew(false);
    setModuleModalOpen(true);
  };

  const saveModule = () => {
    if (!selectedProgram || !editingModule?.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    const payload = {
      ...editingModule,
      title: editingModule.title.trim(),
      description: editingModule.description.trim()
    };
    if (moduleIsNew) {
      dispatch(
        adminProgramsSlice.actions.addModule({
          programId: selectedProgram.id,
          module: payload
        })
      );
      toast.success('Module created');
    } else {
      dispatch(
        adminProgramsSlice.actions.updateModule({
          programId: selectedProgram.id,
          module: payload
        })
      );
      toast.success('Module updated');
    }
    setModuleModalOpen(false);
    setEditingModule(null);
  };

  const confirmDeleteModule = () => {
    if (!selectedProgram || !selectedModule) return;
    dispatch(
      adminProgramsSlice.actions.deleteModule({
        programId: selectedProgram.id,
        moduleId: selectedModule.id
      })
    );
    toast.success('Module deleted');
    setDeleteModuleOpen(false);
    setSelectedModuleId(null);
    setView('modules');
  };

  const openNewSection = () => {
    if (!selectedProgram || !selectedModule) return;
    const programSectionIndex = flattenProgramSections(selectedProgram).length;
    const order = nextOrder(selectedModule.sections);
    setEditingSection(emptySection(order, programSectionIndex));
    setSectionIsNew(true);
    setRestartLockCountdown(programSectionIndex > 0);
    setSectionModalOpen(true);
  };

  const openEditSection = (section: ProgramSection) => {
    setEditingSection({ ...section });
    setSectionIsNew(false);
    setRestartLockCountdown(false);
    setSectionModalOpen(true);
  };

  const saveSection = () => {
    if (!selectedProgram || !editingSection?.title.trim()) {
      toast.error('Section title is required');
      return;
    }
    const existing = findProgramSection(selectedProgram, editingSection.id);
    const lockDays = Math.max(0, Number(editingSection.lockDays) || 0);
    const lockDaysChanged = sectionIsNew || existing?.lockDays !== lockDays;

    let lockDaysUpdatedAt: number | undefined;
    if (lockDays <= 0) {
      lockDaysUpdatedAt = undefined;
    } else if (lockDaysChanged || restartLockCountdown || !existing?.lockDaysUpdatedAt) {
      lockDaysUpdatedAt = Date.now();
    } else {
      lockDaysUpdatedAt = existing.lockDaysUpdatedAt;
    }

    const payload = {
      ...editingSection,
      title: editingSection.title.trim(),
      description: editingSection.description.trim(),
      lockDays,
      lockDaysUpdatedAt
    };
    if (sectionIsNew) {
      if (!selectedModule) return;
      dispatch(
        adminProgramsSlice.actions.addSection({
          programId: selectedProgram.id,
          moduleId: selectedModule.id,
          section: payload
        })
      );
      toast.success('Section created');
    } else {
      dispatch(
        adminProgramsSlice.actions.updateSection({
          programId: selectedProgram.id,
          section: payload
        })
      );
      toast.success('Section updated');
    }
    setSectionModalOpen(false);
    setEditingSection(null);
  };

  const confirmDeleteSection = () => {
    if (!selectedProgram || !selectedSection) return;
    dispatch(
      adminProgramsSlice.actions.deleteSection({
        programId: selectedProgram.id,
        sectionId: selectedSection.id
      })
    );
    toast.success('Section deleted');
    setDeleteSectionOpen(false);
    setSelectedSectionId(null);
    setView('sections');
  };

  const openNewBook = () => {
    if (!selectedSection) return;
    setEditingBook({
      id: `bl-${Date.now()}`,
      title: '',
      description: '',
      order: nextOrder(selectedSection.bookLessons),
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
    if (!selectedProgram || !selectedSection || !editingBook?.title.trim()) {
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
    const actionPayload = {
      programId: selectedProgram.id,
      sectionId: selectedSection.id,
      lesson: payload
    };
    if (bookIsNew) {
      dispatch(adminProgramsSlice.actions.addBookLesson(actionPayload));
      toast.success('Book added');
    } else {
      dispatch(adminProgramsSlice.actions.updateBookLesson(actionPayload));
      toast.success('Book saved');
    }
    setBookModalOpen(false);
    setEditingBook(null);
  };

  const openNewVideo = () => {
    if (!selectedSection) return;
    setEditingVideo({
      id: `vl-${Date.now()}`,
      title: '',
      description: '',
      order: nextOrder(selectedSection.videoLessons),
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
    if (!selectedProgram || !selectedSection || !editingVideo?.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    const payload = {
      ...editingVideo,
      title: editingVideo.title.trim(),
      description: editingVideo.description.trim(),
      videos: renumberOrders(editingVideo.videos ?? [])
    };
    const actionPayload = {
      programId: selectedProgram.id,
      sectionId: selectedSection.id,
      lesson: payload
    };
    if (videoIsNew) {
      dispatch(adminProgramsSlice.actions.addVideoLesson(actionPayload));
      toast.success('Video module added');
    } else {
      dispatch(adminProgramsSlice.actions.updateVideoLesson(actionPayload));
      toast.success('Video module saved');
    }
    setVideoModalOpen(false);
    setEditingVideo(null);
  };

  const openNewAudio = () => {
    if (!selectedSection) return;
    setEditingAudio({
      id: `al-${Date.now()}`,
      title: '',
      description: '',
      order: nextOrder(selectedSection.audioLessons),
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
    if (!selectedProgram || !selectedSection || !editingAudio?.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    const payload = {
      ...editingAudio,
      title: editingAudio.title.trim(),
      description: editingAudio.description.trim(),
      tracks: renumberOrders(editingAudio.tracks ?? [])
    };
    const actionPayload = {
      programId: selectedProgram.id,
      sectionId: selectedSection.id,
      lesson: payload
    };
    if (audioIsNew) {
      dispatch(adminProgramsSlice.actions.addAudioLesson(actionPayload));
      toast.success('Audio module added');
    } else {
      dispatch(adminProgramsSlice.actions.updateAudioLesson(actionPayload));
      toast.success('Audio module saved');
    }
    setAudioModalOpen(false);
    setEditingAudio(null);
  };

  const openNewImage = () => {
    if (!selectedSection) return;
    setEditingImage({
      id: `il-${Date.now()}`,
      title: '',
      description: '',
      order: nextOrder(selectedSection.imageLessons),
      images: []
    });
    setImageIsNew(true);
    setImageModalOpen(true);
  };

  const openEditImage = (lesson: ImageLessonModule) => {
    setEditingImage({ ...lesson, images: [...(lesson.images ?? [])] });
    setImageIsNew(false);
    setImageModalOpen(true);
  };

  const saveImage = () => {
    if (!selectedProgram || !selectedSection || !editingImage?.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    const payload = {
      ...editingImage,
      title: editingImage.title.trim(),
      description: editingImage.description.trim(),
      images: renumberOrders(editingImage.images ?? [])
    };
    const actionPayload = {
      programId: selectedProgram.id,
      sectionId: selectedSection.id,
      lesson: payload
    };
    if (imageIsNew) {
      dispatch(adminProgramsSlice.actions.addImageLesson(actionPayload));
      toast.success('Image module added');
    } else {
      dispatch(adminProgramsSlice.actions.updateImageLesson(actionPayload));
      toast.success('Image module saved');
    }
    setImageModalOpen(false);
    setEditingImage(null);
  };

  const openNewText = () => {
    if (!selectedSection) return;
    setEditingText({
      id: `tl-${Date.now()}`,
      title: '',
      description: '',
      order: nextOrder(selectedSection.textLessons),
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
    if (!selectedProgram || !selectedSection || !editingText?.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    const payload = {
      ...editingText,
      title: editingText.title.trim(),
      description: editingText.description.trim(),
      parts: renumberOrders(editingText.parts ?? [])
    };
    const actionPayload = {
      programId: selectedProgram.id,
      sectionId: selectedSection.id,
      lesson: payload
    };
    if (textIsNew) {
      dispatch(adminProgramsSlice.actions.addTextLesson(actionPayload));
      toast.success('Text module added');
    } else {
      dispatch(adminProgramsSlice.actions.updateTextLesson(actionPayload));
      toast.success('Text module saved');
    }
    setTextModalOpen(false);
    setEditingText(null);
  };

  const confirmDeleteLesson = () => {
    if (!selectedProgram || !selectedSection || !deleteLesson) return;
    const { tab, id } = deleteLesson;
    const base = {
      programId: selectedProgram.id,
      sectionId: selectedSection.id,
      lessonId: id
    };
    if (tab === 'books') {
      dispatch(adminProgramsSlice.actions.deleteBookLesson(base));
    } else if (tab === 'video') {
      dispatch(adminProgramsSlice.actions.deleteVideoLesson(base));
    } else if (tab === 'audio') {
      dispatch(adminProgramsSlice.actions.deleteAudioLesson(base));
    } else if (tab === 'images') {
      dispatch(adminProgramsSlice.actions.deleteImageLesson(base));
    } else {
      dispatch(adminProgramsSlice.actions.deleteTextLesson(base));
    }
    toast.success('Module removed');
    setDeleteLesson(null);
  };

  const countBookParts = (book: BookLessonModule) =>
    (book.topics ?? []).reduce((n, t) => n + (t.parts?.length ?? 0), 0);

  const openAddForTab = () => {
    if (lessonTab === 'books') openNewBook();
    else if (lessonTab === 'video') openNewVideo();
    else if (lessonTab === 'audio') openNewAudio();
    else if (lessonTab === 'images') openNewImage();
    else openNewText();
  };

  const tabLabel =
    lessonTab === 'books'
      ? 'book'
      : lessonTab === 'video'
        ? 'video'
        : lessonTab === 'audio'
          ? 'audio'
          : lessonTab === 'images'
            ? 'image'
            : 'text';

  const headerTitle =
    view === 'sectionDetail' && selectedSection
      ? selectedSection.title
      : view === 'sections' && selectedModule
        ? selectedModule.title
        : view === 'modules' && selectedProgram
          ? selectedProgram.title
          : 'Programs';

  const handleBack = () => {
    if (view === 'sectionDetail') {
      setSelectedSectionId(null);
      setView('sections');
    } else if (view === 'sections') {
      setSelectedModuleId(null);
      setView('modules');
    } else if (view === 'modules') {
      openProgramList();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      <div className="bg-primary text-white">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold truncate max-w-[70%] text-center">{headerTitle}</span>
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
                {programs.map((p) => {
                  const mods = countProgramModules(p);
                  const items = countProgramItems(p);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => openProgramModules(p.id)}
                        className="w-full text-left bg-surface border border-border rounded-2xl overflow-hidden flex items-center gap-3 hover:border-primary/40 transition-colors">
                        <img
                          src={programCoverImage(p)}
                          alt={p.title}
                          className="w-20 h-20 object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 py-3 pr-1">
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
                            {p.modules.length} module{p.modules.length === 1 ? '' : 's'} ·{' '}
                            {flattenProgramSections(p).length} section
                            {flattenProgramSections(p).length === 1 ? '' : 's'} · {mods.books}{' '}
                            book
                            {mods.books === 1 ? '' : 's'} ·{' '}
                            {mods.video + mods.audio + mods.images + mods.text} other topics ·{' '}
                            {items.total} media items
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted shrink-0 mr-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {view === 'modules' && selectedProgram && (
          <>
            <div className="bg-accent-lavender/15 border border-accent-lavender/25 rounded-2xl overflow-hidden mb-4">
              <div className="aspect-[16/7] relative">
                <img
                  src={programCoverImage(selectedProgram)}
                  alt={selectedProgram.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-5">
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
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Modules
              </p>
              <button
                type="button"
                onClick={openNewModule}
                className="h-9 px-3 bg-primary text-white rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-primary-hover">
                <Plus className="w-3.5 h-3.5" />
                Add module
              </button>
            </div>

            {selectedProgram.modules.length === 0 ? (
              <div className="p-10 text-center text-sm text-text-muted bg-surface border border-dashed border-border rounded-2xl">
                No modules yet. Add a module, then add sections with lock days and lesson content.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {sortedByOrder(selectedProgram.modules).map((mod) => (
                  <li key={mod.id}>
                    <button
                      type="button"
                      onClick={() => openModuleSections(mod.id)}
                      className="w-full text-left bg-surface border border-border rounded-2xl overflow-hidden flex items-center gap-3 hover:border-primary/40 transition-colors">
                      <img
                        src={moduleCoverImage(mod, selectedProgram.id)}
                        alt={mod.title}
                        className="w-16 h-16 object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 py-3">
                        <p className="text-sm font-bold text-text">
                          Module {mod.order} — {mod.title}
                        </p>
                        {mod.description && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                            {mod.description}
                          </p>
                        )}
                        <p className="text-[10px] text-text-muted mt-1.5">
                          {mod.sections.length} section{mod.sections.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 mr-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModule(mod);
                          }}
                          className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface-2"
                          aria-label="Edit module">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModuleId(mod.id);
                            setDeleteModuleOpen(true);
                          }}
                          className="p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                          aria-label="Delete module">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted shrink-0 mr-2" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {view === 'sections' && selectedProgram && selectedModule && (
          <>
            <div className="rounded-2xl overflow-hidden border border-border mb-4">
              <div className="aspect-[16/7] relative">
                <img
                  src={moduleCoverImage(selectedModule, selectedProgram.id)}
                  alt={selectedModule.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-4 bg-surface">
                <p className="text-xs text-text-muted mb-1">{selectedProgram.title}</p>
                <h3 className="text-lg font-bold text-text">
                  Module {selectedModule.order} — {selectedModule.title}
                </h3>
                {selectedModule.description && (
                  <p className="text-sm text-text-muted mt-1">{selectedModule.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Sections
              </p>
              <button
                type="button"
                onClick={openNewSection}
                className="h-9 px-3 bg-primary text-white rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-primary-hover">
                <Plus className="w-3.5 h-3.5" />
                Add section
              </button>
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed mb-4">
              Each section can have a lock in days. The first section in the program unlocks when
              the member starts; later sections unlock after the previous section opens. Changing
              lock days and saving restarts the countdown from that save date.
            </p>

            {selectedModule.sections.length === 0 ? (
              <div className="p-10 text-center text-sm text-text-muted bg-surface border border-dashed border-border rounded-2xl">
                No sections yet. Add a section to set lock days and organize books, video, audio,
                and text.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {sortedByOrder(selectedModule.sections).map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => openSectionDetail(section.id)}
                      className="w-full text-left bg-surface border border-border rounded-2xl overflow-hidden flex items-center gap-3 hover:border-primary/40 transition-colors">
                      <img
                        src={sectionCoverImage(section, selectedProgram.id)}
                        alt={section.title}
                        className="w-16 h-16 object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 py-3">
                        <p className="text-sm font-bold text-text">
                          #{section.order} {section.title}
                        </p>
                        {section.description && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                            {section.description}
                          </p>
                        )}
                        <p className="text-[10px] text-text-muted mt-1.5">
                          {sectionSummaryLabel(section)} · {countSectionItems(section).total}{' '}
                          items
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold text-primary">
                            {formatSectionLockDaysLabel(lockSections, section)}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">
                            {formatSectionLockDaysBadge(lockSections, section)}
                          </span>
                          {section.lockDaysUpdatedAt && (section.lockDays ?? 0) > 0 && (
                            <span className="text-[9px] text-text-muted">
                              Countdown from {formatLockDaysUpdatedAt(section.lockDaysUpdatedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 mr-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditSection(section);
                          }}
                          className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface-2"
                          aria-label="Edit section">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSectionId(section.id);
                            setDeleteSectionOpen(true);
                          }}
                          className="p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                          aria-label="Delete section">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted shrink-0 mr-2" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {view === 'sectionDetail' && selectedProgram && selectedSection && (
          <>
            <div className="rounded-2xl overflow-hidden border border-border mb-4">
              <div className="aspect-[16/7] relative">
                <img
                  src={sectionCoverImage(selectedSection, selectedProgram.id)}
                  alt={selectedSection.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-4 bg-surface">
                <p className="text-xs text-text-muted mb-1">{selectedProgram.title}</p>
                <h3 className="text-lg font-bold text-text">
                  #{selectedSection.order} {selectedSection.title}
                </h3>
                {selectedSection.description && (
                  <p className="text-sm text-text-muted mt-1">{selectedSection.description}</p>
                )}
              </div>
            </div>

            <div className="mb-4 p-4 rounded-2xl border border-border bg-surface-2/40">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Section lock
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEditSection(selectedSection)}
                  className="text-xs font-bold text-primary hover:underline shrink-0">
                  Edit
                </button>
              </div>
              <p className="text-sm font-semibold text-text">
                {formatSectionLockDaysLabel(lockSections, selectedSection)}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Lock duration:{' '}
                <span className="font-bold text-text">
                  {formatSectionLockDaysBadge(lockSections, selectedSection)}
                </span>
              </p>
              {selectedSection.lockDaysUpdatedAt &&
                (selectedSection.lockDays ?? 0) > 0 && (
                  <p className="text-xs text-text-muted mt-1">
                    Member countdown started:{' '}
                    {formatLockDaysUpdatedAt(selectedSection.lockDaysUpdatedAt)}
                  </p>
                )}
              {(() => {
                const preview = getSectionLockPreview(lockSections, selectedSection.id);
                const detail = formatSectionLockProgressDetail(
                  preview,
                  lockSections,
                  selectedSection
                );
                return (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                      Member preview (started today)
                    </p>
                    {preview.unlocked ? (
                      <p className="text-xs font-semibold text-accent-sage">Unlocked now</p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                          {preview.daysRemaining ?? 0} day
                          {preview.daysRemaining === 1 ? '' : 's'} until unlock
                        </p>
                        {preview.unlocksAt && (
                          <p className="text-[11px] text-text-muted mt-0.5">
                            Opens {formatUnlockDate(preview.unlocksAt)}
                          </p>
                        )}
                        {detail && (
                          <p className="text-[10px] text-text-muted mt-1">{detail}</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Lesson types
            </p>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-4">
              {LESSON_TABS.map(({ id, label, icon: Icon }) => {
                const active = lessonTab === id;
                const count =
                  id === 'books'
                    ? selectedSection.bookLessons.length
                    : id === 'video'
                      ? selectedSection.videoLessons.length
                      : id === 'audio'
                        ? selectedSection.audioLessons.length
                        : id === 'images'
                          ? selectedSection.imageLessons.length
                          : selectedSection.textLessons.length;
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
                {lessonTab === 'books'
                  ? 'Books'
                  : lessonTab === 'images'
                    ? 'Images'
                    : `${tabLabel} topics`}
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
              (selectedSection.bookLessons.length === 0 ? (
                <EmptyModules label="book" onAdd={openNewBook} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedByOrder(selectedSection.bookLessons).map((m) => (
                    <div
                      key={m.id}
                      className="bg-surface border border-border rounded-xl p-3 flex gap-3">
                      {m.coverImageUrl ? (
                        <img
                          src={m.coverImageUrl}
                          alt={m.title}
                          className="w-12 h-16 object-cover rounded-lg shrink-0"
                        />
                      ) : (
                        <GripVertical className="w-4 h-4 text-text-muted shrink-0 mt-1" />
                      )}
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
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditBook(m)}
                          className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface-2"
                          aria-label="Edit module">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteLesson({ tab: 'books', id: m.id, title: m.title })
                          }
                          className="p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                          aria-label="Delete module">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {lessonTab === 'video' &&
              (selectedSection.videoLessons.length === 0 ? (
                <EmptyModules label="video topic" onAdd={openNewVideo} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedByOrder(selectedSection.videoLessons).map((m, idx) => (
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
              (selectedSection.audioLessons.length === 0 ? (
                <EmptyModules label="audio topic" onAdd={openNewAudio} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedByOrder(selectedSection.audioLessons).map((m, idx) => (
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

            {lessonTab === 'images' &&
              (selectedSection.imageLessons.length === 0 ? (
                <EmptyModules label="image topic" onAdd={openNewImage} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedByOrder(selectedSection.imageLessons).map((m, idx) => (
                    <LessonTopicAccordion
                      key={m.id}
                      order={m.order}
                      title={m.title}
                      description={m.description}
                      mediaKind="image"
                      defaultExpanded={idx === 0}
                      items={sortByOrder(m.images ?? []).map((img) => ({
                        id: img.id,
                        order: img.order,
                        label: img.label,
                        hasFile: !!(img.imageUrl || img.fileName),
                        meta: img.imageUrl
                          ? `IMAGE · ${img.caption?.trim() || img.label}`
                          : 'IMAGE · Not uploaded'
                      }))}
                      onEdit={() => openEditImage(m)}
                      onDelete={() =>
                        setDeleteLesson({ tab: 'images', id: m.id, title: m.title })
                      }
                    />
                  ))}
                </div>
              ))}

            {lessonTab === 'text' &&
              (selectedSection.textLessons.length === 0 ? (
                <EmptyModules label="text topic" onAdd={openNewText} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedByOrder(selectedSection.textLessons).map((m, idx) => (
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
            <Field label="Cover image">
              <ImageUploadField
                label="cover"
                imageUrl={editingProgram.coverImageUrl}
                onChange={(coverImageUrl) =>
                  setEditingProgram({ ...editingProgram, coverImageUrl })
                }
              />
            </Field>
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
        open={moduleModalOpen}
        title={moduleIsNew ? 'Add Module' : 'Edit Module'}
        onClose={() => {
          setModuleModalOpen(false);
          setEditingModule(null);
        }}>
        {editingModule && (
          <div className="flex flex-col gap-4">
            <Field label="Module image">
              <ImageUploadField
                label="module"
                imageUrl={editingModule.imageUrl}
                onChange={(imageUrl) =>
                  setEditingModule({ ...editingModule, imageUrl })
                }
              />
            </Field>
            <Field label="Title" required>
              <input
                type="text"
                value={editingModule.title}
                onChange={(e) =>
                  setEditingModule({ ...editingModule, title: e.target.value })
                }
                placeholder="e.g. Module 1 — Foundations"
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={editingModule.description}
                onChange={(e) =>
                  setEditingModule({ ...editingModule, description: e.target.value })
                }
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </Field>
            <Field label="Order">
              <input
                type="number"
                min={1}
                value={editingModule.order}
                onChange={(e) =>
                  setEditingModule({
                    ...editingModule,
                    order: Math.max(1, Number(e.target.value) || 1)
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <button
              type="button"
              onClick={saveModule}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover">
              {moduleIsNew ? 'Create Module' : 'Save Module'}
            </button>
          </div>
        )}
      </SheetModal>

      <SheetModal
        open={sectionModalOpen}
        title={sectionIsNew ? 'Add Section' : 'Edit Section'}
        onClose={() => {
          setSectionModalOpen(false);
          setEditingSection(null);
        }}>
        {editingSection && (
          <div className="flex flex-col gap-4">
            <Field label="Section image">
              <ImageUploadField
                label="section"
                imageUrl={editingSection.imageUrl}
                onChange={(imageUrl) =>
                  setEditingSection({ ...editingSection, imageUrl })
                }
              />
            </Field>
            <Field label="Title" required>
              <input
                type="text"
                value={editingSection.title}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, title: e.target.value })
                }
                placeholder="e.g. Module 1 — Foundations"
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={editingSection.description}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, description: e.target.value })
                }
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </Field>
            <Field label="Order">
              <input
                type="number"
                min={1}
                value={editingSection.order}
                onChange={(e) =>
                  setEditingSection({
                    ...editingSection,
                    order: Math.max(1, Number(e.target.value) || 1)
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Section lock (days)" required>
              <input
                type="number"
                min={0}
                value={editingSection.lockDays ?? 0}
                onChange={(e) => {
                  const lockDays = Math.max(0, Number(e.target.value) || 0);
                  setEditingSection({
                    ...editingSection,
                    lockDays
                  });
                  if (!sectionIsNew && selectedProgram) {
                    const existing = findProgramSection(selectedProgram, editingSection.id);
                    if (existing && existing.lockDays !== lockDays) {
                      setRestartLockCountdown(true);
                    }
                  }
                }}
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
              <p className="text-[11px] text-text-muted leading-relaxed mt-1.5">
                {editingSection &&
                selectedProgram &&
                (sectionIsNew
                  ? flattenProgramSections(selectedProgram).length === 0
                  : isFirstProgramSection(selectedProgram, editingSection.id))
                  ? 'First section in the program: days after the member starts (0 = immediate). Changing this value and saving restarts the countdown from today.'
                  : `Section ${editingSection.order}: days after the previous section opens. Changing this value and saving restarts the countdown from today.`}
              </p>
            </Field>
            {(editingSection.lockDays ?? 0) > 0 && !sectionIsNew && (
              <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={restartLockCountdown}
                  onChange={(e) => setRestartLockCountdown(e.target.checked)}
                  className="mt-1 rounded border-border"
                />
                <span className="text-sm text-text leading-snug">
                  Restart member countdown from today when saving
                  <span className="block text-[11px] text-text-muted mt-0.5">
                    Leave unchecked to keep the current countdown start date unless you change
                    lock days.
                  </span>
                </span>
              </label>
            )}
            <button
              type="button"
              onClick={saveSection}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover">
              {sectionIsNew ? 'Create Section' : 'Save Section'}
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
            <Field label="Cover image">
              <ImageUploadField
                label="book cover"
                imageUrl={editingBook.coverImageUrl}
                onChange={(coverImageUrl) =>
                  setEditingBook({ ...editingBook, coverImageUrl })
                }
              />
            </Field>
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
            <Field label="Topic image">
              <ImageUploadField
                label="topic"
                imageUrl={editingVideo.imageUrl}
                onChange={(imageUrl) =>
                  setEditingVideo({ ...editingVideo, imageUrl })
                }
              />
            </Field>
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
            <Field label="Topic image">
              <ImageUploadField
                label="topic"
                imageUrl={editingAudio.imageUrl}
                onChange={(imageUrl) =>
                  setEditingAudio({ ...editingAudio, imageUrl })
                }
              />
            </Field>
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
        open={imageModalOpen}
        wide
        title={imageIsNew ? 'Add image topic' : 'Edit image topic'}
        onClose={() => {
          setImageModalOpen(false);
          setEditingImage(null);
        }}>
        {editingImage && (
          <div className="flex flex-col gap-4">
            <Field label="Topic cover">
              <ImageUploadField
                label="topic cover"
                imageUrl={editingImage.coverImageUrl}
                onChange={(coverImageUrl) =>
                  setEditingImage({ ...editingImage, coverImageUrl })
                }
              />
            </Field>
            <Field label="Topic title" required>
              <input
                type="text"
                value={editingImage.title}
                onChange={(e) =>
                  setEditingImage({ ...editingImage, title: e.target.value })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={editingImage.description}
                onChange={(e) =>
                  setEditingImage({ ...editingImage, description: e.target.value })
                }
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </Field>
            <Field label="Order">
              <input
                type="number"
                min={1}
                value={editingImage.order}
                onChange={(e) =>
                  setEditingImage({
                    ...editingImage,
                    order: Math.max(1, Number(e.target.value) || 1)
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <ImageItemsEditor
              images={editingImage.images ?? []}
              onChange={(images) => setEditingImage({ ...editingImage, images })}
            />
            <button
              type="button"
              onClick={saveImage}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover">
              {imageIsNew ? 'Save' : 'Save changes'}
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
            <Field label="Topic image">
              <ImageUploadField
                label="topic"
                imageUrl={editingText.imageUrl}
                onChange={(imageUrl) =>
                  setEditingText({ ...editingText, imageUrl })
                }
              />
            </Field>
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
            ? `Remove "${selectedProgram.title}" and all its sections and content?`
            : undefined
        }
        onClose={() => setDeleteProgramOpen(false)}
        onConfirm={confirmDeleteProgram}
      />

      <ConfirmModal
        open={deleteModuleOpen}
        title="Delete module?"
        message={
          selectedModule
            ? `Remove "${selectedModule.title}" and all its sections and content?`
            : undefined
        }
        onClose={() => setDeleteModuleOpen(false)}
        onConfirm={confirmDeleteModule}
      />

      <ConfirmModal
        open={deleteSectionOpen}
        title="Delete section?"
        message={
          selectedSection
            ? `Remove "${selectedSection.title}" and all its lesson content?`
            : undefined
        }
        onClose={() => setDeleteSectionOpen(false)}
        onConfirm={confirmDeleteSection}
      />

      <ConfirmModal
        open={!!deleteLesson}
        title="Delete module?"
        message={
          deleteLesson
            ? `Remove "${deleteLesson.title}" from this section?`
            : undefined
        }
        onClose={() => setDeleteLesson(null)}
        onConfirm={confirmDeleteLesson}
      />
    </div>
  );
}
