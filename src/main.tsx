import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import "./index.css";
import { WeatherProvider } from "./lib/weather";
import { Layout } from "./components/Layout";
import { Today } from "./pages/Today";
import { Trip } from "./pages/Trip";
import { DayPage } from "./pages/DayPage";
import { MapPage } from "./pages/MapPage";

const LegacyDay = () => <Navigate to={`/trip/day/${useParams().n}`} replace />;

// Data router (hash-based) so <Link viewTransition> and <ScrollRestoration> work; HashRouter ignores both.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: "today", element: <Today /> },
      { path: "trip", element: <Trip /> },
      { path: "trip/day/:n", element: <DayPage /> },
      { path: "map", element: <MapPage /> },
      { path: "day/:n", element: <LegacyDay /> },
      { path: "*", element: <Navigate to="/today" replace /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WeatherProvider>
      <RouterProvider router={router} />
    </WeatherProvider>
  </StrictMode>,
);
