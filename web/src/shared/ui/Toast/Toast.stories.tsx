import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastProvider, useToast } from "./ToastProvider";
import { Button } from "../Button/Button";

const meta: Meta = {
  title: "UI/Toast",
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;

function Demo() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Button
        size="sm"
        onClick={() => toast({ kind: "success", title: "Confirmed", desc: "Staked $5,000" })}
      >
        Success
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => toast({ kind: "pending", title: "Transaction pending" })}
      >
        Pending
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => toast({ kind: "warning", title: "Wrong network" })}
      >
        Warning
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => toast({ kind: "error", title: "Transaction failed" })}
      >
        Error
      </Button>
    </div>
  );
}

type Story = StoryObj;
export const Playground: Story = { render: () => <Demo /> };
