import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Home } from "@pages/index";
import NotFound from "./components/not-found";
import { Loader } from "./components/common";
const Person = lazy(() => import("@pages/person"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <NotFound />,
  },
  {
    path: "/person/:id",
    element: (
      <Suspense fallback={<Loader />}>
        <Person />
      </Suspense>
    ),
  },
]);
