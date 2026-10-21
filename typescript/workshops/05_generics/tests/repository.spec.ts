import { describe, expect, test } from 'vitest';
import { Repository } from '../src/repository.ts';
import { ada, alan, type User } from './fixtures.ts';

describe('Repository', () => {
  test('finds a saved entity by its id', () => {
    const repository = new Repository<User>();
    repository.save(ada);
    expect(repository.findById('u1')).toEqual(ada);
  });

  test('returns undefined for an unknown id', () => {
    expect(new Repository<User>().findById('nope')).toBeUndefined();
  });

  test('lists every entity saved', () => {
    const repository = new Repository<User>();
    repository.save(ada);
    repository.save(alan);
    expect(repository.findAll()).toEqual([ada, alan]);
  });

  test('replaces the entity that has the same id', () => {
    const repository = new Repository<User>();
    repository.save(ada);
    repository.save({ ...ada, age: 37 });
    expect(repository.findAll()).toEqual([{ ...ada, age: 37 }]);
  });

  test('updates some fields of a stored entity', () => {
    const repository = new Repository<User>();
    repository.save(ada);
    expect(repository.update('u1', { role: 'member' })).toEqual({ ...ada, role: 'member' });
    expect(repository.findById('u1')?.role).toBe('member');
  });

  test('refuses to update an unknown id', () => {
    expect(() => new Repository<User>().update('nope', { age: 1 })).toThrow('No entity with id nope');
  });
});
