import { Button } from "@components/common";
import { Person as PersonType } from "@model/person";

type PersonComponentType = {
  person: PersonType | null;
  backHome: () => void;
};

const Person = ({ backHome, person }: PersonComponentType) => {
  if (!person) return null;
  return (
    <>
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
};

export default Person;
