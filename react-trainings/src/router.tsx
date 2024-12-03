import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { HomePage, CreatePage } from "@pages/index";
import NotFound from "./components/not-found";
import { Loader } from "./components/common";
const Person = lazy(() => import("@pages/Person"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
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
  {
    path: "/person/create",
    element: <CreatePage />,
  },
]);
