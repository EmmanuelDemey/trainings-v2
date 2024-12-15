import { TextField } from "@mui/material";

type DatepickerType = {
  value: string;
  onChange: (e: any) => void;
  onBlur?: (e: any) => void;
  label?: string;
  errorMessage?: string;
  id: string;
  name: string;
};

const Datepicker = ({
  value,
  onChange,
  label,
  errorMessage = "",
  onBlur,
  id,
  name,
  ...rest
}: DatepickerType) => {
  return (
    <TextField
      fullWidth
      id={id}
      name={name}
      label={label}
      type="date"
      slotProps={{ inputLabel: { shrink: true } }}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={errorMessage !== ""}
      helperText={errorMessage}
      {...rest}
    />
  );
};

export default Datepicker;
