type InputType = {
  value: string;
  onChange: (e: string) => void;
};

const Input = ({ value, onChange }: InputType) => (
  <div className="field">
    <div className="control">
      <input
        className="input is-info"
        type="text"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      />
    </div>
  </div>
);

export default Input;
