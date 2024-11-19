type ButtonType = {
  label: string;
  onClick: () => void;
};

const Button = ({ label, onClick }: ButtonType) => (
  <button type="button" className="button is-warning" onClick={onClick}>
    {label}
  </button>
);

export default Button;
