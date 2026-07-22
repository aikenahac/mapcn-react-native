import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-border/40 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <span>
          Built by{" "}
          <a
            href="https://aiken.si"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            Aiken
          </a>
        </span>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/aikenahac/mapcn-react-native"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/docs"
            className="hover:text-foreground transition-colors"
          >
            Docs
          </Link>
        </div>
      </div>
    </footer>
  );
}
