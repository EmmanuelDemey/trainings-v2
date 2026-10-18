// Runtime configuration — EMPTY on purpose.
//
// In `npm run dev` and in `npm run preview`, this file is served as is: nothing
// is overridden, and `getConfig()` falls back to the VITE_ variables of `.env`.
//
// In the container, `docker/40-env-js.sh` overwrites it at startup with the
// values of the container's environment variables. Same image, any environment.
window.__ENV__ = {};
