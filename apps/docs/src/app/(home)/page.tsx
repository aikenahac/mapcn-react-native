import { Header } from "@/components/header";
import { Hero } from "./_components/hero";
import { Examples } from "./_components/examples";
import { Footer } from "./_components/footer";

export default function Page() {
  return (
    <div className="home-page min-h-screen bg-background flex flex-col overflow-x-hidden">
      <div className="home-ambient" aria-hidden="true" />
      <Header className="home-header sticky top-0 z-50 mx-auto w-full max-w-7xl" />

      <main className="relative z-10 flex-1 w-full">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
          <Hero />
          <Examples />
        </div>
      </main>

      <Footer />
    </div>
  );
}
