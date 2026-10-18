type PeopleFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PeopleFilter({ value, onChange }: PeopleFilterProps) {
  // TODO 3.1: render an <Input> labelled "Filter by name", hint "Case does not
  //           matter.", type "search", showing `value`.
  // TODO 3.2: call `onChange` with the NEW VALUE (a string), not the event.
  return null;
}
