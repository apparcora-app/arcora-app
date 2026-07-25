import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, Sparkles, Upload, Wand2, AlertTriangle, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDataStore } from '@/store/dataStore';
import { showToast } from '@/lib/notifications';
import { fireSimpleConfetti, fireStepConfetti } from '@/lib/animations/confetti';
import { parseDocumentFileToDraft } from '@/lib/documents/parser';
import { detectDuplicateDocument, type DuplicateMatch } from '@/lib/documents/duplicates';
import { applyModernBertAssistToDraft, getModernBertAssistSuggestion, MODERN_BERT_LABELS } from '@/lib/documents/modernBertAssist';
import {
  annotateDraftWithParserProvenance,
  applyBackendSuggestionToDraft,
  mergeBackendAssistIntoDraft,
  shouldRequestBackendAssist,
  type BackendFieldSuggestion,
} from '@/lib/documents/backendAssist';
import { useAuthStore } from '@/store/authStore';
import { processDocumentWithBackend } from '@/services/extractionService';
import { localClassifier } from '@/services/localClassifier';
import type { AppSection, UploadDraft } from '@/types';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: AppSection;
}

const sectionOptions: Array<{ value: AppSection; label: string }> = [
  { value: 'bills', label: 'Bills & Finance' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'warranties', label: 'Warranties' },
  { value: 'documents', label: 'Documents' },
  { value: 'passwords', label: 'Passwords' },
  { value: 'reminders', label: 'Reminders' },
  { value: 'others', label: 'Others' },
];

