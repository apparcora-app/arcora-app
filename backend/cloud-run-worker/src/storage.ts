import { adminStorage } from './firebase';

export const downloadFile = async (storagePath: string): Promise<Buffer> => {
  const file = adminStorage.file(storagePath);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`File at ${storagePath} does not exist`);
  }

  const [buffer] = await file.download();
  return buffer;
};

export const getFileMetadata = async (storagePath: string) => {
  const file = adminStorage.file(storagePath);
  const [metadata] = await file.getMetadata();
  return metadata;
};
