import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { Activity } from "@/pages/Activity/Activity";
import { Portfolio } from "@/pages/Portfolio/Portfolio";
import { Security } from "@/pages/Security/Security";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Portfolio /> },
      { path: "activity", element: <Activity /> },
      { path: "security", element: <Security /> },
    ],
  },
]);
