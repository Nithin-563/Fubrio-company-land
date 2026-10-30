import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground">
      <div className="max-w-md w-full text-center">
        <div className="font-display text-8xl font-bold text-[var(--fubrio-accent)] mb-4">404</div>
        <h1 className="font-display text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Back to Fubrio
        </Link>
      </div>
    </div>
  );
}
