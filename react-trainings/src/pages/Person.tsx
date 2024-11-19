import { Button, Title } from "../components/common";
import { Person as PersonType } from "../model/person";

type PersonComponentType = {
  person: PersonType | undefined;
  backHome: () => void;
};

const Person = ({ person, backHome }: PersonComponentType) => (
  <>
    <Title text="Personnage" />
    {person && (
      <ul>
        {Object.entries(person).map(([k, v]) => (
          <li key={k}>{`${k} : ${v}`}</li>
        ))}
      </ul>
    )}
    {!person && <div>{"Bad id"}</div>}
    <Button label="Home" onClick={backHome} />
  </>
);

export default Person;
