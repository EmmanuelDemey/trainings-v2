import { ErrorBoundary } from "react-error-boundary";
import { Title } from "@components/common";
import PeopleFilter from "@components/people-filter";
import PeopleTable from "@components/people-table";

type HomeType = {
  setId: (id: string) => void;
};

const Home = ({ setId }: HomeType) => (
  <>
    <Title text="Hello Bulma" />
    <ErrorBoundary fallback={<div>Something went wrong with search field</div>}>
      <PeopleFilter />
    </ErrorBoundary>
    <PeopleTable setId={setId} />
  </>
);

export default Home;
