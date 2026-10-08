import * as z from 'zod';

/**
 * A date on the wire is an ISO string; in the app it is a `Date`. A codec says
 * both directions once.
 *
 * TODO 4: write the two directions — `decode` on the way in, `encode` on the way out.
 */
export const IsoDateTime = z.codec(z.iso.datetime(), z.date(), {
  decode: (iso) => {
    throw new Error(`TODO 4: decode ${iso}`);
  },
  encode: (date) => {
    throw new Error(`TODO 4: encode ${date}`);
  },
});

export const ConcertWireSchema = z.object({
  id: z.string(),
  artist: z.string(),
  startsAt: IsoDateTime,
});

export type ConcertWire = z.input<typeof ConcertWireSchema>;
export type Concert = z.output<typeof ConcertWireSchema>;

/** TODO 4: JSON from the API → a concert whose `startsAt` is a `Date`. */
export function decodeConcert(json: unknown): Concert {
  throw new Error(`TODO 4: decode ${JSON.stringify(json)}`);
}

/** TODO 4: a concert of the app → the JSON the API expects. */
export function encodeConcert(concert: Concert): ConcertWire {
  throw new Error(`TODO 4: encode ${concert.id}`);
}
