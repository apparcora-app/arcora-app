import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AppSection } from '@/types';

interface DeferredUploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: AppSection;
}

const LazyUploadDocumentDialog = lazy(() =>
  import('./UploadDocumentDialog').then((module) => ({
    default: module.UploadDocumentDialog,
  })),
);

const UploadDialogFallback = ({
  open,
  onOpenChange,
}: Pick<DeferredUploadDocumentDialogProps, 'open' | 'onOpenChange'>) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Preparing upload workspace...</DialogTitle>
      </DialogHeader>
      <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading document tools and smart parsing.
      </div>
    </DialogContent>
  </Dialog>
);

export const DeferredUploadDocumentDialog = ({
  open,
  onOpenChange,
  defaultSection = 'documents',
}: DeferredUploadDocumentDialogProps) => {
  if (!open) {
    return null;
  }

  return (
    <Suspense fallback={<UploadDialogFallback open={open} onOpenChange={onOpenChange} />}>
      <LazyUploadDocumentDialog
        open={open}
        onOpenChange={onOpenChange}
        defaultSection={defaultSection}
      />
    </Suspense>
  );
};
