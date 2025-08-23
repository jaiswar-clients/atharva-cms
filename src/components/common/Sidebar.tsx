"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import Typography from "../ui/typography"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarImage } from "../ui/avatar"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { usePathname } from "next/navigation"
import { useAppSelector } from "@/redux/hook"
import { Building2, Calendar, File, MapPin, Newspaper, Star, MessageSquareText } from "lucide-react"

// Menu items.
const items = [
    {
        title: "Colleges",
        url: "colleges",
        icon: Building2,
    },
    {
        title: "Pages",
        url: "pages",
        icon: File,
    },
    {
        title: "News",
        url: "news",
        icon: Newspaper,
    },
    {
        title: "Events",
        url: "festivals",
        icon: Calendar,
    }, {
        title: "Highlights",
        url: "highlights",
        icon: Star,
    },
    {
        title: "Journeys",
        url: "journeys",
        icon: MapPin,
    },
    {
        title: "Feedbacks",
        url: "feedbacks",
        icon: MessageSquareText,
    }
]

export function AppSidebar() {
    const pathname = usePathname()
    const { user } = useAppSelector(state => state.app)

    if (!user) return null

    const isActive = (url: string) => {
        return pathname.startsWith(`/${url}`)
    }

    return (
        <Sidebar variant="floating" collapsible="icon" className="backdrop-blur supports-[backdrop-filter]:bg-sidebar/80">
            <SidebarHeader className="flex items-center gap-2 px-3 py-2">
                <Image src="/images/icon.png" width={28} height={28} alt="logo" className="rounded" />
                <Typography variant="h3" className="!font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                    Admin
                </Typography>
            </SidebarHeader>
            <SidebarContent className="md:mt-0 px-2 py-1">
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive(item.url)}
                                className="[&>svg]:size-4"
                                tooltip={item.title}
                            >
                                <Link href={`/${item.url}`} className="mb-1">
                                    <item.icon className="size-4" />
                                    <span className="text-sm group-data-[collapsible=icon]:hidden">
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarSeparator className="mx-3" />
            <SidebarFooter className="px-3 py-2">
                <div className="flex items-center gap-2 truncate">
                    <Avatar className="size-8">
                        <AvatarImage src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <Typography variant="h3" className="!text-sm !font-medium truncate">{user?.name}</Typography>
                        <Typography variant="p" className="text-xs text-muted-foreground truncate">
                            {user?.email}
                        </Typography>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}