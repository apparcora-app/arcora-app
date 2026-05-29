import type { UploadDraft } from '@/types';

const BACKEND_HEALTH_TIMEOUT_MS = 1200;
const backendHealthCache = new Map<string, { ok: boolean; checkedAt: number }>();

const getSafeWorkerUrl = (onStatusChange?: (status: string) => void) => {
  if (import.meta.env.VITE_ENABLE_BACKEND_EXTRACTION !== 'true') {
    onStatusChange?.('Backend extraction disabled, using local OCR results only.');
    return undefined;
  }

  const configuredUrl = import.meta.env.VITE_EXTRACTION_WORKER_URL;
  if (!configuredUrl) {
    onStatusChange?.('Not configured, using local OCR results only.');
    return undefined;
  }

  let workerUrl: URL;
  try {
    workerUrl = new URL(configuredUrl);
  } catch {
    onStatusChange?.('Invalid backend URL, using local OCR results only.');
    return undefined;
  }

  const isLocalWorker =
    workerUrl.hostname === 'localhost' ||
    workerUrl.hostname === '127.0.0.1' ||
    workerUrl.hostname === '[::1]';

  if (import.meta.env.PROD && workerUrl.protocol !== 'https:') {
    onStatusChange?.('Insecure backend URL, using local OCR results only.');
    return undefined;
  }

  if (!import.meta.env.DEV && isLocalWorker) {
    onStatusChange?.('Local backend unavailable, using local OCR results only.');
    return undefined;
  }

  if (workerUrl.protocol !== 'https:' && !(import.meta.env.DEV && isLocalWorker)) {
    onStatusChange?.('Insecure backend URL, using local OCR results only.');
    return undefined;
  }

  return workerUrl;
};

const withTimeout = (timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => window.clearTimeout(timeoutId),
  };
};

const isBackendAvailable = async (workerUrl: string) => {
  const cached = backendHealthCache.get(workerUrl);
  const now = Date.now();

  if (cached && now - cached.checkedAt < (cached.ok ? 30000 : 300000)) {
    return cached.ok;
  }

  const { signal, clear } = withTimeout(BACKEND_HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(new URL('/health', workerUrl).toString(), {
      cache: 'no-store',
      method: 'GET',
      signal,
    });

    const ok = response.ok;
    backendHealthCache.set(workerUrl, { ok, checkedAt: now });
    return ok;
  } catch {
    backendHealthCache.set(workerUrl, { ok: false, checkedAt: now });
    return false;
  } finally {
    clear();
  }
};

export const processDocumentWithBackend = async (
  userId: string,
  file: File,
  onStatusChange?: (status: string) => void,
  ocrText?: string // Optional OCR text if already extracted
): Promise<UploadDraft | undefined> => {
  if (!userId) {
    onStatusChange?.('Missing session, using local OCR results only.');
    return undefined;
  }

  const workerUrl = getSafeWorkerUrl(onStatusChange);
  if (!workerUrl) {
    return undefined;
  }

  if (onStatusChange) onStatusChange('Checking backend availability...');

  const backendReady = await isBackendAvailable(workerUrl.toString());
  if (!backendReady) {
    onStatusChange?.('Offline, using local OCR results only.');
    return undefined;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      
      try {
        if (onStatusChange) onStatusChange('Extracting structured fields from the document...');
        
        // TODO: Send a Firebase ID token and App Check token once the worker verifies
        // both server-side and enforces that the submitted uid matches the token uid.
        const response = await fetch(new URL('/process', workerUrl).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileBase64: base64,
            ocrText: ocrText // Pass OCR text to backend to save it some work
          })
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new Error(
            `Failed to extract data: ${response.status} ${response.statusText}${
              errorBody ? ` - ${errorBody}` : ''
            }`,
          );
        }

        const data = await response.json();
        resolve(data.result);
      } catch (err) {
        console.warn('Backend extraction skipped:', err);
        const errorMessage = err instanceof Error ? err.message : '';
        const errorName = err instanceof Error ? err.name : '';
        if (errorMessage === 'Failed to fetch' || errorName === 'TypeError' || errorName === 'AbortError') {
            onStatusChange?.('Offline, using local OCR results only.');
            resolve(undefined);
            return;
        }
        onStatusChange?.('Error, using local OCR results only.');
        resolve(undefined);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
