import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { storedPeople } from '../mocks/handlers';
import { server } from '../mocks/node';
import { CreatePersonHookForm } from './HookForm';

async function fillLeia(user: UserEvent, name = 'Leia Organa'): Promise<void> {
  await user.type(screen.getByRole('textbox', { name: 'Name' }), name);
  await user.type(screen.getByRole('spinbutton', { name: 'Height (cm)' }), '150');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Hair color' }), 'brown');
  await user.click(screen.getByRole('radio', { name: 'Female' }));
  await user.type(screen.getByRole('textbox', { name: 'Birth year' }), '19BBY');
}

describe('step 3 — React Hook Form + Zod', () => {
  it('creates the person, tells the parent, then empties the form', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    render(<CreatePersonHookForm onCreated={onCreated} />);

    await fillLeia(user);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: '5', name: 'Leia Organa', height: 150 }));
    expect(storedPeople().at(-1)).toMatchObject({ name: 'Leia Organa', height: 150 });
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
  });

  it('says nothing while a field is typed for the first time, and validates it when left', async () => {
    const user = userEvent.setup();
    render(<CreatePersonHookForm onCreated={vi.fn()} />);

    await user.type(screen.getByRole('spinbutton', { name: 'Height (cm)' }), '3000');
    expect(screen.queryByText('Height must be between 0 and 250')).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByText('Height must be between 0 and 250')).toBeInTheDocument();
  });

  it('shows every error on submit, sends nothing, and moves the focus to the first invalid field', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    render(<CreatePersonHookForm onCreated={onCreated} />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Height must be a number')).toBeInTheDocument();
    expect(screen.getByText('Pick a hair color')).toBeInTheDocument();
    expect(screen.getByText('Pick a gender')).toBeInTheDocument();
    expect(screen.getByText('Use the galactic calendar, e.g. 19BBY')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    expect(onCreated).not.toHaveBeenCalled();
    expect(storedPeople()).toHaveLength(4);
  });

  it('wires each error to its field', async () => {
    const user = userEvent.setup();
    render(<CreatePersonHookForm onCreated={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    const name = await screen.findByRole('textbox', { name: 'Name' });
    await vi.waitFor(() => expect(name).toBeInvalid());
    expect(name).toHaveAccessibleDescription('Name is required');
  });

  it('shows the refusal of the server on the name field', async () => {
    const user = userEvent.setup();
    render(<CreatePersonHookForm onCreated={vi.fn()} />);

    await fillLeia(user, 'Luke Skywalker');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Luke Skywalker already exists')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Luke Skywalker');
  });

  it('disables the button and says so while the person is being saved', async () => {
    server.use(
      http.post('/api/people', async () => {
        await delay(200);
        return HttpResponse.json({ id: '5', name: 'Leia Organa', height: 150, hairColor: 'brown', gender: 'female', birthYear: '19BBY' }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    render(<CreatePersonHookForm onCreated={vi.fn()} />);

    await fillLeia(user);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(await screen.findByRole('button', { name: 'Create' })).toBeEnabled();
  });
});
