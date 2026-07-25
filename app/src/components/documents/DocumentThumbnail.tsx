import { createElement, useState } from 'react';
import {
  File,
  FileCheck,
  FileSignature,
  FileText,
  Globe,
  IdCard,
  Landmark,
  Lock,
  Receipt,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSectionTheme } from '@/lib/sectionTheme';
import type { Document, DocumentType } from '@/types';

const documentIcons: Record<DocumentType, LucideIcon> = {
  passport: Globe,
  license: IdCard,
  insurance: Shield,
  contract: FileSignature,
  invoice: Receipt,
  receipt: FileText,
  statement: FileText,
  bill: Receipt,
  challan: Landmark,
  'tax-document': FileCheck,
  warranty: Shield,
  'password-export': Lock,
  'reminder-note': FileText,
  other: File,
};

const getFileExtension = (fileName: string) => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
};

const getDocumentIcon = (type: DocumentType) => documentIcons[type] || File;

export const DocumentThumbnail = ({
  doc,
  className,
}: {
  doc: Document;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const theme = getSectionTheme(doc.section);
  const isImage = doc.mimeType.startsWith('image/') && !imageError;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.35rem] border bg-card/80',
        theme.borderClassName,
        className,
      )}
    >
      {isImage ? (
        <>
          <img
            src={doc.fileUrl}
            alt={doc.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        </>
      ) : (
        <div className={cn('flex h-full w-full flex-col justify-between p-4', theme.surfaceClassName)}>
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10',
              theme.iconWrapClassName,
            )}
          >
            {createElement(getDocumentIcon(doc.type), {
              className: cn('h-5 w-5', theme.iconClassName),
            })}
          </div>

          <div className="space-y-2">
            <span
              className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]',
                theme.badgeClassName,
              )}
            >
              {getFileExtension(doc.fileName)}
            </span>
            <p className="line-clamp-2 max-w-[12rem] text-sm font-semibold text-white/90">
              {doc.title}
            </p>
          </div>
        </div>
      )}

      <div className="absolute left-3 top-3">
        <span
          className={cn(
            'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] backdrop-blur-md',
            theme.badgeClassName,
          )}
        >
          {doc.type.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
};
