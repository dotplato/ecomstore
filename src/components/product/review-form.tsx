"use client";

import { useActionState } from "react";
import { createReviewAction, type ReviewResult } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initial: ReviewResult | null = null;

export function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(
    createReviewAction,
    initial,
  );

  return (
    <form action={formAction} className="mb-6 max-w-lg space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <div>
        <label htmlFor="rating" className="mb-1 block text-sm font-medium">
          Rating
        </label>
        <select
          id="rating"
          name="rating"
          defaultValue="5"
          className="h-10 rounded-full border border-border bg-white px-3 text-sm"
          required
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="comment" className="mb-1 block text-sm font-medium">
          Comment
        </label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="Share your experience..."
          required
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && (
        <p className="text-sm text-green-700">Thanks for your review!</p>
      )}
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
