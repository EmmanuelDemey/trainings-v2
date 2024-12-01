import { Input } from "@components/common";
import { useFilter } from "../../context";

const PeopleFilter = () => {
  // uncomment to fire ErrorBoundary
  // throw new Error("");
  const { filter, setFilter } = useFilter();
  return <Input value={filter} onChange={setFilter} />;
};

export default PeopleFilter;
