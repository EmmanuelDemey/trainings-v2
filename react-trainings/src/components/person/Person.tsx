import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@components/common";
import { Person as PersonType } from "@model/person";

type PersonComponentType = {
  person: PersonType | null;
};

const Person = ({ person }: PersonComponentType) => {
  const navigate = useNavigate();

  const { t } = useTranslation("person");

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
      {!person && <div>{t("badId")}</div>}
      <Button
        label={t("backHome")}
        onClick={() => {
          navigate("/");
        }}
      />
    </>
  );
};

export default Person;
