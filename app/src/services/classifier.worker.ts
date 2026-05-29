import { pipeline, env } from '@huggingface/transformers';

// Skip local check, we'll rely on the CDN or local caching by the browser.
// This ensures it works even if the local environment isn't perfectly set up for raw models.
env.allowLocalModels = false;

type ClassifierProgress = {
  status?: string;
  loaded?: number;
  total?: number;
  [key: string]: unknown;
};

type ClassificationOutput = {
  labels: string[];
  scores: number[];
};

type ZeroShotClassifier = (
  text: string,
  labels: string[],
  options: { hypothesis_template: string; multi_label: boolean },
) => Promise<ClassificationOutput>;

let classifier: ZeroShotClassifier | null = null;

const CATEGORIES = [
  'electricity bill',
  'gas bill',
  'internet bill',
  'mobile postpaid bill',
  'subscription invoice',
  'warranty card',
  'account maintenance certificate',
  'salary slip',
  'bank statement',
  'identity document',
  'tax document',
  'receipt',
  'invoice',
  'personal note',
  'general document',
];

const initClassifier = async () => {
  if (classifier) return classifier;
  
  const progress_callback = (progress: ClassifierProgress) => {
    self.postMessage({ type: 'progress', progress });
  };

  try {
    // We use a zero-shot classification model. 
    classifier = await pipeline('zero-shot-classification', 'onnx-community/ModernBERT-base-nli-ONNX', {
      device: 'webgpu',
      progress_callback
    }) as ZeroShotClassifier;
    return classifier;
  } catch (err) {
    console.warn('WebGPU not supported, falling back to WASM/CPU:', err);
    classifier = await pipeline('zero-shot-classification', 'onnx-community/ModernBERT-base-nli-ONNX', {
      progress_callback
    }) as ZeroShotClassifier;
    return classifier;
  }
};

// Listen for messages from the main thread
self.onmessage = async (event) => {
  const { type, text, labels, requestId } = event.data;

  if (type === 'init') {
    try {
      await initClassifier();
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (type === 'classify') {
    try {
      const pipe = await initClassifier();
      const output = await pipe(text, labels || CATEGORIES, {
        hypothesis_template: 'This document is a {}.',
        multi_label: true,
      });
      
      self.postMessage({ 
        requestId,
        type: 'classification_result', 
        result: {
          label: output.labels[0],
          confidence: output.scores[0],
          all_scores: output.labels.reduce<Record<string, number>>((acc, label, i) => {
            acc[label] = output.scores[i];
            return acc;
          }, {})
        }
      });
    } catch (error) {
      console.error('Classification error in worker:', error);
      self.postMessage({
        type: 'error',
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};
