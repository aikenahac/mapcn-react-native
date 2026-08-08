"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Copy, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type PointerEvent, useState } from "react";

const installCommand = "npx mapcn-rn init";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={copied ? "Command copied" : "Copy install command"}
    >
      {copied ? (
        <Check className="size-4 text-emerald-500" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  );
}

export function Hero() {
  const cdnUrl =
    process.env.NEXT_PUBLIC_BUNNY_CDN_URL ?? "https://mapcn-rn.b-cdn.net";

  const moveStage = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    event.currentTarget.style.setProperty("--stage-x", `${x * 10}deg`);
    event.currentTarget.style.setProperty("--stage-y", `${y * -8}deg`);
    event.currentTarget.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
  };

  const resetStage = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--stage-x", "0deg");
    event.currentTarget.style.setProperty("--stage-y", "0deg");
    event.currentTarget.style.setProperty("--glow-x", "50%");
    event.currentTarget.style.setProperty("--glow-y", "45%");
  };

  return (
    <section className="home-hero grid min-h-[calc(100svh-4.5rem)] items-center gap-14 py-16 lg:grid-cols-[minmax(0,0.88fr)_minmax(480px,1.12fr)] lg:gap-10 lg:py-20">
      <div className="relative z-10 max-w-2xl">
        <div className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xl">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-sky-500" />
          </span>
          Open source for Expo &amp; React Native
        </div>

        <h1 className="home-display animate-fade-up delay-100 text-balance text-[clamp(3.25rem,8vw,7.75rem)] font-semibold leading-[0.88] tracking-[-0.075em] text-foreground">
          Beautiful maps,
          <span className="home-display-accent block">made simple.</span>
        </h1>

        <p className="animate-fade-up delay-200 mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Ready-to-use, customizable map components built on MapLibre or Mapbox. Zero config. One command setup.
        </p>

        <div className="animate-fade-up delay-300 mt-8 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="home-primary-button h-12 rounded-full px-6 text-sm shadow-lg"
            asChild
          >
            <Link href="/docs">
              Get started <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-border/70 bg-background/60 px-6 backdrop-blur-sm"
            asChild
          >
            <Link href="#examples">Explore examples</Link>
          </Button>
        </div>

        <div className="animate-fade-up delay-400 mt-8 max-w-xl">
          <div className="home-command flex items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-background/72 p-2 pl-4 font-mono text-sm shadow-[0_18px_50px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <span className="shrink-0 text-sky-500">$</span>
            <code className="min-w-0 flex-1 truncate text-foreground/90">
              {installCommand}
            </code>
            <CopyButton text={installCommand} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs text-muted-foreground">
            <span>MapLibre</span>
            <span className="size-1 rounded-full bg-border" />
            <span>Mapbox</span>
            <span className="size-1 rounded-full bg-border" />
            <span>NativeWind / Uniwind</span>
          </div>
        </div>
      </div>

      <div
        className="home-stage-wrap animate-scale-in delay-200 relative mx-auto w-full max-w-[680px]"
        onPointerMove={moveStage}
        onPointerLeave={resetStage}
      >
        <div className="home-stage-orbit home-stage-orbit-one" aria-hidden="true" />
        <div className="home-stage-orbit home-stage-orbit-two" aria-hidden="true" />

        <div className="home-map-stage relative aspect-[1.02/1] overflow-hidden rounded-[2rem] border border-white/10 bg-[#070b12] shadow-[0_45px_120px_-40px_rgba(14,165,233,0.5)]">
          <div className="home-stage-grid absolute inset-0" aria-hidden="true" />
          <div className="home-stage-glow absolute inset-0" aria-hidden="true" />

          <div className="absolute inset-x-5 top-5 z-30 flex items-center rounded-full border border-white/10 bg-black/45 px-4 py-2.5 text-[11px] text-white/65 backdrop-blur-xl sm:inset-x-8 sm:top-7">
            <span className="flex items-center gap-2 font-medium text-white/90">
              <MapPin className="size-3.5 text-sky-400" />
              San Francisco
            </span>
          </div>

          <div className="home-stage-image absolute inset-5 top-20 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl sm:inset-8 sm:top-24">
            <Image
              src={`${cdnUrl}/screenshots/home/analytics.png`}
              alt="Analytics map component preview"
              fill
              sizes="(min-width: 1024px) 48vw, 90vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
          </div>

        </div>
      </div>
    </section>
  );
}
