import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { HeroHighlight } from '../ui/hero-highlight';

const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 w-full transition-colors duration-300 overflow-hidden relative">
            {/* Shared Gradient Background - Dulled version of Login */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-emerald-700/10 to-background pointer-events-none z-0" />

            <Sidebar />

            <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
                <HeroHighlight containerClassName="h-full w-full items-start justify-start bg-transparent dark:bg-transparent" className="w-full h-full">
                    <div className="flex-1 p-8 md:p-12 overflow-y-auto w-full h-full">
                        <Outlet />
                    </div>
                </HeroHighlight>
            </main>
        </div>
    );
};

export default DashboardLayout;
