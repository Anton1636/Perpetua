import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { ActivityDraft } from "@/pages/ActivityDraft/ActivityDraft";
import { Placeholder } from "@/pages/Placeholder/Placeholder";

// Minimal router. Portfolio + Security are placeholders until Days 6 & 9;
// the plan keeps this light (one rich screen), but routing gives us deep links
// and a real 404 later.
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Placeholder name="Portfolio" /> },
      { path: "activity", element: <ActivityDraft /> },
      { path: "security", element: <Placeholder name="Security" /> },
    ],
  },
]);
