import { useTranslation } from "react-i18next";
import { Title } from "@components/common";
import Person from "@components/person";

const PersonPage = () => {
  const { t } = useTranslation("person");
  return (
    <>
      <Title text={t("title")} />
      <Person />
    </>
  );
};

export default PersonPage;
