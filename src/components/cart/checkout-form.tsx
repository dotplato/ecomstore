"use client";

import { useActionState } from "react";
import {
  placeOrderAction,
  type CheckoutResult,
} from "@/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initial: CheckoutResult | null = null;

export function CheckoutForm({ defaultName }: { defaultName?: string | null }) {
  const [state, formAction, pending] = useActionState(
    placeOrderAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="customerName" className="mb-1 block text-sm font-medium">
          Full name
        </label>
        <Input
          id="customerName"
          name="customerName"
          defaultValue={defaultName ?? ""}
          required
          className="rounded-xl"
        />
      </div>
      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium">
          Shipping address
        </label>
        <Textarea id="address" name="address" required placeholder="Street, city, ZIP" />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message (optional)
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder="Delivery notes or gift message"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}
