import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden text-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium">
            Pro Trading Terminal
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Master the Markets with <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400">Rupya</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Advanced analytics, professional trading journal, and real-time portfolio tracking in one glass-morphic interface.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/login">
            <GlassButton size="lg" className="min-w-[160px]">
              Get Started
            </GlassButton>
          </Link>
          <Link href="/register">
            <GlassButton variant="secondary" size="lg" className="min-w-[160px]">
              Create Account
            </GlassButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
