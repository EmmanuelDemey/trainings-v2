import { useTranslation } from "react-i18next";
import Create from "@components/create";
import { Title } from "@components/common";

const CreatePage = () => {
  const { t } = useTranslation("create");

  return (
    <>
      <Title text={t("title")} level={3} />
      <Create />
    </>
  );
};

export default CreatePage;
