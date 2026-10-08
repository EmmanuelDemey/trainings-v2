import { loadConfig } from './config';

// `npm start` — try it with a broken environment:
//   DATABASE_URL=mysql://db PORT=99999 npm start
//   DATABASE_URL=postgres://localhost/gigs FEATURE_NEW_CHECKOUT=yes npm start

try {
  const config = loadConfig(process.env);
  console.log('Starting with', config);
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
