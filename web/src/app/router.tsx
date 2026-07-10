import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { Activity } from "@/pages/Activity/Activity";
import { Placeholder } from "@/pages/Placeholder/Placeholder";
import { Portfolio } from "@/pages/Portfolio/Portfolio";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Portfolio /> },
      { path: "activity", element: <Activity /> },
      { path: "security", element: <Placeholder name="Security" /> },
    ],
  },
]);
