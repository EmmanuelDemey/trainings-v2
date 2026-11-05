/** The user the login button signs in — there is no real authentication here. */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export const ADA: CurrentUser = { id: 'u-42', name: 'Ada Lovelace', email: 'ada@example.com' };
