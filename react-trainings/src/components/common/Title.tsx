type TitleProps = {
  text: string;
};

const Title = ({ text }: TitleProps) => <h1 className="title">{text}</h1>;

export default Title;
