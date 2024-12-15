import { TextField, TextFieldProps, useTheme } from '@mui/material';
import React from 'react';

type InputType = {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
	label?: string;
	placeholder?: string;
	errorMessage?: string;
	type?: 'text' | 'number';
};

const Input: React.FC<InputType & TextFieldProps> = ({
	value,
	onChange,
	label,
	placeholder,
	errorMessage = '',
	onBlur,
	type = 'text',
	...rest
}) => {
	const theme = useTheme();

	return (
		<TextField
			type={type}
			variant="outlined"
			label={label}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			error={Boolean(errorMessage)}
			helperText={errorMessage}
			sx={{
				marginBottom: theme.spacing(2),
				'& .MuiFormHelperText-root': {
					color: theme.palette.error.main,
				},
			}}
			{...rest}
		/>
	);
};

export default Input;
