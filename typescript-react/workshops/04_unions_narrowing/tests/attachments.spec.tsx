import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatDuration, images, isPlayable, totalDuration } from '../src/attachments.ts';
import { Playlist } from '../src/Playlist.tsx';
import { clip, photo, podcast } from './fixtures.ts';

describe('isPlayable', () => {
  test('is true for a video and a sound, false for an image', () => {
    expect([photo, clip, podcast].map(isPlayable)).toEqual([false, true, true]);
  });
});

describe('images', () => {
  test('keeps only the images, in order', () => {
    expect(images([clip, photo, podcast, photo])).toEqual([photo, photo]);
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

describe('Playlist', () => {
  test('lists what plays, with its duration, and the total', () => {
    render(<Playlist attachments={[photo, clip, podcast]} />);
    const items = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(items).toEqual(['video — 30:00', 'audio — 32:05']);
    expect(screen.getByText('Total: 1:02:05')).toBeDefined();
  });
});
