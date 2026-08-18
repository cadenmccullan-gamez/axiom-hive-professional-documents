/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Archive, ClipboardCheck, FilePenLine, FolderKanban, PanelLeft, Scale, ScrollText, Settings2 } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: FilePenLine, label: "Drafting Requests", path: "/requests" },
  { icon: ClipboardCheck, label: "Review Queue", path: "/review" },
  { icon: ScrollText, label: "Audit Log", path: "/audit" },
  { icon: Settings2, label: "Administration", path: "/admin" },
];

const SIDEBAR_WIDTH_KEY = "axiom-hive-sidebar-width";
const DEFAULT_WIDTH = 296;
const MIN_WIDTH = 224;
const MAX_WIDTH = 440;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? Number.parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()), [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#08110f] p-6 text-[#e9f4ef]">
        <section className="w-full max-w-lg rounded-3xl border border-emerald-100/10 bg-[#10201b] p-8 shadow-2xl shadow-black/20">
          <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-emerald-300 text-[#07110e]"><Scale className="size-6" /></div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/70">Axiom Hive / XPII</p>
          <h1 className="mt-3 font-serif text-3xl leading-tight">Governance console access</h1>
          <p className="mt-4 text-sm leading-6 text-emerald-50/70">Sign in to access authorized project workspaces and their controlled drafting workflows.</p>
          <Button onClick={() => startLogin()} className="mt-7 w-full bg-emerald-300 text-[#07110e] hover:bg-emerald-200">Sign in to continue</Button>
        </section>
      </main>
    );
  }
  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardShell setSidebarWidth={setSidebarWidth}>{children}</DashboardShell>
    </SidebarProvider>
  );
}

function DashboardShell({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (value: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [resizing, setResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const activeMenu = menuItems.find(item => location.startsWith(item.path)) ?? menuItems[0];

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!resizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const width = event.clientX - left;
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) setSidebarWidth(width);
    };
    const up = () => setResizing(false);
    if (resizing) {
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      document.body.style.cursor = "col-resize";
    }
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      document.body.style.cursor = "";
    };
  }, [resizing, setSidebarWidth]);

  return (
    <div ref={sidebarRef} className="relative min-h-screen bg-[#f5f7f3] text-[#18211d]">
      <Sidebar collapsible="icon" className="border-r border-[#d9dfda] bg-[#10201b] text-[#eff8f2]">
        <SidebarHeader className="h-auto border-b border-white/10 px-3 py-5">
          <button className="flex w-full items-center gap-3 text-left" onClick={() => setLocation("/projects")}>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-300 text-[#07110e]"><Scale className="size-5" /></span>
            <span className="group-data-[collapsible=icon]:hidden"><span className="block font-serif text-lg tracking-tight">Axiom Hive</span><span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/60">Governance console</span></span>
          </button>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/45 group-data-[collapsible=icon]:hidden">Controlled workspaces</p>
          <SidebarMenu>
            {menuItems.map(item => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton isActive={location.startsWith(item.path)} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-10 text-emerald-50/75 hover:bg-white/10 hover:text-white data-[active=true]:bg-emerald-300 data-[active=true]:text-[#07110e]">
                  <item.icon className="size-4" /> <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="mx-3 mt-7 rounded-xl border border-emerald-100/10 bg-white/[0.04] p-3 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium text-emerald-50">Reference prototype</p>
            <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">All release actions require a recorded reviewer approval.</p>
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl p-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8 border border-emerald-100/15"><AvatarFallback className="bg-emerald-100 text-xs text-[#143126]">{user?.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-medium">{user?.name ?? "Authorized user"}</p><p className="truncate text-[11px] text-emerald-100/55">Authenticated workspace access</p></div>
            <button type="button" onClick={logout} aria-label="Sign out" className="rounded-md p-1.5 text-emerald-100/65 hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:hidden"><Archive className="size-4" /></button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <button aria-label="Resize sidebar" onMouseDown={() => setResizing(true)} className="absolute bottom-0 left-[var(--sidebar-width)] top-0 z-50 hidden w-1 cursor-col-resize bg-transparent hover:bg-emerald-400/40 md:block" />
      <SidebarInset className="md:ml-[var(--sidebar-width)]">
        <header className="flex h-16 items-center gap-3 border-b border-[#dde3de] bg-[#fbfdf9]/95 px-5 backdrop-blur md:px-8">
          {isMobile ? <PanelLeft className="size-5" /> : null}
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#718078]">Axiom Hive / XPII</p><p className="font-serif text-lg leading-tight">{activeMenu.label}</p></div>
          <span className="ml-auto rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-900">Human-governed workflow</span>
        </header>
        <main className="min-h-[calc(100vh-4rem)] p-5 md:p-8">{children}</main>
      </SidebarInset>
    </div>
  );
}
