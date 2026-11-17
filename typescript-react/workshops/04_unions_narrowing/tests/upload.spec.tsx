import { useReducer } from 'react';
import { describe, expect, test } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { uploadReducer } from '../src/upload.ts';
import type { Upload } from '../src/upload.ts';
import { UploadStatus } from '../src/UploadStatus.tsx';
import { photo } from './fixtures.ts';

describe('uploadReducer', () => {
  test('goes through a whole upload, driven by useReducer', () => {
    const { result } = renderHook(() => useReducer(uploadReducer, { status: 'idle' }));
    const dispatch = result.current[1];
    act(() => dispatch({ type: 'start' }));
    expect(result.current[0]).toEqual({ status: 'uploading', progress: 0 });
    act(() => dispatch({ type: 'progress', progress: 0.5 }));
    expect(result.current[0]).toEqual({ status: 'uploading', progress: 0.5 });
    act(() => dispatch({ type: 'success', attachment: photo }));
    expect(result.current[0]).toEqual({ status: 'done', attachment: photo });
  });

  test('fails, then starts over on a retry', () => {
    const failed = uploadReducer({ status: 'uploading', progress: 0.3 }, { type: 'failure', error: 'Network down' });
    expect(failed).toEqual({ status: 'failed', error: 'Network down' });
    expect(uploadReducer(failed, { type: 'retry' })).toEqual({ status: 'uploading', progress: 0 });
  });

  test('ignores an action that makes no sense in the current state', () => {
    const done: Upload = { status: 'done', attachment: photo };
    expect(uploadReducer(done, { type: 'progress', progress: 0.9 })).toBe(done);
    expect(uploadReducer(done, { type: 'retry' })).toBe(done);
    const idle: Upload = { status: 'idle' };
    expect(uploadReducer(idle, { type: 'success', attachment: photo })).toBe(idle);
  });
});

describe('UploadStatus', () => {
  test.each<[Upload, string]>([
    [{ status: 'idle' }, 'Choose a file'],
    [{ status: 'uploading', progress: 0.42 }, 'Uploading… 42%'],
    [{ status: 'done', attachment: photo }, 'Uploaded: image'],
    [{ status: 'failed', error: 'Too big' }, 'Failed: Too big'],
  ])('describes %j', (upload, text) => {
    const { container } = render(<UploadStatus upload={upload} />);
    expect(container.textContent?.trim()).toBe(text);
  });

  test('shows a failure as an alert', () => {
    render(<UploadStatus upload={{ status: 'failed', error: 'Too big' }} />);
    expect(screen.getByRole('alert').textContent).toBe('Failed: Too big');
  });
});
