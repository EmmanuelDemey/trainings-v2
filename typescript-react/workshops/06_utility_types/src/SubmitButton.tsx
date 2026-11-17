// A <button> that always submits its form: it takes every prop of a button but `type`.
//
// TODO 6: type the props with the right DTO, and make it a submit button.

export function SubmitButton(props: any) {
  return <button {...props} />;
}
