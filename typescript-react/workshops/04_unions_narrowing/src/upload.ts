// The state of an upload, and the reducer `useReducer` drives it with.
import type { Attachment } from './attachments.ts';

/**
 * TODO 5: one shape where every state carries every field. Make it a
 * discriminated union on `status`: `idle`, `uploading` with a `progress`,
 * `done` with an `attachment`, `failed` with an `error`.
 */
export interface Upload {
  status: 'idle' | 'uploading' | 'done' | 'failed';
  progress?: number;
  attachment?: Attachment;
  error?: string;
}

export type UploadAction =
  | { type: 'start' }
  | { type: 'progress'; progress: number }
  | { type: 'success'; attachment: Attachment }
  | { type: 'failure'; error: string }
  | { type: 'retry' };

/**
 * TODO 6: the next state. `start` from idle, `progress`, `success` and
 * `failure` while uploading, `retry` once failed. An action that makes no sense
 * in the current state returns it as it is.
 */
export function uploadReducer(upload: Upload, action: UploadAction): Upload {
  return upload;
}
