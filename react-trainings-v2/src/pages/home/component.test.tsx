import { describe, expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './component';

describe('Home', () => {
	beforeEach(() => {
		render(<Home />);
	});

	test('should check title', () => {
		expect(
			screen.getByRole('heading', { level: 1, name: 'Hello World' })
		).toBeDefined();
	});

	test('check h2 content', () => {
		expect(screen.getByRole('heading', { level: 2 }).textContent).toEqual(
			'Count'
		);
	});
});
