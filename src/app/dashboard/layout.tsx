import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            {/* Ambient Background Glow (Adaptive) */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />

            <Sidebar />
            <Navbar />

            <main className="md:pl-20 pt-16 min-h-screen transition-all duration-300">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
