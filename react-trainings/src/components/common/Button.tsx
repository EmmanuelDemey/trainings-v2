type ButtonType = {
  label: string;
  onClick?: (() => void) | React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

const Button = ({ label, onClick, disabled, type = "button" }: ButtonType) => (
  <button
    type={type}
    className={`button is-warning ${disabled ? "is-disabled" : ""}`}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

export default Button;
