import { describe, expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
	beforeEach(() => {
		render(<App />);
	});

	test('should check title', () => {
		expect(
			screen.getByRole('heading', { level: 1, name: 'Hello World' })
		).toBeDefined();
	});

	test('check p content', () => {
		expect(screen.getByRole('paragraph').textContent).toContain('Bulma');
	});
});
