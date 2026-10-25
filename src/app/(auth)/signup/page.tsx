import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Create account</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Join E Seller Store to shop, wishlist, and checkout.
      </p>
      <SignupForm />
    </div>
  );
}
