// The state of an upload, and the reducer `useReducer` drives it with. Each
// state carries exactly what makes sense in it: no `progress` once it is done,
// no `error` unless it failed.
import { assertNever } from './attachments.ts';
import type { Attachment } from './attachments.ts';

export type Upload =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'done'; attachment: Attachment }
  | { status: 'failed'; error: string };

export type UploadAction =
  | { type: 'start' }
  | { type: 'progress'; progress: number }
  | { type: 'success'; attachment: Attachment }
  | { type: 'failure'; error: string }
  | { type: 'retry' };

/** The next state. An action that makes no sense in the current state leaves it as it is. */
export function uploadReducer(upload: Upload, action: UploadAction): Upload {
  switch (action.type) {
    case 'start':
      return upload.status === 'idle' ? { status: 'uploading', progress: 0 } : upload;
    case 'progress':
      return upload.status === 'uploading' ? { status: 'uploading', progress: action.progress } : upload;
    case 'success':
      return upload.status === 'uploading' ? { status: 'done', attachment: action.attachment } : upload;
    case 'failure':
      return upload.status === 'uploading' ? { status: 'failed', error: action.error } : upload;
    case 'retry':
      return upload.status === 'failed' ? { status: 'uploading', progress: 0 } : upload;
    default:
      return assertNever(action);
  }
}
