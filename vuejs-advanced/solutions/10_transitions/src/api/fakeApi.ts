export interface Release {
  id: string;
  title: string;
  status: 'shipped' | 'in-progress' | 'idea';
  votes: number;
}

let nextId = 100;

export function loadReleases(): Release[] {
  return [
    { id: 'r1', title: 'Typed route params', status: 'shipped', votes: 34 },
    { id: 'r2', title: 'Offline draft recovery', status: 'in-progress', votes: 51 },
    { id: 'r3', title: 'Bulk invoice export', status: 'shipped', votes: 12 },
    { id: 'r4', title: 'Dark mode on the print view', status: 'idea', votes: 7 },
    { id: 'r5', title: 'Webhook replay', status: 'in-progress', votes: 28 },
  ];
}

export function draftRelease(title: string): Release {
  nextId += 1;
  return { id: `r${nextId}`, title, status: 'idea', votes: 0 };
}
