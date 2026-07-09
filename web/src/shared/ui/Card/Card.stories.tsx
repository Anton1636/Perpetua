import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  argTypes: { elevation: { control: "radio", options: [1, 2, 3] } },
};
export default meta;

type Story = StoryObj<typeof Card>;

const demo = (label: string) => (
  <div style={{ padding: 24, width: 280, color: "var(--c-cream)" }}>{label}</div>
);

export const Elevation1: Story = {
  args: { elevation: 1, children: demo("Elevation 1 — recessed panel") },
};
export const Elevation2: Story = { args: { elevation: 2, children: demo("Elevation 2 — card") } };
export const Elevation3: Story = { args: { elevation: 3, children: demo("Elevation 3 — raised") } };
