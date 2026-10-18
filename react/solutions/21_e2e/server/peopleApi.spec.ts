import { describe, expect, it } from 'vitest';
import { createPeopleApi } from './peopleApi';

describe('the fake people API', () => {
  it('lists the six seeded people', () => {
    const api = createPeopleApi();

    const response = api.handle('GET', '/api/people');

    expect(response?.status).toBe(200);
    expect(response?.body).toHaveLength(6);
  });

  it('answers 404 for an unknown person', () => {
    expect(createPeopleApi().handle('GET', '/api/people/999')).toEqual({
      status: 404,
      body: { message: 'Person not found' },
    });
  });

  it('creates a person with a fresh id, then lists it', () => {
    const api = createPeopleApi();

    const created = api.handle('POST', '/api/people', { name: 'Ahsoka Tano', height: '170' });

    expect(created).toEqual({ status: 201, body: expect.objectContaining({ id: '100', name: 'Ahsoka Tano', height: '170' }) });
    expect(api.handle('GET', '/api/people/100')?.status).toBe(200);
  });

  it('refuses a person without a name', () => {
    expect(createPeopleApi().handle('POST', '/api/people', { name: '  ' })?.status).toBe(400);
  });

  it('reset puts the seeded people back', () => {
    const api = createPeopleApi();
    api.handle('POST', '/api/people', { name: 'Ahsoka Tano' });

    api.handle('POST', '/api/reset');

    expect(api.handle('GET', '/api/people')?.body).toHaveLength(6);
  });
});
