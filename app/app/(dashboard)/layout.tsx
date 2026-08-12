import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        <strong>Almsby</strong>
                <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/products">Products</Link>
          <Link href="/settings">Settings</Link>
          <form action={signOutAction}>
            <button
              type="submit"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}