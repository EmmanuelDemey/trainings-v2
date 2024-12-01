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
    <PeopleFilter filter={filter} onChange={onChangeFilter} />
    <PeopleTable filter={filter} setId={setId} />
  </>
);

export default Home;
