import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckCircle2 } from "lucide-react";
import { Pill } from "./Pill";

const meta: Meta<typeof Pill> = {
  title: "UI/Pill",
  component: Pill,
  argTypes: { tone: { control: "select", options: ["lume", "red", "amber", "neutral"] } },
};
export default meta;

type Story = StoryObj<typeof Pill>;

export const Success: Story = {
  args: {
    tone: "lume",
    children: (
      <>
        <CheckCircle2 size={13} /> Success
      </>
    ),
  },
};
export const Failed: Story = { args: { tone: "red", children: "Failed" } };
export const Pending: Story = { args: { tone: "amber", children: "Queued" } };
export const Neutral: Story = { args: { tone: "neutral", children: "Sepolia" } };
