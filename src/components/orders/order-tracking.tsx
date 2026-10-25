import { Check, ClipboardList, Package, Truck, CircleCheck, XCircle } from "lucide-react";
import { DELIVERY_STEPS, ORDER_STATUS_COPY, orderDate, type OrderState } from "@/lib/order-status";
const icons = [ClipboardList, Package, Truck, CircleCheck];
export function OrderTracking({ status, events = [], compact = false }: {
  status: OrderState; events?: { status: string; createdAt: Date | string }[]; compact?: boolean;
}) {
  const cancelled = status === "CANCELLED";
  const current = DELIVERY_STEPS.findIndex(step => step.value === status);
  const previousProgress = events.reduce((max, event) => Math.max(max, DELIVERY_STEPS.findIndex(step => step.value === event.status)), 0);
  const progress = cancelled ? previousProgress : current;
  const copy = ORDER_STATUS_COPY[status];
  return <section aria-label="Order tracking" className={compact ? "" : "rounded-2xl border border-border bg-white p-5 sm:p-7"}>
    {!compact && <div className="mb-7 flex items-start gap-3">
      {cancelled && <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />}
      <div><h2 className="text-xl font-semibold">{copy.title}</h2><p className="mt-1 text-sm text-muted-foreground">{copy.description}</p></div>
    </div>}
    {compact && cancelled ? <p className="flex items-center gap-2 text-sm text-red-700"><XCircle className="h-4 w-4" />Order cancelled</p> : <ol className={`grid gap-5 ${compact ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-4"}`}>
      {DELIVERY_STEPS.map((step, index) => {
        const Icon = icons[index];
        const reached = index <= progress;
        const active = !cancelled && index === current;
        const event = [...events].reverse().find(event => event.status === step.value);
        return <li key={step.value} aria-current={active ? "step" : undefined} className="relative flex items-start gap-3 sm:block">
          {index < DELIVERY_STEPS.length - 1 && <div aria-hidden="true" className={`absolute left-10 right-0 top-4 hidden h-0.5 sm:block ${index < progress ? "bg-primary" : "bg-border"}`} />}
          <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${reached ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground"} ${active ? "ring-4 ring-primary/10" : ""}`}>
            {index < progress || status === "COMPLETED" ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
          </span>
          <div className="sm:mt-3"><p className={`text-sm ${reached ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
            {!compact && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event ? orderDate(event.createdAt) : active ? "Current stage" : index < progress ? "Passed" : cancelled ? "Not reached" : "Upcoming"}</p>}
          </div>
        </li>;
      })}
    </ol>}
    {!compact && cancelled && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">Cancelled{events.findLast?.(event => event.status === "CANCELLED") ? " · " + orderDate([...events].reverse().find(event => event.status === "CANCELLED")!.createdAt) : ""}</p>}
  </section>;
}
