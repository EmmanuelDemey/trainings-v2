export function Title({ children }: { children: string }) {
  // TODO 4.1: build it with `styled('h1')` (from '@mui/material/styles'): spread
  //           `theme.typography.h1`, colour `theme.palette.primary.main`,
  //           `marginTop: 0`, `marginBottom: theme.spacing(3)`.
  return <h1 className="title">{children}</h1>;
}
