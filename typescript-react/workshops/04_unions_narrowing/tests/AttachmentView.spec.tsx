import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AttachmentView } from '../src/AttachmentView.tsx';
import { clip, photo, podcast } from './fixtures.ts';

describe('AttachmentView', () => {
  test('renders an image, with its alt text and its size', () => {
    render(<AttachmentView attachment={photo} />);
    const image = screen.getByRole('img', { name: 'A cat' });
    expect(image.getAttribute('src')).toBe('https://cdn.blog.dev/cat.jpg');
    expect(image.getAttribute('width')).toBe('800');
    expect(image.getAttribute('height')).toBe('600');
  });

  test('renders a video, muted when it plays on its own', () => {
    const { container, rerender } = render(<AttachmentView attachment={clip} />);
    const video = container.querySelector('video');
    expect(video?.getAttribute('src')).toBe('https://cdn.blog.dev/talk.mp4');
    expect(video?.getAttribute('poster')).toBe('https://cdn.blog.dev/talk.jpg');
    expect(video?.autoplay).toBe(false);
    rerender(<AttachmentView attachment={{ ...clip, autoplay: true }} />);
    expect(container.querySelector('video')?.autoplay).toBe(true);
    expect(container.querySelector('video')?.muted).toBe(true);
  });

  test('renders a sound, with its controls', () => {
    const { container } = render(<AttachmentView attachment={podcast} />);
    const audio = container.querySelector('audio');
    expect(audio?.getAttribute('src')).toBe('https://cdn.blog.dev/ep1.mp3');
    expect(audio?.controls).toBe(true);
  });
});
