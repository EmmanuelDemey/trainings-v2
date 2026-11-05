export type Role = 'user' | 'admin';

/** Who is logged in — read from the claims of the access token. */
export interface User {
  id: string;
  name: string;
  role: Role;
}
