import { Title } from "@components/common";
import PeopleFilter from "@components/people-filter";
import PeopleTable from "@components/people-table";
import { Person } from "@model/person";

type HomeType = {
  filter: string;
  onChangeFilter: (e: string) => void;
  data: Person[];
  setId: (id: string) => void;
};

const Home = ({ filter, onChangeFilter, data, setId }: HomeType) => (
  <>
    <Title text="Hello Bulma" />
    <PeopleFilter filter={filter} onChange={onChangeFilter} />
    <PeopleTable data={data} setId={setId} />
  </>
);

export default Home;
