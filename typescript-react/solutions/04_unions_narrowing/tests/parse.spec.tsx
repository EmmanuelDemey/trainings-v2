import { describe, expect, test } from 'vitest';
import { InvalidAttachmentError, parseAttachment } from '../src/parse.ts';
import { clip, photo, podcast } from './fixtures.ts';

describe('parseAttachment', () => {
  test('accepts each kind of attachment', () => {
    expect(parseAttachment(JSON.parse(JSON.stringify(photo)))).toEqual(photo);
    expect(parseAttachment(JSON.parse(JSON.stringify(clip)))).toEqual(clip);
    expect(parseAttachment(JSON.parse(JSON.stringify(podcast)))).toEqual(podcast);
  });

  test('drops the fields its kind does not have', () => {
    expect(parseAttachment({ ...podcast, altText: 'A podcast', width: 1 })).toEqual(podcast);
  });

  test('turns autoplay off when it is missing', () => {
    const { autoplay: _autoplay, ...rest } = clip;
    expect(parseAttachment(rest)).toEqual(clip);
  });

  test.each([
    ['null', null, 'An attachment is an object'],
    ['an array', [photo], 'An attachment is an object'],
    ['an http URL', { ...photo, url: 'http://cdn.blog.dev/cat.jpg' }, 'url must be an https URL'],
    ['an unknown kind', { ...photo, kind: 'gif' }, 'Unknown kind: gif'],
    ['an image without altText', { ...photo, altText: ' ' }, 'An image needs an altText'],
    ['a sound of no length', { ...podcast, duration: 0 }, 'A audio needs a positive duration'],
    ['a video without thumbnail', { ...clip, thumbnailUrl: undefined }, 'A video needs a thumbnailUrl'],
  ])('refuses %s', (_label, input, message) => {
    expect(() => parseAttachment(input)).toThrow(new InvalidAttachmentError(message));
  });

  test('throws an InvalidAttachmentError', () => {
    expect(() => parseAttachment(42)).toThrow(InvalidAttachmentError);
  });
});
