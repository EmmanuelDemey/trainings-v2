export interface User {
  id: string;
  name: string;
  address: {
    city: string;
    geo: { lat: number; lng: number };
  };
  tags: string[];
}

export const ada: User = {
  id: 'u_ada',
  name: 'Ada',
  address: { city: 'London', geo: { lat: 51.5, lng: -0.12 } },
  tags: ['math'],
};
