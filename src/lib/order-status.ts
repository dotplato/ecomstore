export const ORDER_STATUS_VALUES = ["PLACED", "PROCESSING", "IN_TRANSIT", "COMPLETED", "CANCELLED"] as const;
export type OrderState = typeof ORDER_STATUS_VALUES[number];
export const ORDER_STATUS_OPTIONS = [
  { value: "PLACED", label: "Placed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "IN_TRANSIT", label: "In transit" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];
export const DELIVERY_STEPS = ORDER_STATUS_OPTIONS.filter(option => option.value !== "CANCELLED");
export const ORDER_STATUS_COPY: Record<OrderState, { title: string; description: string }> = {
  PLACED: { title: "We’ve received your order", description: "Your order is placed and waiting to be prepared." },
  PROCESSING: { title: "Your order is being prepared", description: "We’re getting your items ready for dispatch." },
  IN_TRANSIT: { title: "Your order is on its way", description: "Your order has been dispatched and is in transit." },
  COMPLETED: { title: "Your order is complete", description: "Thank you for shopping with E Seller Store." },
  CANCELLED: { title: "This order was cancelled", description: "This order will not progress to delivery." },
};
export function orderStatusLabel(status: string) {
  return ORDER_STATUS_OPTIONS.find(option => option.value === status)?.label ?? status;
}
export function orderDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi",
  }).format(new Date(date)) + " PKT";
}
