import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PersonCard } from './PersonCard';
import styles from './PersonCard.module.scss';
import { people } from '../data/people';
import { classOf } from '../tests/classOf';

const luke = people.find(({ name }) => name === 'Luke Skywalker')!;
const r2d2 = people.find(({ name }) => name === 'R2-D2')!;

describe('PersonCard', () => {
  it('is an article named after the person, with the card class from the Sass module', () => {
    render(<PersonCard person={luke} maxHeight={202} />);

    expect(screen.getByRole('article', { name: 'Luke Skywalker' })).toHaveClass(classOf(styles, 'card'));
  });

  it('shows the formatted height and mass', () => {
    render(<PersonCard person={luke} maxHeight={202} />);

    const card = screen.getByRole('article', { name: 'Luke Skywalker' });
    expect(card).toHaveTextContent('1.72 m');
    expect(card).toHaveTextContent('77 kg');
  });

  it('exposes the gender as a data attribute', () => {
    render(<PersonCard person={luke} maxHeight={202} />);

    expect(screen.getByRole('article', { name: 'Luke Skywalker' })).toHaveAttribute('data-gender', 'male');
  });

  it('adds the droid class to droids only', () => {
    render(
      <>
        <PersonCard person={luke} maxHeight={202} />
        <PersonCard person={r2d2} maxHeight={202} />
      </>,
    );

    const droid = classOf(styles, 'droid');
    expect(screen.getByRole('article', { name: 'R2-D2' })).toHaveClass(classOf(styles, 'card'), droid);
    expect(screen.getByRole('article', { name: 'Luke Skywalker' })).not.toHaveClass(droid);
  });

  it('draws the height bar against the given maximum', () => {
    render(<PersonCard person={r2d2} maxHeight={192} />);

    expect(screen.getByRole('meter', { name: 'Height' })).toHaveStyle({ width: '50%' });
  });
});
