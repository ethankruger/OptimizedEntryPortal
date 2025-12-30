import { useNavigate, useLocation } from "react-router-dom"
import {
    AlertCircle,
    Calendar,
    ChevronUp,
    FileText,
    LayoutDashboard,
    Phone,
    Settings,
    User2,
    Moon,
    Sun,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import PortalLogo from "../../assets/PortalLogo.png"

export function Sidebar() {
    const { user, signOut } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()

    const items = [
        {
            title: "Dashboard",
            url: "/",
            icon: LayoutDashboard,
        },
        {
            title: "Calls",
            url: "/calls",
            icon: Phone,
        },
        {
            title: "Appointments",
            url: "/appointments",
            icon: Calendar,
        },
        {
            title: "Emergencies",
            url: "/emergencies",
            icon: AlertCircle,
        },
        {
            title: "Invoices",
            url: "/invoices",
            icon: FileText,
        },
    ]

    return (
        <div className="w-80 h-[calc(100vh-2rem)] m-4 bg-black/30 backdrop-blur-2xl border border-white/10 dark:border-white/5 flex flex-col shrink-0 z-50 relative overflow-hidden rounded-3xl shadow-xl">
            <div className="flex items-center justify-center px-6 py-6 border-b border-white/5">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
                    <img src={PortalLogo} className="w-full h-auto object-contain" alt="Optimized Entry Portal" />
                </div>
            </div>

            <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
                <div className="px-3 mb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Menu
                </div>
                {items.map((item) => {
                    const isActive = location.pathname === item.url
                    return (
                        <button
                            key={item.title}
                            onClick={() => navigate(item.url)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/20 text-primary"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5"
                            )}
                        >
                            <item.icon size={18} className={cn(isActive ? "text-primary" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]")} />
                            {item.title}
                        </button>
                    )
                })}
            </div>

            <div className="p-3 mt-auto border-t border-white/5">
                <div className="flex flex-col gap-1">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group mb-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5"
                    >
                        {theme === 'dark' ? (
                            <>
                                <Sun size={18} className="text-orange-400 group-hover:text-orange-300" />
                                <span className="group-hover:text-orange-300">Light Mode</span>
                            </>
                        ) : (
                            <>
                                <Moon size={18} className="text-purple-400 group-hover:text-purple-300" />
                                <span className="group-hover:text-purple-300">Dark Mode</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/settings')}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group mb-2",
                            location.pathname === '/settings'
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5"
                        )}
                    >
                        <Settings size={18} className={cn(location.pathname === '/settings' ? "text-white" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]")} />
                        Settings
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10 dark:bg-white/10 bg-black/5 hover:bg-white/20 dark:hover:bg-white/20 hover:bg-black/10 transition-all duration-200 w-full border border-white/5 dark:border-white/5 border-black/10 group">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px] shrink-0">
                                    <div className="w-full h-full rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                                        <User2 size={16} className="text-[var(--text-primary)]" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-start min-w-0 flex-1">
                                    <span className="truncate w-full text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#ff8904] transition-colors">{user?.email || 'User'}</span>
                                    <span className="text-[11px] text-[var(--text-muted)] font-medium">Pro Plan</span>
                                </div>
                                <div className="ml-auto shrink-0">
                                    <ChevronUp size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            align="end"
                            className="w-56 bg-[var(--bg-card)] border-[var(--glass-border)] text-[var(--text-primary)]"
                        >
                            <DropdownMenuItem
                                className="focus:bg-white/10 dark:focus:bg-white/10 focus:bg-black/10 focus:text-[var(--text-primary)] cursor-pointer"
                                onClick={() => navigate('/settings')}
                            >
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="focus:bg-white/10 dark:focus:bg-white/10 focus:bg-black/10 focus:text-danger cursor-pointer text-danger/80"
                                onClick={signOut}
                            >
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}
