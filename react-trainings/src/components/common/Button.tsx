import { Button as MuiButton, useTheme } from '@mui/material';
import React from 'react';

type ButtonType = {
	label: string;
	onClick?: (() => void) | React.MouseEventHandler<HTMLButtonElement>;
	disabled?: boolean;
	type?: 'button' | 'submit' | 'reset';
};

const Button: React.FC<ButtonType> = ({
	label,
	onClick,
	disabled,
	type = 'button',
}) => {
	const theme = useTheme();

	return (
		<MuiButton
			variant="contained"
			color="primary"
			onClick={onClick}
			disabled={disabled}
			type={type}
			sx={{
				textTransform: 'none',
				fontSize: theme.typography.button.fontSize,
				padding: theme.spacing(1, 3),
				margin: theme.spacing(0.2),
				flex: '1 1 45%',
				'&.Mui-disabled': {
					backgroundColor: theme.palette.grey[400],
					color: theme.palette.text.disabled,
				},
			}}
		>
			{label}
		</MuiButton>
	);
};

export default Button;
