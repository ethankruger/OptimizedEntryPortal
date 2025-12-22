import { useNavigate, useLocation } from "react-router-dom"
import {
    AlertCircle,
    Calendar,
    ChevronUp,
    LayoutDashboard,
    Phone,
    Settings,
    User2,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { BlurIn } from "../ui/blur-in"
import logoLogo from "../../assets/logo-logo.png"

export function Sidebar() {
    const { user, signOut } = useAuth()
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
    ]

    return (
        <div className="w-80 h-[calc(100vh-2rem)] m-4 bg-white/5 dark:bg-black/20 backdrop-blur-2xl border border-white/10 dark:border-white/5 flex flex-col shrink-0 z-50 relative overflow-hidden rounded-3xl shadow-xl">
            {/* Glass sheen/gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 px-6 h-24 border-b border-white/5">
                <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-xl bg-primary/20 text-primary">
                    <img src={logoLogo} className="w-10 h-10 object-contain" alt="Logo" />
                </div>
                <BlurIn
                    word="Optimized Entry Portal"
                    className="!text-lg !font-bold !text-white !font-display !tracking-normal !normal-case !m-0 !p-0 whitespace-nowrap"
                    duration={0.8}
                />
            </div>

            <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
                <div className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
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
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={18} className={cn(isActive ? "text-primary" : "text-white/40 group-hover:text-white/80")} />
                            {item.title}
                        </button>
                    )
                })}
            </div>

            <div className="p-3 mt-auto border-t border-white/5">
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => navigate('/settings')}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group mb-2",
                            location.pathname === '/settings'
                                ? "bg-primary/20 text-primary"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Settings size={18} className={cn(location.pathname === '/settings' ? "text-primary" : "text-white/40 group-hover:text-white/80")} />
                        Settings
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 w-full border border-white/5 group">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px] shrink-0">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                        <User2 size={16} className="text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-start min-w-0 flex-1">
                                    <span className="truncate w-full text-sm font-semibold text-white group-hover:text-[#30b357] transition-colors">{user?.email || 'User'}</span>
                                    <span className="text-[11px] text-white/60 font-medium">Pro Plan</span>
                                </div>
                                <div className="ml-auto shrink-0">
                                    <ChevronUp size={16} className="text-white/60 group-hover:text-white transition-colors" />
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            align="end"
                            className="w-56 bg-black/90 border-white/10 text-white"
                        >
                            <DropdownMenuItem
                                className="focus:bg-white/10 focus:text-white cursor-pointer"
                                onClick={() => navigate('/settings')}
                            >
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="focus:bg-white/10 focus:text-danger cursor-pointer text-danger/80"
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
