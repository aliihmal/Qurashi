import type { BadgeProps } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";

export function orderStatusVariant(status: OrderStatus | string | undefined): BadgeProps["variant"] {
  switch (status) {
    case "Delivered":
      return "success";
    case "Shipped":
    case "Processing":
    case "Approved":
      return "gold";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "danger";
    default:
      return "default";
  }
}

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Approved",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
