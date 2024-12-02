import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "react-error-boundary";
import { Title } from "@components/common";
import PeopleFilter from "@components/people-filter";
import PeopleTable from "@components/people-table";
import { useLikes } from "../context";

const Home = () => {
  const { likes } = useLikes();

  const { t } = useTranslation("home");

  const likeNb = useMemo(
    () => Object.values(likes).filter((l) => l === 1).length,
    [likes],
  );

  return (
    <>
      <Title text={t("title")} />
      <Title text={t("count", { likeNb })} level={2} />
      <ErrorBoundary fallback={<div>{t("filterErrorMessage")}</div>}>
        <PeopleFilter />
      </ErrorBoundary>
      <PeopleTable />
    </>
  );
};

export default Home;
