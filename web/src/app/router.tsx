import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { ActivityDraft } from "@/pages/ActivityDraft/ActivityDraft";
import { Placeholder } from "@/pages/Placeholder/Placeholder";
import { PortfolioDraft } from "@/pages/PortfolioDraft/PortfolioDraft";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <PortfolioDraft /> },
      { path: "activity", element: <ActivityDraft /> },
      { path: "security", element: <Placeholder name="Security" /> },
    ],
  },
]);
