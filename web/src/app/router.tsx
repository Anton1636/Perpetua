import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { ActivityDraft } from "@/pages/ActivityDraft/ActivityDraft";
import { Placeholder } from "@/pages/Placeholder/Placeholder";
import { Portfolio } from "@/pages/Portfolio/Portfolio";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Portfolio /> },
      { path: "activity", element: <ActivityDraft /> },
      { path: "security", element: <Placeholder name="Security" /> },
    ],
  },
]);
