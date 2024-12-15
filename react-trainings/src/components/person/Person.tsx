import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Title } from "@components/common";
import { Person as PersonType } from "@model/person";

type PersonComponentType = {
  person: PersonType | null;
};

const Person = ({ person }: PersonComponentType) => {
  const navigate = useNavigate();

  const { t } = useTranslation("person");

  if (!person) return null;

  const { name, ...rest } = person;

  return (
    <>
      <Title text={name} level={4} />
      {person && (
        <ul>
          {Object.entries(rest).map(([k, v]) => (
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
