import React, { useState, useEffect } from "react";
import {
  Bell, LogOut, Menu, X, CheckCircle, Clock, Home, BarChart2, Moon, Sun,
  LayoutDashboard, Search, History, User, Building2, Users, FileText
} from "lucide-react";
import { motion } from "motion/react";
import { authService, notificationService } from "../../services/api";
import {
  Bdg, Crd, Toggle, AnimatedLogo, cn, Screen
} from "../ui/core-widgets";

export default function AppShell({ children, nav, screen, dark, setDark }: {
  children: React.ReactNode; nav: (s: Screen) => void; screen: Screen; dark: boolean; setDark: (v: boolean) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = authService.getCurrentUser();
  const fullName = user ? (user.firstName + " " + user.lastName) : "Smart Parker";
  const initials = user ? (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase() : "SP";
  const userRoleSub = user && user.roles && user.roles.includes("ROLE_ADMIN") ? "Administrator" : "Standard Account";

  const isAdmin = screen === "admin" || screen === "management";

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getMyNotifications();
      setNotifications(list);
      const countRes = await notificationService.getUnreadCount();
      setUnreadCount(countRes.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    authService.logout();
    nav("landing");
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const userNav = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", s: "dashboard" as Screen },
    { icon: <Search className="w-4 h-4" />, label: "Find Parking", s: "search" as Screen },
    { icon: <History className="w-4 h-4" />, label: "My Bookings", s: "history" as Screen },
    { icon: <User className="w-4 h-4" />, label: "Profile", s: "profile" as Screen },
  ];

  const adminNav = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: "Analytics", s: "admin" as Screen },
    { icon: <Building2 className="w-4 h-4" />, label: "Parking Lots", s: "management" as Screen },
    { icon: <Users className="w-4 h-4" />, label: "Users", s: "profile" as Screen },
    { icon: <FileText className="w-4 h-4" />, label: "Reports", s: "history" as Screen },
  ];

  const items = isAdmin ? adminNav : userNav;

  return (
    <div className="flex h-screen bg-background overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <aside className={cn("hidden md:flex flex-col w-60 bg-sidebar border-r border-sidebar-border flex-shrink-0")}>
        <div className="p-5 flex items-center gap-2.5 border-b border-sidebar-border">
          <AnimatedLogo className="w-8 h-8 flex-shrink-0" />
          <span className="font-bold text-sidebar-foreground">ParkHere</span>
          {isAdmin && <Bdg label="Admin" type="warning" />}
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map(({ icon, label, s }) => (
            <button key={s} onClick={() => nav(s)}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-150 cursor-pointer",
                screen === s ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
              {icon}{label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <button onClick={() => nav(isAdmin ? "dashboard" : "admin")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-150 cursor-pointer">
              {isAdmin ? <Home className="w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
              {isAdmin ? "User View" : "Admin View"}
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              {dark ? <Moon className="w-4 h-4 text-sidebar-foreground/70" /> : <Sun className="w-4 h-4 text-sidebar-foreground/70" />}
              <span className="text-sm text-sidebar-foreground/70">Dark mode</span>
            </div>
            <Toggle checked={dark} onChange={setDark} />
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-150 cursor-pointer">
            <LogOut className="w-4 h-4" />Sign out
          </button>
        </div>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{userRoleSub}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 gap-3">
          <button className="md:hidden p-2 rounded-xl hover:bg-muted" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0" />
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Toggle checked={dark} onChange={setDark} />
            </div>
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <button onClick={() => nav("profile")} className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">{initials}</button>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
              <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <AnimatedLogo className="w-8 h-8 flex-shrink-0" />
                  <span className="font-bold text-sidebar-foreground">ParkHere</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {items.map(({ icon, label, s }) => (
                  <button key={s} onClick={() => { nav(s); setMobileOpen(false); }}
                    className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all cursor-pointer", screen === s ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50")}>
                    {icon}{label}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-sidebar-border">
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 cursor-pointer">
                  <LogOut className="w-4 h-4" />Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification panel */}
        {notifOpen && (
          <div className="absolute top-16 right-4 z-40 w-80">
            <Crd className="shadow-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                <span className="font-semibold text-sm text-foreground">Notifications ({unreadCount})</span>
                <button onClick={() => setNotifOpen(false)} className="cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => {
                    const notifIcon = n.type === "CONFIRMATION" ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                                      n.type === "ALERT" ? <Clock className="w-4 h-4 text-amber-500" /> :
                                      <Bell className="w-4 h-4 text-blue-500" />;
                    return (
                      <div key={n.id} onClick={() => { handleMarkAsRead(n.id); }} className={cn("flex gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0 cursor-pointer", !n.read && "bg-primary/5")}>
                        <div className="mt-0.5 flex-shrink-0">{notifIcon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                            {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="w-full text-center text-xs font-semibold text-primary py-2.5 hover:bg-muted/50 border-t border-border block transition-colors cursor-pointer">
                  Mark all as read
                </button>
              )}
            </Crd>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
          <div className="mx-4 mb-4">
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-[20px] shadow-xl px-2 py-2 flex items-center justify-around">
              {items.map(({ icon, label, s }) => (
                <button key={s} onClick={() => nav(s)} className={cn("flex flex-col items-center gap-1 px-3 py-1.5 rounded-[14px] transition-all duration-150 cursor-pointer",
                  screen === s ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
                  {icon}
                  <span className="text-[10px] font-medium">{label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
