type ButtonType = {
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

const Button = ({ label, onClick, disabled }: ButtonType) => (
  <button
    type="button"
    className="button is-warning"
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

export default Button;
