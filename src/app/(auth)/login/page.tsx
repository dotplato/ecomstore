import { LoginForm } from "@/components/auth/login-form";

type SearchParams = Promise<{ callbackUrl?: string }>;

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Sign in to add items to your cart and checkout.
      </p>
      <LoginForm callbackUrl={callbackUrl ?? "/"} />
      <p className="mt-6 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
        Demo: <span className="font-medium text-foreground">demo@eseller.com</span> /{" "}
        <span className="font-medium text-foreground">password123</span>
      </p>
    </div>
  );
}
