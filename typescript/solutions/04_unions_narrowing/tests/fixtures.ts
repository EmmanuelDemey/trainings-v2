import type { Audio, Image, Video } from '../src/attachments.ts';

export const photo: Image = { kind: 'image', url: 'https://cdn.blog.dev/cat.jpg', altText: 'A cat', width: 800, height: 600 };
export const clip: Video = {
  kind: 'video',
  url: 'https://cdn.blog.dev/talk.mp4',
  thumbnailUrl: 'https://cdn.blog.dev/talk.jpg',
  duration: 1800,
  autoplay: false,
};
export const podcast: Audio = { kind: 'audio', url: 'https://cdn.blog.dev/ep1.mp3', duration: 1925 };
