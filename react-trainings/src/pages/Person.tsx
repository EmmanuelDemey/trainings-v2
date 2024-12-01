import { Title } from "@components/common";
import Person from "@components/person";

type PersonPageType = {
  id: string;
  backHome: () => void;
};

const PersonPage = ({ id, backHome }: PersonPageType) => (
  <>
    <Title text="Personnage" />
    <Person id={id} backHome={backHome} />
  </>
);

export default PersonPage;
