import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ExampleCard({
  label,
  description,
  href,
  index,
  className,
  screenshot,
}: {
  label: string;
  description: string;
  href: string;
  index: string;
  className?: string;
  screenshot: string;
}) {
  const cdnUrl =
    process.env.NEXT_PUBLIC_BUNNY_CDN_URL ?? "https://mapcn-rn.b-cdn.net";

  return (
    <Link
      href={href}
      className={cn(
        "home-example-card home-reveal group relative min-h-[300px] overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-sm",
        className,
      )}
    >
      <Image
        src={`${cdnUrl}/screenshots/home/${screenshot}`}
        alt={`${label} map example`}
        fill
        sizes="(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-6 p-5 text-white sm:p-7">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            {index}
          </span>
          <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            {label}
          </h3>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-white/65">
            {description}
          </p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:rotate-12 group-hover:bg-white group-hover:text-black">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export function Examples() {
  return (
    <section id="examples" className="scroll-mt-24 py-24 sm:py-32">
      <div className="home-reveal mb-12 grid items-end gap-8 lg:mb-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            Built for real apps
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
            Every map moment,
            <span className="block text-muted-foreground/55">one primitive.</span>
          </h2>
        </div>
        <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground lg:justify-self-end lg:text-lg">
          Move from analytics to turn-by-turn routes, nearby places, and live
          location without rebuilding your map foundation. Use the examples as
          they are, or make every detail your own.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[240px]">
        <ExampleCard
          label="Analytics"
          description="Layer location data without losing the map underneath."
          href="/docs/markers"
          index="01 / Layers"
          className="lg:col-span-7 lg:row-span-2"
          screenshot="analytics.png"
        />
        <ExampleCard
          label="Delivery"
          description="Routes, markers, and contextual stops in one surface."
          href="/docs/routes"
          index="02 / Routes"
          className="lg:col-span-5 lg:row-span-2"
          screenshot="delivery.png"
        />
        <ExampleCard
          label="Trending"
          description="Make changing location data instantly legible."
          href="/docs/markers"
          index="03 / Data"
          className="lg:col-span-4 lg:row-span-2"
          screenshot="trending.png"
        />
        <ExampleCard
          label="EV Charging"
          description="Turn nearby places into clear, tappable choices."
          href="/docs/popups"
          index="04 / Places"
          className="lg:col-span-4 lg:row-span-2"
          screenshot="ev-charging.png"
        />
        <ExampleCard
          label="Locate Me"
          description="User location and camera controls that feel native."
          href="/docs/controls"
          index="05 / Location"
          className="lg:col-span-4 lg:row-span-2"
          screenshot="locate-me.png"
        />
      </div>

      <div className="home-install-cta home-reveal relative mt-24 overflow-hidden rounded-[2rem] border border-foreground/15 bg-foreground px-7 py-12 text-background shadow-[0_32px_90px_-48px_rgba(14,165,233,0.7)] sm:px-12 sm:py-16">
        <div className="home-cta-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-background/70">
              Your map starts here
            </p>
            <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-6xl">
              From install to first marker in minutes.
            </h2>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 shrink-0 rounded-full bg-background px-6 text-foreground shadow-xl ring-1 ring-background/20 hover:bg-background/90"
          >
            <Link href="/docs/installation">
              Read the installation guide <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
