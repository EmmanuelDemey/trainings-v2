export interface Review {
  personId: string;
  /** From 1 to 5. */
  stars: number;
  comment: string;
}
