import { LikeButton } from './components/LikeButton';

// TODO 2.1: make the level-1 title read "Star Wars people".
// TODO 2.2: replace the Vite welcome paragraph with a short introduction that
//           starts with "Browse the characters of the Star Wars saga".
// TODO 3.2: render the title through <Header /> instead of an inline <h1>.
export function App() {
  return (
    <main>
      <h1>Vite + React</h1>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR.
      </p>
      <LikeButton label="Luke Skywalker" />
    </main>
  );
}
