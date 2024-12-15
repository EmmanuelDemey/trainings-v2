import {
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select as MuiSelect,
} from '@mui/material';

type SelectProps = {
	label: string;
	value: string;
	errorMessage?: string;
	onChange: (e: any) => void;
	onBlur?: (e: any) => void;
	options: Array<{ label: string; value: string }>;
	id: string;
	name: string;
};

const Select = ({
	label,
	errorMessage = '',
	value,
	onChange,
	onBlur,
	options,
	id,
	name,
	...rest
}: SelectProps) => {
	return (
		<FormControl variant="outlined" margin="normal" error={errorMessage !== ''}>
			<InputLabel id={`${id}-label`}>{label}</InputLabel>
			<MuiSelect
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				label={label}
				labelId={`${id}-label`}
				{...rest}
			>
				<MenuItem value="">
					<em>Select</em>
				</MenuItem>
				{options.map(({ label, value }) => (
					<MenuItem key={value} value={value}>
						{label}
					</MenuItem>
				))}
			</MuiSelect>
			{errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
		</FormControl>
	);
};

export default Select;
