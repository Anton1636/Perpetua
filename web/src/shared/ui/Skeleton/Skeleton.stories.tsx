import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Line: Story = { args: { width: 240, height: 16 } };
export const Block: Story = { args: { width: 280, height: 90, radius: 12 } };
export const Circle: Story = { args: { width: 44, height: 44, radius: 999 } };

export const CardLoading: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 280 }}>
      <Skeleton width={120} height={14} />
      <Skeleton height={40} />
      <Skeleton width={180} height={14} />
    </div>
  ),
};
