import React, { useRef, useState } from 'react';
import {
  Upload,
  Link2,
  Plus,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Play,
  Headphones,
  FileText,
  ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BookPartItem,
  BookTopicItem,
  VideoMediaItem,
  AudioTrackItem,
  ImageMediaItem,
  TextPartItem
} from '../../store/adminProgramsSlice';

export function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-text">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function FileUploadRow({
  label,
  accept,
  fileName,
  onPick
}: {
  label: string;
  accept: string;
  fileName?: string;
  onPick: (name: string, url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onPick(file.name, URL.createObjectURL(file));
          toast.success(`${label} uploaded`);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="h-9 px-3 rounded-lg border border-border bg-surface-2 text-xs font-bold text-text hover:bg-border/40 flex items-center gap-1.5">
        <Upload className="w-3.5 h-3.5" />
        {fileName ? 'Replace' : 'Upload'} {label}
      </button>
      {fileName && (
        <span className="text-[10px] font-semibold text-accent-sage bg-accent-sage/10 px-2 py-0.5 rounded-full border border-accent-sage/30 truncate max-w-[160px]">
          {fileName}
        </span>
      )}
    </div>
  );
}

export function ImageUploadField({
  label,
  imageUrl,
  onChange
}: {
  label: string;
  imageUrl?: string;
  onChange: (url: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-2">
      {imageUrl ? (
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-border bg-surface-2">
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 h-8 px-2 rounded-lg bg-black/50 text-white text-[10px] font-bold hover:bg-black/70">
            Remove
          </button>
        </div>
      ) : (
        <div className="w-full aspect-[16/9] rounded-xl border border-dashed border-border bg-surface-2 flex items-center justify-center text-xs text-text-muted">
          No image
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onChange(URL.createObjectURL(file));
          toast.success(`${label} uploaded`);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="h-9 px-3 rounded-lg border border-border bg-surface-2 text-xs font-bold text-text hover:bg-border/40 flex items-center gap-1.5 self-start">
        <Upload className="w-3.5 h-3.5" />
        {imageUrl ? 'Replace' : 'Upload'} {label}
      </button>
    </div>
  );
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function renumberOrders<T extends { order: number }>(items: T[]): T[] {
  return sortByOrder(items).map((item, i) => ({ ...item, order: i + 1 }));
}

export function moveOrderedItem<T extends { id: string; order: number }>(
  items: T[],
  id: string,
  direction: 'up' | 'down'
): T[] {
  const sorted = sortByOrder(items);
  const idx = sorted.findIndex((i) => i.id === id);
  if (idx < 0) return items;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) return items;
  const next = [...sorted];
  const tmp = next[idx].order;
  next[idx] = { ...next[idx], order: next[swapIdx].order };
  next[swapIdx] = { ...next[swapIdx], order: tmp };
  return renumberOrders(next);
}

function ItemOrderControls({
  order,
  total,
  onMoveUp,
  onMoveDown,
  onOrderChange
}: {
  order: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOrderChange: (order: number) => void;
}) {
  const canUp = order > 1;
  const canDown = order < total;
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[10px] font-bold text-text-muted mr-0.5">Order</span>
      <input
        type="number"
        min={1}
        max={total}
        value={order}
        onChange={(e) => {
          const n = Math.max(1, Math.min(total, Number(e.target.value) || 1));
          onOrderChange(n);
        }}
        className="w-11 h-8 px-1 text-center rounded-lg bg-surface border border-border text-xs font-bold"
        aria-label="Item order"
      />
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canUp}
        className="p-1.5 rounded-lg border border-border hover:bg-surface disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Move up">
        <ChevronUp className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canDown}
        className="p-1.5 rounded-lg border border-border hover:bg-surface disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Move down">
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}

function setItemOrder<T extends { id: string; order: number }>(
  items: T[],
  id: string,
  newOrder: number
): T[] {
  const sorted = sortByOrder(items);
  const total = sorted.length;
  const target = Math.max(1, Math.min(total, newOrder));
  const idx = sorted.findIndex((i) => i.id === id);
  if (idx < 0) return items;
  const removed = sorted.splice(idx, 1)[0];
  sorted.splice(target - 1, 0, removed);
  return renumberOrders(sorted);
}

export function ItemListHeader({
  title,
  onAdd,
  addLabel
}: {
  title: string;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
        {title}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="h-8 px-2.5 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center gap-1 hover:bg-primary/20">
        <Plus className="w-3 h-3" />
        {addLabel}
      </button>
    </div>
  );
}

export function BookPartsEditor({
  parts,
  onChange
}: {
  parts: BookPartItem[];
  onChange: (parts: BookPartItem[]) => void;
}) {
  const addPart = () => {
    onChange([
      ...parts,
      {
        id: `bp-${Date.now()}`,
        label: `Part ${parts.length + 1}`,
        order: parts.length + 1
      }
    ]);
  };
  const update = (id: string, patch: Partial<BookPartItem>) => {
    onChange(parts.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const remove = (id: string) =>
    onChange(renumberOrders(parts.filter((p) => p.id !== id)));

  const sorted = sortByOrder(parts);

  return (
    <div className="border-t border-border pt-4">
      <ItemListHeader
        title="PDF & audio in this topic"
        onAdd={addPart}
        addLabel="Add part"
      />
      {parts.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4 border border-dashed border-border rounded-xl">
          Add multiple PDF and audio files under this topic. Use order to set playback sequence.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((part) => (
            <div
              key={part.id}
              className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex justify-between items-start gap-2 mb-2">
                <ItemOrderControls
                  order={part.order}
                  total={sorted.length}
                  onMoveUp={() => onChange(moveOrderedItem(parts, part.id, 'up'))}
                  onMoveDown={() =>
                    onChange(moveOrderedItem(parts, part.id, 'down'))
                  }
                  onOrderChange={(order) =>
                    onChange(setItemOrder(parts, part.id, order))
                  }
                />
                <button
                  type="button"
                  onClick={() => remove(part.id)}
                  className="text-xs font-bold text-red-500 shrink-0">
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={part.label}
                onChange={(e) => update(part.id, { label: e.target.value })}
                placeholder="Part title"
                className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm mb-2"
              />
              <FileUploadRow
                label="PDF"
                accept=".pdf,application/pdf"
                fileName={part.pdfFileName}
                onPick={(pdfFileName, pdfUrl) =>
                  update(part.id, { pdfFileName, pdfUrl })
                }
              />
              <div className="mt-2">
                <FileUploadRow
                  label="Audio"
                  accept="audio/*"
                  fileName={part.audioFileName}
                  onPick={(audioFileName, audioUrl) =>
                    update(part.id, { audioFileName, audioUrl })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BookTopicsEditor({
  topics,
  onChange
}: {
  topics: BookTopicItem[];
  onChange: (topics: BookTopicItem[]) => void;
}) {
  const addTopic = () => {
    onChange([
      ...topics,
      {
        id: `bt-${Date.now()}`,
        title: `Topic ${topics.length + 1}`,
        description: '',
        order: topics.length + 1,
        parts: []
      }
    ]);
  };
  const updateTopic = (id: string, patch: Partial<BookTopicItem>) => {
    onChange(topics.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };
  const removeTopic = (id: string) =>
    onChange(renumberOrders(topics.filter((t) => t.id !== id)));

  const sorted = sortByOrder(topics);

  return (
    <div className="border-t border-border pt-4">
      <ItemListHeader title="Topics in this book" onAdd={addTopic} addLabel="Add topic" />
      {topics.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4 border border-dashed border-border rounded-xl">
          Add topics to this book. Each topic can have multiple PDF and audio files in order.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((topic) => (
            <div
              key={topic.id}
              className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex justify-between items-start gap-2 mb-3">
                <ItemOrderControls
                  order={topic.order}
                  total={sorted.length}
                  onMoveUp={() => onChange(moveOrderedItem(topics, topic.id, 'up'))}
                  onMoveDown={() =>
                    onChange(moveOrderedItem(topics, topic.id, 'down'))
                  }
                  onOrderChange={(order) =>
                    onChange(setItemOrder(topics, topic.id, order))
                  }
                />
                <button
                  type="button"
                  onClick={() => removeTopic(topic.id)}
                  className="text-xs font-bold text-red-500 shrink-0">
                  Remove topic
                </button>
              </div>
              <input
                type="text"
                value={topic.title}
                onChange={(e) => updateTopic(topic.id, { title: e.target.value })}
                placeholder="Topic title"
                className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm font-bold mb-2"
              />
              <textarea
                value={topic.description}
                onChange={(e) =>
                  updateTopic(topic.id, { description: e.target.value })
                }
                rows={2}
                placeholder="Topic description (optional)"
                className="w-full p-2 rounded-lg bg-surface border border-border text-sm mb-3 resize-none"
              />
              <BookPartsEditor
                parts={topic.parts ?? []}
                onChange={(parts) =>
                  updateTopic(topic.id, { parts: renumberOrders(parts) })
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BookItemBadge({
  topicCount,
  partCount
}: {
  topicCount: number;
  partCount: number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
        Book
      </span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-sage/15 text-accent-sage border border-accent-sage/30">
        {topicCount} topic{topicCount === 1 ? '' : 's'}
      </span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-border text-text-muted">
        {partCount} PDF/audio
      </span>
    </div>
  );
}

export function VideoItemsEditor({
  videos,
  onChange
}: {
  videos: VideoMediaItem[];
  onChange: (videos: VideoMediaItem[]) => void;
}) {
  const add = (type: 'upload' | 'embed') => {
    onChange([
      ...videos,
      {
        id: `vm-${Date.now()}`,
        label: type === 'upload' ? 'New video' : 'Embedded video',
        order: videos.length + 1,
        type,
        ...(type === 'embed' ? { embedUrl: '' } : {})
      }
    ]);
  };
  const update = (id: string, patch: Partial<VideoMediaItem>) => {
    onChange(videos.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };
  const remove = (id: string) =>
    onChange(renumberOrders(videos.filter((v) => v.id !== id)));

  const sorted = sortByOrder(videos);

  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Videos in this topic
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => add('upload')}
            className="h-8 px-2 rounded-lg border border-border text-xs font-bold flex items-center gap-1">
            <Upload className="w-3 h-3" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => add('embed')}
            className="h-8 px-2 rounded-lg border border-border text-xs font-bold flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            Embed
          </button>
        </div>
      </div>
      {videos.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4 border border-dashed border-border rounded-xl">
          Add multiple videos under this topic. Reorder with arrows or the order field.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex justify-between items-start gap-2 mb-2">
                <ItemOrderControls
                  order={item.order}
                  total={sorted.length}
                  onMoveUp={() => onChange(moveOrderedItem(videos, item.id, 'up'))}
                  onMoveDown={() =>
                    onChange(moveOrderedItem(videos, item.id, 'down'))
                  }
                  onOrderChange={(order) =>
                    onChange(setItemOrder(videos, item.id, order))
                  }
                />
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-bold text-text-muted">
                    {item.type === 'upload' ? 'Upload' : 'Embed'}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="text-xs font-bold text-red-500">
                    Remove
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={item.label}
                onChange={(e) => update(item.id, { label: e.target.value })}
                placeholder="Video title"
                className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm mb-2"
              />
              {item.type === 'upload' ? (
                <FileUploadRow
                  label="video"
                  accept="video/*"
                  fileName={item.fileName}
                  onPick={(fileName, fileUrl) =>
                    update(item.id, { fileName, fileUrl })
                  }
                />
              ) : (
                <input
                  type="url"
                  value={item.embedUrl ?? ''}
                  onChange={(e) =>
                    update(item.id, { embedUrl: e.target.value })
                  }
                  placeholder="Embed URL"
                  className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AudioTracksEditor({
  tracks,
  onChange
}: {
  tracks: AudioTrackItem[];
  onChange: (tracks: AudioTrackItem[]) => void;
}) {
  const add = () => {
    onChange([
      ...tracks,
      {
        id: `at-${Date.now()}`,
        label: `Track ${tracks.length + 1}`,
        order: tracks.length + 1
      }
    ]);
  };
  const update = (id: string, patch: Partial<AudioTrackItem>) => {
    onChange(tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };
  const remove = (id: string) =>
    onChange(renumberOrders(tracks.filter((t) => t.id !== id)));

  const sorted = sortByOrder(tracks);

  return (
    <div className="border-t border-border pt-4">
      <ItemListHeader
        title="Audio tracks in this topic"
        onAdd={add}
        addLabel="Add track"
      />
      {tracks.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4 border border-dashed border-border rounded-xl">
          Add multiple audio files under this topic. Reorder tracks for listen sequence.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((track) => (
            <div
              key={track.id}
              className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex justify-between items-start gap-2 mb-2">
                <ItemOrderControls
                  order={track.order}
                  total={sorted.length}
                  onMoveUp={() => onChange(moveOrderedItem(tracks, track.id, 'up'))}
                  onMoveDown={() =>
                    onChange(moveOrderedItem(tracks, track.id, 'down'))
                  }
                  onOrderChange={(order) =>
                    onChange(setItemOrder(tracks, track.id, order))
                  }
                />
                <button
                  type="button"
                  onClick={() => remove(track.id)}
                  className="text-xs font-bold text-red-500 shrink-0">
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={track.label}
                onChange={(e) => update(track.id, { label: e.target.value })}
                placeholder="Track title"
                className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm mb-2"
              />
              <FileUploadRow
                label="Audio"
                accept="audio/*"
                fileName={track.fileName}
                onPick={(fileName, fileUrl) =>
                  update(track.id, { fileName, fileUrl })
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ImageItemsEditor({
  images,
  onChange
}: {
  images: ImageMediaItem[];
  onChange: (images: ImageMediaItem[]) => void;
}) {
  const add = () => {
    onChange([
      ...images,
      {
        id: `im-${Date.now()}`,
        label: `Image ${images.length + 1}`,
        order: images.length + 1
      }
    ]);
  };
  const update = (id: string, patch: Partial<ImageMediaItem>) => {
    onChange(images.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  };
  const remove = (id: string) =>
    onChange(renumberOrders(images.filter((img) => img.id !== id)));

  const sorted = sortByOrder(images);

  return (
    <div className="border-t border-border pt-4">
      <ItemListHeader title="Images in this topic" onAdd={add} addLabel="Add image" />
      {images.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4 border border-dashed border-border rounded-xl">
          Add multiple images under this topic. Reorder for gallery sequence.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex justify-between items-start gap-2 mb-2">
                <ItemOrderControls
                  order={item.order}
                  total={sorted.length}
                  onMoveUp={() => onChange(moveOrderedItem(images, item.id, 'up'))}
                  onMoveDown={() =>
                    onChange(moveOrderedItem(images, item.id, 'down'))
                  }
                  onOrderChange={(order) =>
                    onChange(setItemOrder(images, item.id, order))
                  }
                />
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="text-xs font-bold text-red-500 shrink-0">
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={item.label}
                onChange={(e) => update(item.id, { label: e.target.value })}
                placeholder="Image title"
                className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm mb-2"
              />
              <ImageUploadField
                label="image"
                imageUrl={item.imageUrl}
                onChange={(imageUrl) =>
                  update(item.id, {
                    imageUrl,
                    fileName: imageUrl ? item.fileName ?? 'uploaded-image.jpg' : undefined
                  })
                }
              />
              <input
                type="text"
                value={item.caption ?? ''}
                onChange={(e) => update(item.id, { caption: e.target.value })}
                placeholder="Caption (optional)"
                className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm mt-2"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TextPartsEditor({
  parts,
  onChange
}: {
  parts: TextPartItem[];
  onChange: (parts: TextPartItem[]) => void;
}) {
  const add = () => {
    onChange([
      ...parts,
      {
        id: `tp-${Date.now()}`,
        label: `Section ${parts.length + 1}`,
        order: parts.length + 1,
        content: ''
      }
    ]);
  };
  const update = (id: string, patch: Partial<TextPartItem>) => {
    onChange(parts.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const remove = (id: string) =>
    onChange(renumberOrders(parts.filter((p) => p.id !== id)));

  const sorted = sortByOrder(parts);

  return (
    <div className="border-t border-border pt-4">
      <ItemListHeader
        title="Sections in this topic"
        onAdd={add}
        addLabel="Add section"
      />
      {parts.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4 border border-dashed border-border rounded-xl">
          Add multiple text sections under this topic. Reorder for reading sequence.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((part) => (
            <div
              key={part.id}
              className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex justify-between items-start gap-2 mb-2">
                <ItemOrderControls
                  order={part.order}
                  total={sorted.length}
                  onMoveUp={() => onChange(moveOrderedItem(parts, part.id, 'up'))}
                  onMoveDown={() =>
                    onChange(moveOrderedItem(parts, part.id, 'down'))
                  }
                  onOrderChange={(order) =>
                    onChange(setItemOrder(parts, part.id, order))
                  }
                />
                <button
                  type="button"
                  onClick={() => remove(part.id)}
                  className="text-xs font-bold text-red-500 shrink-0">
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={part.label}
                onChange={(e) => update(part.id, { label: e.target.value })}
                placeholder="Section title"
                className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm mb-2"
              />
              <textarea
                value={part.content}
                onChange={(e) => update(part.id, { content: e.target.value })}
                rows={5}
                placeholder="Content or blog text..."
                className="w-full p-3 rounded-lg bg-surface border border-border text-sm resize-y"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type LessonTopicAccordionItem = {
  id: string;
  order: number;
  label: string;
  meta: string;
  hasFile: boolean;
};

export function LessonTopicAccordion({
  order,
  title,
  description,
  mediaKind,
  items,
  onEdit,
  onDelete,
  defaultExpanded = false
}: {
  order: number;
  title: string;
  description?: string;
  mediaKind: 'video' | 'audio' | 'image' | 'text';
  items: LessonTopicAccordionItem[];
  onEdit: () => void;
  onDelete: () => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const sorted = sortByOrder(items);
  const MediaIcon =
    mediaKind === 'video'
      ? Play
      : mediaKind === 'audio'
        ? Headphones
        : mediaKind === 'image'
          ? ImageIcon
          : FileText;
  const sectionLabel =
    mediaKind === 'video'
      ? 'VIDEOS'
      : mediaKind === 'audio'
        ? 'AUDIO TRACKS'
        : mediaKind === 'image'
          ? 'IMAGES'
          : 'SECTIONS';
  const firstSectionTitle = sorted[0]?.label;
  const emptyLabel =
    mediaKind === 'video'
      ? 'videos'
      : mediaKind === 'audio'
        ? 'audio tracks'
        : mediaKind === 'image'
          ? 'images'
          : 'sections';

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 min-w-0 text-left px-4 py-3.5 flex items-center gap-2 hover:bg-surface-2/60 transition-colors">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-text leading-snug block truncate">
              #{order} {title}
            </span>
            {!expanded && firstSectionTitle && (
              <span className="text-xs text-text-muted block truncate mt-0.5">
                {firstSectionTitle}
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-text-muted shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
          )}
        </button>
        <div className="flex items-center gap-0.5 pr-2 border-l border-border shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-2.5 text-text-muted hover:text-primary rounded-lg hover:bg-surface-2"
            aria-label="Edit topic">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2.5 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
            aria-label="Delete topic">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border">
          {description && (
            <p className="px-4 pt-3 pb-1 text-xs text-text-muted leading-relaxed">
              {description}
            </p>
          )}
          <p className="px-4 pt-3 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
            {sectionLabel} · {sorted.length} item{sorted.length === 1 ? '' : 's'}
          </p>

          {sorted.length === 0 ? (
            <p className="px-4 pb-4 text-xs text-text-muted italic">
              No {emptyLabel} yet. Edit topic to add content.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {sorted.map((item) => (
                <li
                  key={item.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-surface-2/40 transition-colors">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      item.hasFile
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-surface-2 border-border text-text-muted'
                    }`}>
                    <MediaIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">
                      {item.label}
                    </p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mt-0.5">
                      {item.meta}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-text-muted shrink-0">
                    #{item.order}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function TopicItemBadge({
  itemCount,
  itemSummary
}: {
  itemCount: number;
  itemSummary: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
        Topic
      </span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-sage/15 text-accent-sage border border-accent-sage/30">
        {itemCount} {itemSummary}
      </span>
    </div>
  );
}
