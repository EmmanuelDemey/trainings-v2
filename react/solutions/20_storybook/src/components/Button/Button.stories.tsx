import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

/**
 * The default export — the "meta" — describes the component once: where it
 * sits in the sidebar, the args every story starts from, how the controls look.
 */
const meta = {
  title: 'UI/Button',
  component: Button,
  // One generated docs page, built from the props' types and these stories.
  tags: ['autodocs'],
  args: {
    children: 'Save',
    // A spy: clicks show up in the Actions panel, and tests can assert on it.
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'danger'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
// `typeof meta`, not `typeof Button`: the args already given by the meta become
// optional in each story, and those still missing stay required.
type Story = StoryObj<typeof meta>;

// CSF3: a story is an object. Only what differs from the meta is written.
export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancel' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Small: Story = {
  args: { size: 'small' },
};
