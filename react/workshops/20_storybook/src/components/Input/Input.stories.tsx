import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  component: Input,
  // TODO 3.1: `label` is a required prop, so the meta has to give it — make it
  // 'Name', with the placeholder 'Luke Skywalker'. Add the title 'UI/Input',
  // the 'autodocs' tag, and `argTypes` for `type` and `error`.
  args: {
    label: '',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// TODO 3.2: one state per story — see the README.
export const Default: Story = {};

export const Filled: Story = {};

export const WithError: Story = {};

export const Disabled: Story = {};
