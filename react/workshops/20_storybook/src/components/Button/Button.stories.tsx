import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

// TODO 2.1: complete the meta — a `title` ('UI/Button'), the 'autodocs' tag,
// the `args` every story starts from (children 'Save', and an `onClick` spy made
// with `fn()` from 'storybook/test'), and `argTypes` for `variant` and `size`.
const meta = {
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// TODO 2.2: give each story the args that make it what its name says. The
// README lists the label each one must show.
export const Primary: Story = {};

export const Secondary: Story = {};

export const Danger: Story = {};

export const Disabled: Story = {};

export const Small: Story = {};
