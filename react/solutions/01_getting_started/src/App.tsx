import { Header } from './components/Header';
import { LikeButton } from './components/LikeButton';

export function App() {
  return (
    <main>
      {/* The title now lives in its own component: App only composes. */}
      <Header title="Star Wars people" subtitle="A React 19 training" />
      <p>Browse the characters of the Star Wars saga, and like your favourites.</p>
      <LikeButton label="Luke Skywalker" />
    </main>
  );
}
