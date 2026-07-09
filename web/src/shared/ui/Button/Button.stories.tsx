import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: { children: "Stake" },
  argTypes: {
    variant: { control: "select", options: ["primary", "ghost", "danger"] },
    size: { control: "radio", options: ["sm", "md"] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Cancel" } };
export const Danger: Story = { args: { variant: "danger", children: "Revoke" } };
export const Small: Story = { args: { variant: "ghost", size: "sm", children: "Filter" } };
export const Disabled: Story = { args: { disabled: true, children: "Stake" } };
