import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  address: z.string().min(5, "Address is required"),
  message: z.string().max(1000).optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3, "Comment must be at least 3 characters").max(2000),
});

export const cartQuantitySchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});
