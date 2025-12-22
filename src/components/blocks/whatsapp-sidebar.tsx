import { useLocation, useNavigate } from "react-router-dom"
import {
    AlertCircle,
    Calendar,
    ChevronUp,
    LayoutDashboard,
    Menu,
    Phone,
    Settings,
    User2,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/blocks/sidebar"

import { useSidebar } from "@/components/blocks/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "../../context/AuthContext"

export function AppSidebar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { toggleSidebar } = useSidebar()

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
        <Sidebar
            collapsible="icon"
            variant="sidebar"
        >
            <SidebarContent>
                <SidebarGroup>
                    <div className="flex items-center justify-between px-2 py-2 mb-4">
                        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary">
                                <img src="/logo-logo.png" className="w-6 h-6 object-contain" alt="Logo" />
                            </div>
                            <span className="font-display font-bold text-lg">Optimized<span className="text-primary">Entry</span></span>
                        </div>
                        <SidebarMenuButton onClick={toggleSidebar} className="w-auto h-auto p-2" size="sm">
                            <Menu size={20} />
                        </SidebarMenuButton>
                    </div>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        onClick={() => navigate(item.url)}
                                        isActive={location.pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => navigate('/settings')}
                            isActive={location.pathname === '/settings'}
                            tooltip="Settings"
                        >
                            <Settings />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 />
                                    <span className="truncate">{user?.email || 'User'}</span>
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem onClick={() => navigate('/settings')}>
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={signOut}>
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
