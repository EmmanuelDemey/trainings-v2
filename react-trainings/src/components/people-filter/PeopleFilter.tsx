import { Input } from "../common";

type PeopleFilterProps = {
  filter: string;
  onChange: (e: string) => void;
};

const PeopleFilter = ({ filter, onChange }: PeopleFilterProps) => (
  <Input value={filter} onChange={onChange} />
);

export default PeopleFilter;
