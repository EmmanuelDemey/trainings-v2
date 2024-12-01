type ErrorType = {
  text: string;
};

const Error = ({ text }: ErrorType) => (
  <>
    <div className="icon-text">
      <span className="icon has-text-danger">
        <i className="fas fa-ban"></i>
      </span>
      <span>Loading error:</span>
    </div>
    <p className="block">{text}</p>
  </>
);

export default Error;
