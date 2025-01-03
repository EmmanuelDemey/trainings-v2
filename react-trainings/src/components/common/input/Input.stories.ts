import type { Meta, StoryObj } from '@storybook/react';

import Input from './';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: 'Input',
	component: Input,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {
		label: { control: 'text' },
		placeholder: { control: 'text' },
		errorMessage: { control: 'text' },
		type: { control: 'select', options: ['text', 'number'] },
	},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Text: Story = {
	args: {
		value: '',
		onChange: () => {},
		label: 'Textfield',
		placeholder: 'My placholder',
		type: 'text',
	},
};

export const Number: Story = {
	args: {
		value: '',
		onChange: () => {},
		type: 'number',
	},
};