export const UploadDocumentDialog = ({
  open,
  onOpenChange,
  defaultSection = 'documents',
}: UploadDocumentDialogProps) => {
  const { uploadDocumentFromDraft } = useDataStore();
  const { user } = useAuthStore();

  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<UploadDraft | null>(null);
  const [duplicateMatch, setDuplicateMatch] = useState<DuplicateMatch | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [backendBusy, setBackendBusy] = useState(false);
  const [modernBertBusy, setModernBertBusy] = useState(false);
  const [smartDetectionStatus, setSmartDetectionStatus] = useState('');
  const [backendStatus, setBackendStatus] = useState('');
  const [backendSuggestions, setBackendSuggestions] = useState<BackendFieldSuggestion[]>([]);
  const assistRequestIdRef = useRef(0);
  const lastClassifierProgressRef = useRef(-1);

  useEffect(() => {
    if (!open) return;

    return localClassifier.setProgressListener((progress) => {
      if (progress.status === 'progress') {
        const percent = progress.loaded
          ? Math.round((progress.loaded / (progress.total || 1)) * 100)
          : 0;

        if (percent >= lastClassifierProgressRef.current + 10 || percent === 100) {
          lastClassifierProgressRef.current = percent;
          setSmartDetectionStatus(`Smart Detection AI loading: ${percent}%`);
        }
      } else if (progress.status === 'done') {
        setSmartDetectionStatus('Smart Detection AI ready to review OCR results.');
        lastClassifierProgressRef.current = 100;
      }
    });
  }, [open]);

  useEffect(() => {
    return () => {
      assistRequestIdRef.current += 1;
    };
  }, []);

  const accepted = useMemo(
    () => '.png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt,.csv,image/*,application/pdf',
    [],
  );

  const reset = () => {
    assistRequestIdRef.current += 1;
    setFile(null);
    setDraft(null);
    setDuplicateMatch(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setBusy(false);
    setBackendBusy(false);
    setModernBertBusy(false);
    setSmartDetectionStatus('');
    setBackendStatus('');
    setBackendSuggestions([]);
    lastClassifierProgressRef.current = -1;
  };

  const handleClose = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  const handleFileChange = async (selected: File | null) => {
    assistRequestIdRef.current += 1;
    const requestId = assistRequestIdRef.current;
    const isCurrentRequest = () => requestId === assistRequestIdRef.current;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setDraft(null);
    setPreviewUrl(null);
    setBusy(false);
    setBackendBusy(false);
    setModernBertBusy(false);
    setSmartDetectionStatus('');
    setBackendStatus('');
    setBackendSuggestions([]);
    lastClassifierProgressRef.current = -1;

    if (!selected) return;

    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    }

    setBusy(true);

    let localDraft: UploadDraft | null = null;
    try {
      const parsed = await parseDocumentFileToDraft(selected);
      if (!isCurrentRequest()) return;

      localDraft = annotateDraftWithParserProvenance({
        ...parsed,
        section: parsed.section === 'dashboard' ? defaultSection : parsed.section || defaultSection,
      });
      setDraft(localDraft);
    } catch (error) {
      console.error(error);
      if (!isCurrentRequest()) return;

      showToast({
        title: 'Could not process file locally',
        description: 'Trying fallback or manual review.',
        type: 'warning',
      });

      localDraft = annotateDraftWithParserProvenance({
        title: selected.name.replace(/\.[^.]+$/, ''),
        type: 'other',
        section: defaultSection,
        classificationConfidence: 0.2,
        parserStatus: 'failed',
        reviewStatus: 'needs_review',
        extractedText: '',
        extractedData: {
          summary: 'Parser failed. Manual review required.',
        },
        detectedDates: [],
        tags: [defaultSection, 'other'],
      });
      setDraft(localDraft);
    } finally {
      if (isCurrentRequest()) {
        setBusy(false);
      }
    }

    if (!isCurrentRequest() || !localDraft) return;

    if (localDraft?.extractedText?.trim()) {
      setModernBertBusy(true);
      setSmartDetectionStatus('Smart Detection AI reviewing document...');

      localClassifier
        .classify(localDraft.extractedText, [...MODERN_BERT_LABELS])
        .then((result) => {
          if (requestId !== assistRequestIdRef.current) return;

          if (!result) {
            setSmartDetectionStatus('Smart Detection AI was unavailable. Parser result kept.');
            return;
          }

          const suggestion = getModernBertAssistSuggestion(result, localDraft!);
          setDraft((prev) => {
            if (!prev || requestId !== assistRequestIdRef.current) return prev;
            return applyModernBertAssistToDraft(prev, suggestion);
          });

          if (suggestion?.shouldApply) {
            setSmartDetectionStatus(
              `Detected ${suggestion.title} (${Math.round(
                suggestion.confidence * 100,
              )}% confidence). Smart Detection AI refined the draft.`,
            );
          } else {
            setSmartDetectionStatus(
              `Reviewed as ${result.label} (${Math.round(
                result.confidence * 100,
              )}% confidence). Existing parser result kept.`,
            );
          }
        })
        .catch((error) => {
          console.warn('ModernBERT assist skipped:', error);
          if (requestId === assistRequestIdRef.current) {
            setSmartDetectionStatus('Smart Detection AI was unavailable. Parser result kept.');
          }
        })
        .finally(() => {
          if (requestId === assistRequestIdRef.current) {
            setModernBertBusy(false);
          }
        });
    } else if (localDraft) {
      setSmartDetectionStatus('Skipped because no OCR text was extracted from this file.');
    }

    if (
      import.meta.env.VITE_ENABLE_BACKEND_EXTRACTION === 'true' &&
      user?.uid &&
      localDraft &&
      shouldRequestBackendAssist(localDraft)
    ) {
      const updateBackendStatus = (status: string) => {
        if (requestId === assistRequestIdRef.current) {
          setBackendStatus(status);
        }
      };

      setBackendBusy(true);
      processDocumentWithBackend(user.uid, selected, updateBackendStatus, localDraft.extractedText)
        .then((backendResult) => {
          if (requestId !== assistRequestIdRef.current) return;

          if (backendResult) {
            setDraft((prev) => {
              if (!prev || requestId !== assistRequestIdRef.current) return prev;
              const merged = mergeBackendAssistIntoDraft(prev, backendResult);
              setBackendSuggestions(merged.suggestions);

              if (merged.suggestions.length > 0 && merged.appliedFields.length > 0) {
                setBackendStatus(
                  `Filled ${merged.appliedFields.length} missing field(s) and found ${merged.suggestions.length} AI suggestion(s) to review.`,
                );
              } else if (merged.suggestions.length > 0) {
                setBackendStatus(
                  `Found ${merged.suggestions.length} AI suggestion(s) for weak fields. Review before applying.`,
                );
              } else if (merged.appliedFields.length > 0) {
                setBackendStatus(
                  `Filled ${merged.appliedFields.length} missing field(s) from backend assist.`,
                );
              } else {
                setBackendStatus('Checked, but local parser values were kept.');
              }

              return merged.draft;
            });
          }
        })
        .catch(err => {
          console.warn('Backend extraction skipped or failed', err);
        })
        .finally(() => {
          if (requestId === assistRequestIdRef.current) {
            setBackendBusy(false);
          }
        });
    } else if (import.meta.env.VITE_ENABLE_BACKEND_EXTRACTION === 'true' && localDraft) {
      setBackendStatus('Skipped because the local parser result was already strong.');
    }
  };

  const handleApplyBackendSuggestion = (suggestionId: string) => {
    const suggestion = backendSuggestions.find((item) => item.id === suggestionId);
    if (!suggestion) return;

    setDraft((prev) => (prev ? applyBackendSuggestionToDraft(prev, suggestion) : prev));
    setBackendSuggestions((prev) => prev.filter((item) => item.id !== suggestionId));
    setBackendStatus(`Applied AI suggestion for ${suggestion.label}.`);
  };

  const handleApplyAllBackendSuggestions = () => {
    if (!backendSuggestions.length) return;

    const suggestions = [...backendSuggestions];
    setDraft((prev) => {
      if (!prev) return prev;
      return suggestions.reduce(
        (nextDraft, suggestion) => applyBackendSuggestionToDraft(nextDraft, suggestion),
        prev,
      );
    });
    setBackendSuggestions([]);
    setBackendStatus(`Applied ${suggestions.length} reviewed AI suggestion(s).`);
  };

  const handleDismissBackendSuggestions = () => {
    setBackendSuggestions([]);
    setBackendStatus('Local parser values kept. AI suggestions dismissed.');
  };

  const handleSave = async (forceAction?: 'replace' | 'merge' | 'keep_both') => {
    if (!file || !draft) return;

    setBusy(true);

    try {
      if (!forceAction) {
        const { activeDocuments } = useDataStore.getState();
        // Fallback defaultSection just like handleFileChange uses.
        const finalizedDraft = { ...draft, section: draft.section === 'dashboard' ? defaultSection : draft.section };
        const match = detectDuplicateDocument(finalizedDraft, activeDocuments);
        
        if (match) {
          setDuplicateMatch(match);
          setBusy(false);
          return; // Intercept save flow!
        }
      }

      await uploadDocumentFromDraft(
        forceAction === 'merge' ? null : file, 
        {
          ...draft,
          reviewStatus: 'finalized',
          detectedDates: draft.detectedDates ?? [],
        },
        forceAction === 'merge' ? { mergeIntoId: duplicateMatch!.existingDocumentId } :
        forceAction === 'replace' ? { supersedesId: duplicateMatch!.existingDocumentId } :
        undefined
      );

      showToast({
        title: forceAction === 'merge' ? 'Metadata updated' : 'Document uploaded',
        description: `Saved to ${draft.section === 'bills' ? 'Bills & Finance' : draft.section}.`,
        type: 'success',
      });

      if (forceAction === 'merge' || forceAction === 'replace') {
        fireStepConfetti();
      } else {
        fireSimpleConfetti();
      }

      handleClose(false);
    } catch (error) {
      console.error('Failed to save uploaded document.', error);

      const description =
        error instanceof Error
          ? error.message
          : 'The upload could not be saved. Please try again.';

      showToast({
        title: 'Upload not saved',
        description,
        type: 'error',
        duration: 7000,
      });
    } finally {
      if (!duplicateMatch || forceAction) {
         setBusy(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0 border border-border/80 bg-background/95 dark:bg-slate-900/95 text-foreground backdrop-blur-2xl rounded-3xl shadow-2xl">
        <div className="flex h-full max-h-[90vh] flex-col">
          <div className="shrink-0 border-b border-border/60 bg-muted/20 dark:bg-slate-950/40 px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">Upload Document</DialogTitle>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {duplicateMatch ? (
              <div className="flex flex-col items-center justify-center py-8 text-center max-w-lg mx-auto space-y-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Duplicate Detected</h2>
                  <p className="text-muted-foreground text-sm">
                    We found an existing document that looks very similar to the one you just uploaded: 
                    <span className="font-semibold text-foreground ml-1">"{duplicateMatch.existingDoc.title}"</span>.
                  </p>
                </div>

                <div className="w-full bg-muted/30 dark:bg-slate-800/40 border border-border/60 rounded-xl p-4 text-left">
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-primary" />
                    Why it matched (Confidence: <span className="capitalize">{duplicateMatch.confidence}</span>)
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    {duplicateMatch.reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="w-full space-y-3 pt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => handleSave('merge')}
                    disabled={busy}
                  >
                    Merge Metadata
                    <span className="block text-[10px] opacity-70 ml-2 font-normal">(Keep old file, update values)</span>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave('keep_both')}
                      disabled={busy}
                    >
                      Keep Both
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                      onClick={() => handleSave('replace')}
                      disabled={busy}
                    >
                      Replace Old
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 dark:bg-slate-800/50 p-6 cursor-pointer hover:bg-muted/50 dark:hover:bg-slate-800/80 hover:border-primary/50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-semibold text-foreground">Upload File</p>
                  </div>
                  <Input
                    type="file"
                    accept={accepted}
                    className="hidden"
                    onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                  />
                </label>

                <label className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 dark:bg-slate-800/50 p-6 cursor-pointer hover:bg-muted/50 dark:hover:bg-slate-800/80 hover:border-purple-500/50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-semibold text-foreground">Take Photo</p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              {previewUrl && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 group aspect-[4/3] max-h-60 mx-auto"
                >
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-xs font-medium">Captured: {file?.name}</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 w-8 h-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      reset();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {busy && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                    <Loader2 className="w-5 h-5 animate-spin text-primary relative z-10" />
                    <div className="relative z-10">
                      <p className="font-medium text-primary">Processing upload</p>
                      <p className="text-sm text-muted-foreground">
                        Reading file, extracting text, and classifying section.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {draft &&
                  (() => {
                    const showSmartDetection = modernBertBusy || Boolean(smartDetectionStatus);
                    if (!showSmartDetection) {
                      return null;
                    }

                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="grid gap-3"
                      >
                        {showSmartDetection && (
                          <div className="flex items-start gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                            {modernBertBusy ? (
                              <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-purple-500" />
                            ) : (
                              <Sparkles className="mt-0.5 h-4 w-4 text-purple-500" />
                            )}
                            <div>
                              <p className="font-medium text-purple-500">Smart Detection</p>
                              {smartDetectionStatus ? (
                                <p className="text-sm text-muted-foreground">{smartDetectionStatus}</p>
                              ) : null}
                            </div>
                          </div>
                        )}
                        {(backendBusy || backendStatus) && (
                          <div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                            {backendBusy ? (
                              <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-sky-500" />
                            ) : (
                              <Sparkles className="mt-0.5 h-4 w-4 text-sky-500" />
                            )}
                            <div>
                              <p className="font-medium text-sky-500">Backend Assist</p>
                              {backendStatus ? (
                                <p className="text-sm text-muted-foreground">{backendStatus}</p>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })()}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {draft && backendSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                          <div>
                            <p className="font-medium text-amber-500">AI Suggested Changes</p>
                          </div>
                        </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDismissBackendSuggestions}
                        >
                          Keep Local Values
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleApplyAllBackendSuggestions}
                        >
                          Apply All
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {backendSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="rounded-lg border border-border/60 bg-background/60 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">{suggestion.label}</p>
                              <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplyBackendSuggestion(suggestion.id)}
                            >
                              Apply
                            </Button>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-md border border-border/60 bg-muted/20 p-2">
                              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                Current
                              </p>
                              <p className="mt-1 text-sm">{suggestion.currentValue || 'Empty'}</p>
                            </div>
                            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2">
                              <p className="text-[10px] uppercase tracking-[0.18em] text-amber-500">
                                AI Suggestion
                              </p>
                              <p className="mt-1 text-sm">{suggestion.suggestedValue}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {draft && file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <div className="rounded-2xl border border-border p-4 bg-card transition-all hover:border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold">File</h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Title</label>
                          <Input
                            value={draft.title}
                            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">Section</label>
                          <select
                            value={draft.section}
                            onChange={(e) =>
                              setDraft({ ...draft, section: e.target.value as AppSection })
                            }
                            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                          >
                            {sectionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">Type</label>
                          <Input
                            value={draft.type}
                            onChange={(e) =>
                              setDraft({ ...draft, type: e.target.value as UploadDraft['type'] })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-4 bg-card transition-all hover:border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold">Extraction</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                          <p className="font-medium">
                            {Math.round(draft.classificationConfidence * 100)}%
                          </p>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">Summary</label>
                          <textarea
                            value={draft.extractedData.summary ?? ''}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                extractedData: { ...draft.extractedData, summary: e.target.value },
                              })
                            }
                            rows={5}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {(['bills', 'subscriptions'].includes(draft.section) || ['challan', 'tax-document'].includes(draft.type)) && !['license', 'passport', 'id-card'].includes(draft.type) && !['documents', 'passwords', 'reminders', 'warranties'].includes(draft.section) && (
                      <div className="md:col-span-2 rounded-2xl border border-border p-4 bg-card transition-all hover:border-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Wand2 className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold">
                            {draft.type === 'challan' ? 'Challan Details' : 
                             draft.type === 'tax-document' ? 'Tax Details' : 
                             draft.section === 'subscriptions' ? 'Subscription Details' : 'Bill Details'}
                          </h3>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <InputField
                            label={draft.type === 'challan' ? 'Institution / Board' : draft.section === 'subscriptions' ? 'Service Provider' : 'Provider / Company'}
                            value={draft.extractedData.bill?.providerName ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: { ...draft.extractedData.bill, providerName: value },
                                },
                              })
                            }
                          />

                          <InputField
                            label={draft.type === 'tax-document' ? 'Form / Document #' : 'Invoice Number'}
                            value={draft.extractedData.bill?.invoiceNumber ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: { ...draft.extractedData.bill, invoiceNumber: value },
                                },
                              })
                            }
                          />

                          <InputField
                            label={draft.type === 'challan' ? 'Challan / Registration #' : 'Reference Number'}
                            value={draft.extractedData.bill?.referenceNumber ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: { ...draft.extractedData.bill, referenceNumber: value },
                                },
                              })
                            }
                          />

                          <InputField
                            label="PSID / Electronic ID"
                            value={draft.extractedData.bill?.psid ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: { ...draft.extractedData.bill, psid: value },
                                },
                              })
                            }
                          />

                          <InputField
                            label="Account / Consumer #"
                            value={draft.extractedData.bill?.accountNumber ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: { ...draft.extractedData.bill, accountNumber: value },
                                },
                              })
                            }
                          />

                          <InputField
                            label="Customer / Student #"
                            value={draft.extractedData.bill?.customerNumber ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: { ...draft.extractedData.bill, customerNumber: value },
                                },
                              })
                            }
                          />

                          <InputField
                            label={draft.type === 'tax-document' ? 'Tax Year / Period' : 'Billing Month / Period'}
                            value={draft.extractedData.bill?.billingMonth ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: { ...draft.extractedData.bill, billingMonth: value },
                                },
                              })
                            }
                          />

                          <InputField
                            label="Issue Date"
                            value={draft.extractedData.bill?.issueDateText ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: { ...draft.extractedData.bill, issueDateText: value },
                                },
                              })
                            }
                          />

                          <InputField
                            label="Due Date / Deadline"
                            value={draft.extractedData.bill?.dueDateText ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: { ...draft.extractedData.bill, dueDateText: value },
                                },
                              })
                            }
                          />

                          <InputField
                            label="Amount Due / Total"
                            type="number"
                            value={draft.extractedData.bill?.amountDue?.toString() ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: {
                                    ...draft.extractedData.bill,
                                    amountDue: value ? Number(value) : undefined,
                                  },
                                },
                              })
                            }
                          />

                          <InputField
                            label="Payable After Due Date"
                            type="number"
                            value={draft.extractedData.bill?.lateAmountPayable?.toString() ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: {
                                    ...draft.extractedData.bill,
                                    lateAmountPayable: value ? Number(value) : undefined,
                                  },
                                },
                              })
                            }
                          />

                          <InputField
                            label="Late Surcharge / Penalty"
                            type="number"
                            value={draft.extractedData.bill?.lateAmount?.toString() ?? ''}
                            onChange={(value) =>
                              setDraft({
                                ...draft,
                                extractedData: {
                                  ...draft.extractedData,
                                  bill: {
                                    ...draft.extractedData.bill,
                                    lateAmount: value ? Number(value) : undefined,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}
          </div>

          {!duplicateMatch && (
            <div className="shrink-0 border-t border-border/60 bg-muted/20 dark:bg-slate-950/40 px-6 py-4">
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => handleClose(false)} className="text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
              <Button onClick={() => handleSave()} disabled={!file || !draft || busy}>
                {busy ? 'Saving...' : 'Save Upload'}
              </Button>
            </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
}: InputFieldProps) => (
  <div>
    <label className="text-xs text-muted-foreground">{label}</label>
    <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);
