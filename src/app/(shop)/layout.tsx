import { Header } from "@/components/layout/header";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="mt-auto border-t border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} E Seller Store. All rights reserved.</p>
          <p>No payment processing — demo checkout only.</p>
        </div>
      </footer>
    </>
  );
}
