type ErrorType = {
  text: string;
};

const Error = ({ text }: ErrorType) => <p className="block">{text}</p>;

export default Error;
