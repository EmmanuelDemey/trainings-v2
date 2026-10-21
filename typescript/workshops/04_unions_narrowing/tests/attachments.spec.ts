import { describe, expect, test } from 'vitest';
import { formatDuration, isPlayable, render, totalDuration } from '../src/attachments.ts';
import { clip, photo, podcast } from './fixtures.ts';

describe('render', () => {
  test('renders an image', () => {
    expect(render(photo)).toBe('<img src="https://cdn.blog.dev/cat.jpg" alt="A cat" width="800" height="600">');
  });

  test('renders a video, muted when it plays on its own', () => {
    expect(render(clip)).toBe('<video src="https://cdn.blog.dev/talk.mp4" poster="https://cdn.blog.dev/talk.jpg"></video>');
    expect(render({ ...clip, autoplay: true })).toBe(
      '<video src="https://cdn.blog.dev/talk.mp4" poster="https://cdn.blog.dev/talk.jpg" autoplay muted></video>',
    );
  });

  test('renders a sound', () => {
    expect(render(podcast)).toBe('<audio src="https://cdn.blog.dev/ep1.mp3" controls></audio>');
  });
});

describe('isPlayable', () => {
  test('is true for a video and a sound, false for an image', () => {
    expect([photo, clip, podcast].map(isPlayable)).toEqual([false, true, true]);
  });
});

describe('totalDuration', () => {
  test('adds up the durations of what plays, and ignores the images', () => {
    expect(totalDuration([photo, clip, podcast])).toBe(3725);
  });
});

describe('formatDuration', () => {
  test('gives minutes and seconds', () => {
    expect(formatDuration(187)).toBe('3:07');
  });

  test('gives hours past an hour', () => {
    expect(formatDuration(3725)).toBe('1:02:05');
  });
});
