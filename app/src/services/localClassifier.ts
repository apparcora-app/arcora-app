export type ClassificationProgress = {
  status: 'initiate' | 'download' | 'progress' | 'done' | 'ready';
  file?: string;
  loaded?: number;
  total?: number;
}

export interface LocalClassificationResult {
  label: string;
  confidence: number;
  all_scores?: Record<string, number>;
}

export class LocalClassifier {
  private static instance: LocalClassifier;
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;
  private pendingClassifications = new Map<
    number,
    {
      resolve: (value: LocalClassificationResult | null) => void;
      timeoutId: ReturnType<typeof setTimeout>;
    }
  >();
  private nextRequestId = 0;
  private onProgress: ((progress: ClassificationProgress) => void) | null = null;

  private constructor() {}

  public static getInstance(): LocalClassifier {
    if (!LocalClassifier.instance) {
      LocalClassifier.instance = new LocalClassifier();
    }
    return LocalClassifier.instance;
  }

  /**
   * Proactively start the AI engine. 
   * Useful for pre-loading weights before the user tries to upload something.
   */
  public preload() {
    this.initWorker();
  }

  public setProgressListener(callback: (progress: ClassificationProgress) => void) {
    this.onProgress = callback;

    return () => {
      if (this.onProgress === callback) {
        this.onProgress = null;
      }
    };
  }

  private initWorker() {
    if (typeof window === 'undefined' || this.worker) return;

    this.worker = new Worker(
      new URL('./classifier.worker.ts', import.meta.url), 
      { type: 'module' }
    );

    this.readyPromise = new Promise((resolve, reject) => {
      if (!this.worker) return reject('Worker failed to initialize');

      this.worker.onmessage = (event) => {
        const { type, result, error, progress, requestId } = event.data;

        if (type === 'ready') {
          console.log('Local AI Classifier is ready');
          resolve();
        } else if (type === 'progress') {
          if (this.onProgress) this.onProgress(progress);
        } else if (type === 'classification_result') {
          this.resolveClassification(requestId, result);
        } else if (type === 'error') {
          console.error('Local AI Error:', error);
          if (typeof requestId === 'number') {
            this.resolveClassification(requestId, null);
          } else {
            this.resolveAllClassifications(null);
            reject(error);
          }
        }
      };

      this.worker.postMessage({ type: 'init' });
    });
  }

  private resolveClassification(
    requestId: number | undefined,
    result: LocalClassificationResult | null,
  ) {
    if (typeof requestId !== 'number') return;

    const pending = this.pendingClassifications.get(requestId);
    if (!pending) return;

    clearTimeout(pending.timeoutId);
    this.pendingClassifications.delete(requestId);
    pending.resolve(result);
  }

  private resolveAllClassifications(result: LocalClassificationResult | null) {
    this.pendingClassifications.forEach((pending) => {
      clearTimeout(pending.timeoutId);
      pending.resolve(result);
    });
    this.pendingClassifications.clear();
  }

  public async classify(text: string, labels?: string[]): Promise<LocalClassificationResult | null> {
    try {
      if (!this.readyPromise) this.initWorker();
      
      // Extended timeout for the FIRST load (downloading weights)
      // 180 seconds = 3 minutes
      await this.readyPromise;

      const worker = this.worker;
      if (!worker) return null;

      return new Promise((resolve) => {
        const requestId = ++this.nextRequestId;
        
        // Inference timeout is 10s once model is loaded, but wait is long for load.
        const timeoutId = setTimeout(() => {
          if (this.pendingClassifications.has(requestId)) {
            console.warn('Local classification timed out after model load');
            this.resolveClassification(requestId, null);
          }
        }, 15000);

        this.pendingClassifications.set(requestId, { resolve, timeoutId });
        worker.postMessage({ type: 'classify', requestId, text, labels });
      });
    } catch (err) {
      console.error('Failed to run local classification:', err);
      return null;
    }
  }
}

export const localClassifier = LocalClassifier.getInstance();
