import { describe, expect, it } from 'vitest';
import { decodeConcert, encodeConcert } from '../src/schemas/wire';

const json = { id: 'c1', artist: 'Fela', startsAt: '2026-11-14T20:30:00.000Z' };

describe('decodeConcert', () => {
  it('turns the ISO string into a Date', () => {
    const concert = decodeConcert(json);
    expect(concert.startsAt).toBeInstanceOf(Date);
    expect(concert.startsAt.getUTCHours()).toBe(20);
  });

  it('rejects a date that is not an ISO date-time', () => {
    expect(() => decodeConcert({ ...json, startsAt: 'next friday' })).toThrow();
  });
});

describe('encodeConcert', () => {
  it('turns the Date back into the ISO string the API expects', () => {
    expect(encodeConcert({ id: 'c1', artist: 'Fela', startsAt: new Date('2026-11-14T20:30:00Z') })).toEqual(json);
  });

  it('round-trips: encode(decode(json)) is json again', () => {
    expect(encodeConcert(decodeConcert(json))).toEqual(json);
  });
});
