import { Input } from './Input';

type PeopleFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

// A CONTROLLED component: it owns no state. The parent gives the value and is
// told about every change — so the parent can use the value elsewhere (here,
// to filter the table that lives next to this component).
export function PeopleFilter({ value, onChange }: PeopleFilterProps) {
  return (
    <Input
      label="Filter by name"
      hint="Case does not matter."
      type="search"
      placeholder="Luke…"
      value={value}
      // The component's API speaks the domain ("the new value"), not the DOM
      // (a ChangeEvent): callers do not need to know there is an <input>.
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
