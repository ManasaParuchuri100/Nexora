import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  FileText, 
  Film, 
  X, 
  Maximize2, 
  Plus, 
  Paperclip, 
  Check, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { MediaAttachment } from '../../types';

export const NEXORA_STUDIO_ASSETS: MediaAttachment[] = [
  {
    id: 'sample-kyoto',
    name: 'kyoto-atelier-workspace.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1000&auto=format&fit=crop&q=80',
    size: '2.4 MB'
  },
  {
    id: 'sample-grid',
    name: 'spatial-editorial-grid.png',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
    size: '1.8 MB'
  },
  {
    id: 'sample-diagram',
    name: 'qualification-engine-diagram.png',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
    size: '920 KB'
  },
  {
    id: 'sample-manifesto',
    name: 'the-quiet-horizon-manifesto.pdf',
    type: 'document',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80',
    size: '3.1 MB'
  }
];

interface MediaAttachmentPickerProps {
  attachments: MediaAttachment[];
  onChange: (attachments: MediaAttachment[]) => void;
  compact?: boolean;
  label?: string;
  helperText?: string;
  maxAttachments?: number;
}

export default function MediaAttachmentPicker({
  attachments,
  onChange,
  compact = false,
  label = 'Media Attachments',
  helperText = 'Attach images, carousels, video, or documents to accompany this broadcast.',
  maxAttachments = 8
}: MediaAttachmentPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showAssetDrawer, setShowAssetDrawer] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const availableSlots = maxAttachments - attachments.length;
    if (availableSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    filesToProcess.forEach(file => {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      const fileType: MediaAttachment['type'] = isImg ? 'image' : isVid ? 'video' : 'document';
      
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      if (isImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newAttachment: MediaAttachment = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            type: 'image',
            url: (e.target?.result as string) || '',
            size: sizeStr
          };
          onChange([...attachments, newAttachment]);
        };
        reader.readAsDataURL(file);
      } else {
        const newAttachment: MediaAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          type: fileType,
          url: URL.createObjectURL(file),
          size: sizeStr
        };
        onChange([...attachments, newAttachment]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter(a => a.id !== id));
  };

  const handleAddSample = (sample: MediaAttachment) => {
    const isAlreadyAttached = attachments.some(a => a.url === sample.url || a.name === sample.name);
    if (isAlreadyAttached) {
      onChange(attachments.filter(a => a.url !== sample.url && a.name !== sample.name));
    } else {
      if (attachments.length < maxAttachments) {
        onChange([...attachments, { ...sample, id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]);
      }
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Header with Title and Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Paperclip className="w-3.5 h-3.5 text-ink-2" />
            <label className="text-xs uppercase tracking-wider text-ink font-medium">
              {label}
            </label>
            {attachments.length > 0 && (
              <span className="text-[11px]  px-2 py-0.5 bg-surface-raised text-ink-2 border border-line rounded-[8px]">
                {attachments.length} attached
              </span>
            )}
          </div>
          {helperText && (
            <p className="text-[12px] text-ink-2 font-light mt-0.5">
              {helperText}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs ">
          <button
            type="button"
            onClick={() => setShowAssetDrawer(prev => !prev)}
            className={`px-2.5 py-1 text-[12px] uppercase tracking-wider border rounded-[8px] transition-colors cursor-pointer flex items-center space-x-1.5 ${
              showAssetDrawer 
                ? 'bg-surface-hover text-ink border-line-strong' 
                : 'text-ink-2 border-line hover:text-ink'
            }`}
          >
            <Sparkles className="w-3 h-3 text-ink-2" />
            <span>{showAssetDrawer ? 'Hide Sample Assets' : 'Sample Studio Assets'}</span>
          </button>

          {attachments.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[12px] text-red-400/80 hover:text-red-300 underline transition-colors cursor-pointer pl-1"
            >
              Clear All ({attachments.length})
            </button>
          )}
        </div>
      </div>

      {/* Sample Studio Assets Drawer */}
      {showAssetDrawer && (
        <div className="p-3 bg-surface-raised border border-line rounded-[8px] space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-ink-2 ">
              Nexora Creative Lab Presets (Click to attach/detach)
            </span>
            <span className="text-[11px] text-ink-3 ">
              High-resolution editorial media
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {NEXORA_STUDIO_ASSETS.map((sample) => {
              const isSelected = attachments.some(a => a.url === sample.url || a.name === sample.name);
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleAddSample(sample)}
                  className={`group relative text-left p-2 border rounded-[8px] transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'border-line-strong bg-surface-hover' 
                      : 'border-line bg-surface hover:border-line-strong'
                  }`}
                >
                  <div className="w-full h-16 bg-surface-raised overflow-hidden rounded-[6px] relative mb-1.5">
                    {sample.type === 'image' ? (
                      <img 
                        src={sample.url} 
                        alt={sample.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-ink-3 bg-surface">
                        <FileText className="w-6 h-6 text-ink-2" />
                        <span className="text-[10px] uppercase tracking-wider mt-1 ">PDF</span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-emerald-600 text-ink p-0.5 rounded-full shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-ink font-medium truncate">
                      {sample.name}
                    </p>
                    <p className="text-[10px] text-ink-3 ">
                      {sample.size}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[8px] transition-all cursor-pointer ${
          compact ? 'p-3' : 'p-5 sm:p-6'
        } flex flex-col items-center justify-center text-center space-y-2 ${
          isDragging 
            ? 'border-line-strong bg-surface-hover scale-[1.005]' 
            : 'border-line bg-surface-raised hover:border-line-strong hover:bg-surface-hover'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          onChange={(e) => processFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-9 h-9 rounded-full bg-surface-hover border border-line flex items-center justify-center text-ink-2">
          <UploadCloud className="w-4 h-4" />
        </div>

        <div>
          <p className="text-xs text-ink font-medium">
            <span className="text-ink-2 underline underline-offset-2">Click to browse</span> or drag and drop media files
          </p>
          <p className="text-[11px] text-ink-3  mt-0.5">
            PNG, JPG, WebP, SVG, MP4, PDF · Up to {maxAttachments} items
          </p>
        </div>
      </div>

      {/* Attached Media Cards Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
          {attachments.map((att, idx) => (
            <div 
              key={att.id}
              className="group relative bg-surface-raised border border-line hover:border-line-strong p-2 rounded-[8px] flex items-center space-x-3 transition-colors"
            >
              {/* Thumbnail / Icon */}
              <div className="w-12 h-12 bg-surface border border-line-subtle rounded-[6px] overflow-hidden shrink-0 flex items-center justify-center relative">
                {att.type === 'image' && att.url ? (
                  <img 
                    src={att.url} 
                    alt={att.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : att.type === 'video' ? (
                  <Film className="w-5 h-5 text-warn" />
                ) : (
                  <FileText className="w-5 h-5 text-ink-2" />
                )}

                {/* Index tag */}
                <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-[10px]  text-ink px-1 rounded-[6px]">
                  #{idx + 1}
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink truncate font-medium" title={att.name}>
                  {att.name}
                </p>
                <div className="flex items-center space-x-2 text-[11px]  text-ink-2 mt-0.5">
                  <span className="uppercase text-[10px] px-1 py-0.2 bg-surface border border-line-subtle rounded-[6px]">
                    {att.type}
                  </span>
                  {att.size && <span>{att.size}</span>}
                </div>
              </div>

              {/* Actions: View & Remove */}
              <div className="flex items-center space-x-1 shrink-0">
                {att.type === 'image' && att.url && (
                  <button
                    type="button"
                    onClick={() => setPreviewItem(att)}
                    title="Enlarge preview"
                    className="p-1 text-ink-3 hover:text-ink hover:bg-surface rounded-[8px] transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(att.id)}
                  title="Remove attachment"
                  className="p-1 text-ink-3 hover:text-red-400 hover:bg-red-950/20 rounded-[8px] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewItem(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-surface border border-line p-4 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-ink-2  block">
                  ATTACHMENT PREVIEW
                </span>
                <h4 className="text-sm text-ink font-medium truncate mt-0.5">
                  {previewItem.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-ink-2 hover:text-ink p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full max-h-[60vh] overflow-hidden bg-surface-raised flex items-center justify-center border border-line-subtle rounded-[8px]">
              {previewItem.type === 'image' ? (
                <img 
                  src={previewItem.url} 
                  alt={previewItem.name} 
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] w-auto object-contain" 
                />
              ) : (
                <div className="p-12 text-center text-ink-2">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-70" />
                  <p className="text-xs ">{previewItem.name}</p>
                  <p className="text-[11px]  text-ink-3 mt-1">{previewItem.size}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs  pt-2 border-t border-line-subtle">
              <span className="text-ink-2">
                Format: <span className="text-ink uppercase">{previewItem.type}</span> · {previewItem.size || 'Standard asset'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 bg-brand text-on-brand text-xs uppercase tracking-wider font-semibold rounded-[8px] hover:bg-brand-hover cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
