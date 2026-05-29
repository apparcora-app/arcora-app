import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeferredUploadDocumentDialog } from './DeferredUploadDocumentDialog';
import type { AppSection } from '@/types';

interface UploadDocumentButtonProps {
  defaultSection?: AppSection;
  label?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
}

export const UploadDocumentButton = ({
  defaultSection = 'documents',
  label = 'Upload Document',
  variant = 'outline',
  className,
}: UploadDocumentButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} className={className} onClick={() => setOpen(true)}>
        <Upload className="w-4 h-4 mr-2" />
        {label}
      </Button>

      <DeferredUploadDocumentDialog
        open={open}
        onOpenChange={setOpen}
        defaultSection={defaultSection}
      />
    </>
  );
};
