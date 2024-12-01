import { useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Title } from "@components/common";
import PeopleFilter from "@components/people-filter";
import PeopleTable from "@components/people-table";
import { useLikes } from "../context";

type HomeType = {
  setId: (id: string) => void;
};

const Home = ({ setId }: HomeType) => {
  const { likes } = useLikes();

  const countLikes = useMemo(
    () => Object.values(likes).filter((l) => l === 1).length,
    [likes],
  );
  const subTitle = `Vous aimez ${countLikes} personnage${countLikes > 1 ? "s" : ""}`;

  return (
    <>
      <Title text="Hello Bulma" />
      <Title text={subTitle} level={2} />
      <ErrorBoundary
        fallback={<div>Something went wrong with search field</div>}
      >
        <PeopleFilter />
      </ErrorBoundary>
      <PeopleTable setId={setId} />
    </>
  );
};

export default Home;
