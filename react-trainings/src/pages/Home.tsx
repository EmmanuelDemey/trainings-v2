import { ErrorBoundary } from "react-error-boundary";
import { Title } from "@components/common";
import PeopleFilter from "@components/people-filter";
import PeopleTable from "@components/people-table";

type HomeType = {
  filter: string;
  onChangeFilter: (e: string) => void;
  setId: (id: string) => void;
};

const Home = ({ filter, onChangeFilter, setId }: HomeType) => (
  <>
    <Title text="Hello Bulma" />
    <ErrorBoundary fallback={<div>Something went wrong with search field</div>}>
      <PeopleFilter filter={filter} onChange={onChangeFilter} />
    </ErrorBoundary>
    <PeopleTable filter={filter} setId={setId} />
  </>
);

export default Home;
