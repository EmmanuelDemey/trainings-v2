type TitleProps = {
  text: string;
  level: number;
};

const Title = ({ text, level = 1 }: TitleProps) => {
  if (level === 1) return <h1 className="title">{text}</h1>;
  if (level === 2) return <h2 className="subtitle">{text}</h2>;
  throw new Error(`Unknow title level: ${level}`);
};

export default Title;
