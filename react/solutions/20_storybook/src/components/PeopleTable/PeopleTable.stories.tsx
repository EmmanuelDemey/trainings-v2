import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { people } from '../../data/people';
import { PeopleTable } from './PeopleTable';

const meta = {
  title: 'People/PeopleTable',
  component: PeopleTable,
  tags: ['autodocs'],
  args: {
    people,
    onSelect: fn(),
  },
  // A table needs the room: override the 'centered' layout of preview.ts.
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PeopleTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { people: [] },
};

export const Loading: Story = {
  args: { loading: true },
};

/** Bonus: a `play` function runs after the story renders — an interaction test you can watch. */
export const SelectingAPerson: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Leia Organa' }));

    await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Leia Organa' }));
  },
};
