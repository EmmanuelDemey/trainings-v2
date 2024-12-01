import { Input } from "@components/common";

type PeopleFilterProps = {
  filter: string;
  onChange: (e: string) => void;
};

const PeopleFilter = ({ filter, onChange }: PeopleFilterProps) => {
  // uncomment to fire ErrorBoundary
  // throw new Error("");
  return <Input value={filter} onChange={onChange} />;
};

export default PeopleFilter;
