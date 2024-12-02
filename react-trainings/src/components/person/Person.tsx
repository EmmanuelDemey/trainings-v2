import { useNavigate } from "react-router-dom";
import { Button } from "@components/common";
import { Person as PersonType } from "@model/person";

type PersonComponentType = {
  person: PersonType | null;
};

const Person = ({ person }: PersonComponentType) => {
  const navigate = useNavigate();

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
      <Button
        label="Home"
        onClick={() => {
          navigate("/");
        }}
      />
    </>
  );
};

export default Person;
