import type { Meta, StoryObj } from '@storybook/react-vite';
import { PeopleTable } from './PeopleTable';

const meta = {
  component: PeopleTable,
  // TODO 4.1: title 'People/PeopleTable', the 'autodocs' tag, the people of
  // src/data/people.ts and an `onSelect` spy as shared args, and the 'padded'
  // layout — a table needs the room.
  args: {
    people: [],
  },
} satisfies Meta<typeof PeopleTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// TODO 4.2: Default (every person), Empty (nobody), Loading.
export const Default: Story = {};

export const Empty: Story = {};

export const Loading: Story = {};
