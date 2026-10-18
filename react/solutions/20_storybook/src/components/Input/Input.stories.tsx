import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  // `label` is required by the component: giving it here makes it optional in
  // every story below.
  args: {
    label: 'Name',
    placeholder: 'Luke Skywalker',
  },
  argTypes: {
    type: { control: 'select', options: ['text', 'number', 'email'] },
    error: { control: 'text' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  // `defaultValue`, not `value`: the story stays typeable in the canvas.
  args: { defaultValue: 'Leia Organa' },
};

export const WithError: Story = {
  args: { error: 'Name is required' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Darth Vader' },
};
