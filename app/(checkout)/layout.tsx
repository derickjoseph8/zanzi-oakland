import Image from "next/image";
import Link from "next/link";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Simple header for checkout flow */}
      <header className="border-b border-white/10 py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-block">
            <div className="relative w-16 h-16">
              <Image
                src="/logo.gif"
                alt="Zanzi Oakland"
                fill
                className="object-contain"
              />
            </div>
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
