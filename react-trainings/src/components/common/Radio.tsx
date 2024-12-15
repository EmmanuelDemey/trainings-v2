import {
	FormControl,
	FormControlLabel,
	FormHelperText,
	FormLabel,
	Radio,
	RadioGroup,
} from '@mui/material';

type RadioProps = {
	label: string;
	value: string;
	errorMessage?: string;
	onChange: (e: any) => void;
	onBlur?: (e: any) => void;
	options: Array<{ label: string; value: string }>;
	id: string;
	name: string;
	direction?: 'row' | 'column';
};

const RadioGroupComponent = ({
	label,
	errorMessage = '',
	value,
	onChange,
	onBlur,
	options,
	id,
	name,
	direction = 'row',
	...rest
}: RadioProps) => {
	return (
		<FormControl
			component="fieldset"
			error={errorMessage !== ''}
			margin="normal"
		>
			<FormLabel component="legend" id={`${id}-label`}>
				{label}
			</FormLabel>
			<RadioGroup
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				row={direction === 'row'}
				{...rest}
			>
				{options.map(({ label, value }) => (
					<FormControlLabel
						key={value}
						value={value}
						control={<Radio />}
						label={label}
					/>
				))}
			</RadioGroup>
			{errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
		</FormControl>
	);
};

export default RadioGroupComponent;
