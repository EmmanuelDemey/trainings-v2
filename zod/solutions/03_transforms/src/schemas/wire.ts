import * as z from 'zod';

/**
 * A date on the wire is an ISO string; in the app it is a `Date`. A codec says
 * both directions once: `decode` on the way in, `encode` on the way out.
 */
export const IsoDateTime = z.codec(z.iso.datetime(), z.date(), {
  decode: (iso) => new Date(iso),
  encode: (date) => date.toISOString(),
});

export const ConcertWireSchema = z.object({
  id: z.string(),
  artist: z.string(),
  startsAt: IsoDateTime,
});

export type ConcertWire = z.input<typeof ConcertWireSchema>;
export type Concert = z.output<typeof ConcertWireSchema>;

/** JSON from the API → a concert whose `startsAt` is a `Date`. */
export function decodeConcert(json: unknown): Concert {
  return z.decode(ConcertWireSchema, json as ConcertWire);
}

/** A concert of the app → the JSON the API expects. */
export function encodeConcert(concert: Concert): ConcertWire {
  return z.encode(ConcertWireSchema, concert);
}
