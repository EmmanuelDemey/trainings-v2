import { describe as group, expect, test } from 'vitest';
import { describe, next } from '../src/upload.ts';
import type { Upload } from '../src/upload.ts';
import { photo } from './fixtures.ts';

group('next', () => {
  test('goes through a whole upload', () => {
    let upload: Upload = { status: 'idle' };
    upload = next(upload, { type: 'start' });
    expect(upload).toEqual({ status: 'uploading', progress: 0 });
    upload = next(upload, { type: 'progress', progress: 0.5 });
    expect(upload).toEqual({ status: 'uploading', progress: 0.5 });
    upload = next(upload, { type: 'success', attachment: photo });
    expect(upload).toEqual({ status: 'done', attachment: photo });
  });

  test('fails, then starts over on a retry', () => {
    const failed = next({ status: 'uploading', progress: 0.3 }, { type: 'failure', error: 'Network down' });
    expect(failed).toEqual({ status: 'failed', error: 'Network down' });
    expect(next(failed, { type: 'retry' })).toEqual({ status: 'uploading', progress: 0 });
  });

  test('ignores an event that makes no sense in the current state', () => {
    const done: Upload = { status: 'done', attachment: photo };
    expect(next(done, { type: 'progress', progress: 0.9 })).toBe(done);
    expect(next(done, { type: 'retry' })).toBe(done);
    const idle: Upload = { status: 'idle' };
    expect(next(idle, { type: 'success', attachment: photo })).toBe(idle);
  });
});

group('describe', () => {
  test.each<[Upload, string]>([
    [{ status: 'idle' }, 'Choose a file'],
    [{ status: 'uploading', progress: 0.42 }, 'Uploading… 42%'],
    [{ status: 'done', attachment: photo }, 'Uploaded: image'],
    [{ status: 'failed', error: 'Too big' }, 'Failed: Too big'],
  ])('describes %j', (upload, text) => {
    expect(describe(upload)).toBe(text);
  });
});
