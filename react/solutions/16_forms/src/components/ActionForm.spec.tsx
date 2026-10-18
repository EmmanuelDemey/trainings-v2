import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { server } from '../mocks/node';
import { CreatePersonActionForm } from './ActionForm';

async function fillLeia(user: UserEvent, name = 'Leia Organa'): Promise<void> {
  await user.type(screen.getByRole('textbox', { name: 'Name' }), name);
  await user.type(screen.getByRole('spinbutton', { name: 'Height (cm)' }), '150');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Hair color' }), 'brown');
  await user.click(screen.getByRole('radio', { name: 'Female' }));
  await user.type(screen.getByRole('textbox', { name: 'Birth year' }), '19BBY');
}

describe('step 2 — the form action', () => {
  it('creates the person and tells the parent, then empties the form', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    render(<CreatePersonActionForm onCreated={onCreated} />);

    await fillLeia(user);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Leia Organa was created');
    expect(onCreated).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: '5', name: 'Leia Organa', height: 150 }));
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
  });

  it('shows every error and keeps what was typed', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    render(<CreatePersonActionForm onCreated={onCreated} />);

    await user.type(screen.getByRole('spinbutton', { name: 'Height (cm)' }), '300');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Height must be between 0 and 250')).toBeInTheDocument();
    expect(screen.getByText('Pick a hair color')).toBeInTheDocument();
    expect(screen.getByText('Pick a gender')).toBeInTheDocument();
    // React reset the form after the action: the value is back thanks to `defaultValue`.
    expect(screen.getByRole('spinbutton', { name: 'Height (cm)' })).toHaveValue(300);
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('shows the refusal of the server', async () => {
    const user = userEvent.setup();
    render(<CreatePersonActionForm onCreated={vi.fn()} />);

    await fillLeia(user, 'Luke Skywalker');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Luke Skywalker already exists');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Luke Skywalker');
  });

  it('disables the button and says so while the person is being saved', async () => {
    // A server slow enough for the pending state to be seen.
    server.use(
      http.post('/api/people', async () => {
        await delay(200);
        return HttpResponse.json({ id: '5', name: 'Leia Organa', height: 150, hairColor: 'brown', gender: 'female', birthYear: '19BBY' }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    render(<CreatePersonActionForm onCreated={vi.fn()} />);

    await fillLeia(user);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(await screen.findByRole('button', { name: 'Create' })).toBeEnabled();
  });
});
