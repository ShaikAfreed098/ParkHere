import { useState, useEffect, useCallback } from "react";
import {
  MapPin, Search, Car, Zap, Shield, Clock, Star, ChevronRight, ChevronLeft,
  ChevronDown, ChevronUp, ArrowRight, ArrowUp, ArrowDown, Check, X, Bell,
  User, Settings, LogOut, Menu, CreditCard, Calendar, Download, Navigation,
  BarChart2, Users, TrendingUp, DollarSign, Filter, Plus, Edit, Trash2,
  RefreshCw, Phone, Mail, Lock, Sun, Moon, Home, CheckCircle, Activity,
  FileText, MoreHorizontal, Building2, Wifi, LayoutDashboard, HelpCircle,
  Grid, List, Eye, QrCode, Smartphone, Key, AlertCircle, Info, Bookmark,
  SlidersHorizontal, BatteryCharging, History, Coffee, Layers, Package,
  Accessibility, MapIcon, PieChart as PieIcon, TrendingDown, XCircle,
  CircleParking
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion } from "motion/react";
import { authService, vehicleService, lotService, bookingService, notificationService, adminService } from "./services/api";

// ─── Types ──────────────────────────────────────────────────────────────────
type Screen =
  | "landing" | "login" | "register" | "forgot" | "otp" | "auth-success"
  | "dashboard" | "search" | "details" | "slots" | "booking" | "success"
  | "history" | "profile" | "admin" | "management";

type SlotStatus = "available" | "occupied" | "reserved" | "selected" | "disabled" | "ev" | "accessible";

interface Lot {
  id: number; name: string; address: string; distance: string; price: number;
  rating: number; reviews: number; available: number; total: number;
  image: string; amenities: string[]; tags: string[];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const LOTS: Lot[] = [
  { id: 1, name: "Central Park Garage", address: "123 Park Ave, New York", distance: "0.3 mi", price: 4.50, rating: 4.8, reviews: 312, available: 23, total: 150, image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&h=400&fit=crop&auto=format", amenities: ["ev", "covered", "security", "wifi"], tags: ["24/7", "EV Charging"] },
  { id: 2, name: "Midtown Plaza Parking", address: "456 5th Ave, New York", distance: "0.7 mi", price: 3.00, rating: 4.5, reviews: 189, available: 8, total: 80, image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&h=400&fit=crop&auto=format", amenities: ["covered", "security"], tags: ["Covered", "Affordable"] },
  { id: 3, name: "Downtown Smart Lot", address: "789 Broadway, New York", distance: "1.2 mi", price: 2.50, rating: 4.2, reviews: 95, available: 42, total: 200, image: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=400&fit=crop&auto=format", amenities: ["ev", "security", "wifi"], tags: ["Open Air", "EV Charging"] },
  { id: 4, name: "Riverside Premium Garage", address: "321 Riverside Dr, New York", distance: "1.8 mi", price: 5.00, rating: 4.9, reviews: 441, available: 15, total: 100, image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=400&fit=crop&auto=format", amenities: ["ev", "covered", "security", "wifi", "accessible"], tags: ["Premium", "EV Charging"] },
  { id: 5, name: "Columbus Circle Lot", address: "1 Columbus Circle, NY", distance: "0.5 mi", price: 3.75, rating: 4.6, reviews: 228, available: 31, total: 120, image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=400&fit=crop&auto=format", amenities: ["covered", "security", "wifi"], tags: ["Covered", "Central"] },
  { id: 6, name: "Battery Park Underground", address: "4 Battery Park, New York", distance: "2.1 mi", price: 6.00, rating: 4.7, reviews: 183, available: 5, total: 60, image: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&h=400&fit=crop&auto=format", amenities: ["ev", "covered", "security", "wifi", "accessible"], tags: ["Underground", "Premium"] },
];

const REVENUE_DATA = [
  { month: "Jan", revenue: 42000, bookings: 1240 },
  { month: "Feb", revenue: 38000, bookings: 1100 },
  { month: "Mar", revenue: 51000, bookings: 1480 },
  { month: "Apr", revenue: 47000, bookings: 1350 },
  { month: "May", revenue: 59000, bookings: 1720 },
  { month: "Jun", revenue: 63000, bookings: 1890 },
  { month: "Jul", revenue: 71000, bookings: 2100 },
  { month: "Aug", revenue: 68000, bookings: 1980 },
  { month: "Sep", revenue: 74000, bookings: 2200 },
  { month: "Oct", revenue: 82000, bookings: 2410 },
  { month: "Nov", revenue: 79000, bookings: 2300 },
  { month: "Dec", revenue: 91000, bookings: 2680 },
];

const VEHICLE_DATA = [
  { name: "Sedan", value: 42, color: "#2563EB" },
  { name: "SUV", value: 28, color: "#14B8A6" },
  { name: "EV", value: 18, color: "#22C55E" },
  { name: "Truck", value: 8, color: "#F59E0B" },
  { name: "Other", value: 4, color: "#8B5CF6" },
];

const UTILIZATION_DATA = [
  { name: "Central Park", value: 84 },
  { name: "Midtown", value: 90 },
  { name: "Downtown", value: 79 },
  { name: "Riverside", value: 85 },
  { name: "Battery Park", value: 72 },
  { name: "Columbus", value: 95 },
];

const DAILY_DATA = [
  { day: "Mon", bookings: 142 },
  { day: "Tue", bookings: 168 },
  { day: "Wed", bookings: 155 },
  { day: "Thu", bookings: 188 },
  { day: "Fri", bookings: 214 },
  { day: "Sat", bookings: 186 },
  { day: "Sun", bookings: 121 },
];

const ADMIN_BOOKINGS = [
  { id: "BK-4501", user: "Sarah Chen", lot: "Central Park Garage", slot: "A-14", date: "Dec 10, 2024", amount: "$13.50", status: "active" },
  { id: "BK-4500", user: "Marcus Williams", lot: "Midtown Plaza", slot: "B-07", date: "Dec 10, 2024", amount: "$6.00", status: "completed" },
  { id: "BK-4499", user: "Priya Patel", lot: "Downtown Smart Lot", slot: "C-22", date: "Dec 9, 2024", amount: "$7.50", status: "completed" },
  { id: "BK-4498", user: "James O'Brien", lot: "Riverside Premium", slot: "A-03", date: "Dec 9, 2024", amount: "$20.00", status: "cancelled" },
  { id: "BK-4497", user: "Yuna Kim", lot: "Central Park Garage", slot: "D-19", date: "Dec 8, 2024", amount: "$45.00", status: "completed" },
  { id: "BK-4496", user: "Leon Garcia", lot: "Columbus Circle", slot: "B-11", date: "Dec 8, 2024", amount: "$11.25", status: "active" },
];

const USER_BOOKINGS = [
  { id: "BK-4501", lot: "Central Park Garage", address: "123 Park Ave", slot: "A-14", date: "Dec 10, 2024", time: "2:00 – 5:00 PM", duration: "3h", amount: "$13.50", status: "active", image: LOTS[0].image },
  { id: "BK-4490", lot: "Midtown Plaza Parking", address: "456 5th Ave", slot: "B-07", date: "Dec 5, 2024", time: "9:00 – 11:00 AM", duration: "2h", amount: "$6.00", status: "completed", image: LOTS[1].image },
  { id: "BK-4475", lot: "Downtown Smart Lot", address: "789 Broadway", slot: "C-22", date: "Nov 28, 2024", time: "6:00 – 9:00 PM", duration: "3h", amount: "$7.50", status: "completed", image: LOTS[2].image },
  { id: "BK-4460", lot: "Riverside Premium Garage", address: "321 Riverside Dr", slot: "A-03", date: "Nov 20, 2024", time: "10:00 AM – 2:00 PM", duration: "4h", amount: "$20.00", status: "cancelled", image: LOTS[3].image },
  { id: "BK-4440", lot: "Columbus Circle Lot", address: "1 Columbus Circle", slot: "D-08", date: "Nov 15, 2024", time: "8:00 AM – 12:00 PM", duration: "4h", amount: "$15.00", status: "completed", image: LOTS[4].image },
];

// ─── Slot Grid Init ──────────────────────────────────────────────────────────
function makeSlots(): { id: string; status: SlotStatus }[][] {
  const base: SlotStatus[] = ["available","available","available","occupied","reserved","disabled","ev","accessible"];
  const map: Record<number, SlotStatus> = {
    3: "occupied", 7: "disabled", 11: "reserved", 14: "ev", 19: "occupied",
    22: "accessible", 26: "occupied", 30: "reserved", 33: "ev", 36: "disabled",
    41: "occupied", 45: "reserved", 48: "occupied", 52: "ev", 55: "occupied",
    58: "disabled", 62: "reserved", 65: "accessible"
  };
  return Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 10 }, (_, c) => {
      const idx = r * 10 + c;
      return { id: `${String.fromCharCode(65 + r)}-${String(c + 1).padStart(2, "0")}`, status: map[idx] ?? "available" };
    })
  );
}

// ─── Utils ───────────────────────────────────────────────────────────────────
function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// ─── Design System ───────────────────────────────────────────────────────────
function Btn({
  children, variant = "primary", size = "md", onClick, className, disabled, loading, full, icon, iconRight
}: {
  children?: React.ReactNode; variant?: "primary"|"secondary"|"ghost"|"outline"|"danger"|"success";
  size?: "xs"|"sm"|"md"|"lg"|"xl"; onClick?: () => void; className?: string;
  disabled?: boolean; loading?: boolean; full?: boolean; icon?: React.ReactNode; iconRight?: React.ReactNode;
}) {
  const V: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20",
    secondary: "bg-[#14B8A6] text-white hover:bg-teal-600 shadow-sm shadow-teal-500/20",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    outline: "border border-border bg-transparent text-foreground hover:bg-muted",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600",
  };
  const S: Record<string, string> = {
    xs: "px-2.5 py-1 text-xs rounded-[10px]",
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-4 py-2.5 text-sm rounded-[14px]",
    lg: "px-6 py-3 text-base rounded-[14px]",
    xl: "px-8 py-4 text-base rounded-[16px]",
  };
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={cn("inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none", V[variant], S[size], full && "w-full", className)}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

function Bdg({ label, type = "default" }: { label: string; type?: "default"|"success"|"warning"|"danger"|"teal"|"purple"|"muted" }) {
  const T: Record<string, string> = {
    default: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    muted: "bg-muted text-muted-foreground",
  };
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", T[type])}>{label}</span>;
}

function Crd({ children, className, onClick, p }: { children: React.ReactNode; className?: string; onClick?: () => void; p?: boolean }) {
  return (
    <div onClick={onClick} className={cn("bg-card border border-border rounded-[18px] shadow-sm", onClick && "cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 active:scale-[0.99]", p && "p-6", className)}>
      {children}
    </div>
  );
}

function Inp({ label, placeholder, type = "text", value, onChange, icon, note, error }: {
  label?: string; placeholder?: string; type?: string; value?: string;
  onChange?: (v: string) => void; icon?: React.ReactNode; note?: string; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
          className={cn("w-full rounded-[14px] border bg-card text-foreground placeholder:text-muted-foreground/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200", icon && "pl-10", error ? "border-red-400" : "border-border")} />
      </div>
      {note && !error && <p className="text-xs text-muted-foreground">{note}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function StatCard({ label, value, change, sub, icon, color = "blue" }: {
  label: string; value: string; change?: string; sub?: string; icon: React.ReactNode; color?: "blue"|"teal"|"green"|"amber"|"purple"|"rose";
}) {
  const C: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
  };
  return (
    <Crd p>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><ArrowUp className="w-3 h-3" />{change} this month</p>}
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={cn("p-3 rounded-[14px] ml-4", C[color])}>{icon}</div>
      </div>
    </Crd>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200", checked ? "bg-primary" : "bg-muted")} role="switch" aria-checked={checked}>
      <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

// ─── Parking Illustration ─────────────────────────────────────────────────────
function ParkingIllustration() {
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden border border-border bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800" style={{ height: 300 }}>
      <svg viewBox="0 0 900 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* Road */}
        <rect x="0" y="0" width="900" height="300" fill="url(#sky)" />
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
          <linearGradient id="skyDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>
        {/* Parking lot floor */}
        <rect x="50" y="60" width="800" height="200" rx="12" fill="#CBD5E1" opacity="0.5" />
        <rect x="60" y="70" width="780" height="180" rx="10" fill="#E2E8F0" opacity="0.8" />
        {/* Parking lines */}
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
          <rect key={i} x={80 + i * 64} y="80" width="2" height="160" fill="#94A3B8" opacity="0.6" />
        ))}
        {/* Center aisle */}
        <rect x="60" y="155" width="780" height="14" fill="#CBD5E1" opacity="0.6" />
        {/* Parked cars - top row */}
        {[0,1,2,3,4,5,6,7,8,9,10].map(i => {
          if (i === 3 || i === 7) return null;
          const x = 82 + i * 64;
          const colors = ["#3B82F6","#14B8A6","#64748B","#22C55E","#F59E0B","#8B5CF6","#3B82F6","#EF4444","#14B8A6","#64748B","#3B82F6"];
          return (
            <g key={i}>
              <rect x={x + 2} y="90" width="56" height="58" rx="6" fill={colors[i]} opacity="0.85" />
              <rect x={x + 8} y="95" width="42" height="24" rx="3" fill="white" opacity="0.25" />
              <ellipse cx={x + 14} cy="147" rx="8" ry="8" fill="#1E293B" />
              <ellipse cx={x + 14} cy="147" rx="4" ry="4" fill="#94A3B8" />
              <ellipse cx={x + 46} cy="147" rx="8" ry="8" fill="#1E293B" />
              <ellipse cx={x + 46} cy="147" rx="4" ry="4" fill="#94A3B8" />
            </g>
          );
        })}
        {/* Available spots - empty */}
        {[3, 7].map(i => (
          <g key={i}>
            <rect x={82 + i * 64 + 2} y="90" width="56" height="58" rx="6" fill="#2563EB" opacity="0.1" strokeDasharray="4 2" stroke="#2563EB" strokeWidth="2" />
            <text x={82 + i * 64 + 30} y="124" textAnchor="middle" fill="#2563EB" fontSize="11" fontWeight="600">FREE</text>
          </g>
        ))}
        {/* Parked cars - bottom row */}
        {[0,1,2,4,5,6,8,9,10].map(i => {
          const x = 82 + i * 64;
          const colors = ["#64748B","#3B82F6","#14B8A6","#8B5CF6","#3B82F6","#F59E0B","#14B8A6","#22C55E","#EF4444"];
          const ci = [0,1,2,4,5,6,8,9,10].indexOf(i);
          return (
            <g key={i}>
              <rect x={x + 2} y="170" width="56" height="58" rx="6" fill={colors[ci]} opacity="0.85" />
              <rect x={x + 8} y="175" width="42" height="24" rx="3" fill="white" opacity="0.25" />
              <ellipse cx={x + 14} cy="170" rx="8" ry="8" fill="#1E293B" />
              <ellipse cx={x + 14} cy="170" rx="4" ry="4" fill="#94A3B8" />
              <ellipse cx={x + 46} cy="170" rx="8" ry="8" fill="#1E293B" />
              <ellipse cx={x + 46} cy="170" rx="4" ry="4" fill="#94A3B8" />
            </g>
          );
        })}
        {/* Entrance arrow */}
        <g>
          <rect x="20" y="145" width="40" height="20" rx="4" fill="#2563EB" opacity="0.15" />
          <text x="40" y="159" textAnchor="middle" fill="#2563EB" fontSize="10" fontWeight="700">IN</text>
        </g>
        {/* P sign */}
        <circle cx="840" cy="100" r="22" fill="#2563EB" />
        <text x="840" y="107" textAnchor="middle" fill="white" fontSize="22" fontWeight="800">P</text>
        {/* Animated car entering */}
        <g style={{ animation: "slideIn 4s ease-in-out infinite" }}>
          <rect x="830" y="148" width="56" height="28" rx="5" fill="#22C55E" opacity="0.9" />
          <rect x="836" y="151" width="42" height="14" rx="2" fill="white" opacity="0.25" />
          <ellipse cx="844" cy="176" rx="7" ry="7" fill="#1E293B" />
          <ellipse cx="844" cy="176" rx="3.5" ry="3.5" fill="#94A3B8" />
          <ellipse cx="872" cy="176" rx="7" ry="7" fill="#1E293B" />
          <ellipse cx="872" cy="176" rx="3.5" ry="3.5" fill="#94A3B8" />
        </g>
        <style>{`
          @keyframes slideIn {
            0% { transform: translateX(100px); opacity: 0; }
            15% { opacity: 1; }
            60% { transform: translateX(-780px); opacity: 1; }
            75% { transform: translateX(-780px); opacity: 0; }
            100% { transform: translateX(100px); opacity: 0; }
          }
        `}</style>
        {/* Live badge */}
        <rect x="340" y="20" width="90" height="26" rx="13" fill="#EF4444" opacity="0.1" />
        <circle cx="358" cy="33" r="4" fill="#EF4444">
          <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <text x="368" y="37" fill="#EF4444" fontSize="11" fontWeight="700">LIVE</text>
        <text x="400" y="37" fill="#64748B" fontSize="11">23 spots free</text>
      </svg>
    </div>
  );
}

// ─── Parking Card ─────────────────────────────────────────────────────────────
function ParkingCard({ lot, onClick }: { lot: any; onClick: () => void }) {
  const price = lot.pricePerHour || lot.price || 50;
  const tags = lot.amenities || lot.tags || ["EV Charging", "Covered"];
  const address = lot.address ? lot.address.split(",")[0] : "Bangalore";
  const rating = lot.rating || 4.8;
  const reviewsCount = lot.reviews || 42;
  const total = lot.total || 20;
  const available = lot.available !== undefined ? lot.available : ((Number(lot.id) * 3 + 2) % 15 + 1);
  const pct = available / total;
  const image = lot.image || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80";

  const statusColor = pct > 0.3 ? "text-green-500" : pct > 0.1 ? "text-amber-500" : "text-red-500";
  const barColor = pct > 0.3 ? "bg-green-500" : pct > 0.1 ? "bg-amber-500" : "bg-red-500";

  return (
    <Crd onClick={onClick} className="overflow-hidden group cursor-pointer hover:shadow-md transition-all">
      <div className="relative h-36 overflow-hidden bg-muted">
        <img src={image} alt={lot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 right-3">
          <div className="bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-foreground shadow-sm">
            ₹{price}/hr
          </div>
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {tags.slice(0, 2).map((t: string) => (
            <span key={t} className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm mb-1 truncate">{lot.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lot.distance || "0.8 km"} · {address}</span>
        </div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{rating}</span>
            <span className="text-muted-foreground">({reviewsCount})</span>
          </div>
          <span className={cn("text-xs font-semibold", statusColor)}>{available} available</span>
        </div>
        <div className="bg-muted rounded-full h-1.5 overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
    </Crd>
  );
}

// ─── QR Code ─────────────────────────────────────────────────────────────────
function QRCode({ size = 160, blurred = false }: { size?: number; blurred?: boolean }) {
  const P = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,0,1,1,0,1,0,1,1],
    [0,1,0,0,1,0,0,0,1,1,0,1,0,0,1,0,1,0,0],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [0,1,0,1,0,1,0,0,1,0,0,1,0,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,0,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,1,0,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,0,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,1,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,0,0,1,1],
  ];
  const n = P.length;
  const c = size / n;
  return (
    <div className={cn("rounded-xl overflow-hidden", blurred && "blur-sm select-none pointer-events-none")}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="white" />
        {P.map((row, r) => row.map((v, col) => v ? (
          <rect key={`${r}-${col}`} x={col * c + 1} y={r * c + 1} width={c - 2} height={c - 2} rx={1.5} fill="#0F172A" />
        ) : null))}
        <rect x={size/2 - 14} y={size/2 - 14} width={28} height={28} rx={4} fill="#2563EB" />
        <text x={size/2} y={size/2 + 5} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">P</text>
      </svg>
    </div>
  );
}

// ─── Map Placeholder ──────────────────────────────────────────────────────────
function MapPlaceholder() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800 dark:to-slate-700 overflow-hidden rounded-[18px]">
      <svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        {/* Grid roads */}
        {[0,1,2,3,4,5,6].map(i => <rect key={`h${i}`} x="0" y={i*40} width="400" height="4" fill="#CBD5E1" opacity="0.5" />)}
        {[0,1,2,3,4,5,6,7,8,9,10].map(i => <rect key={`v${i}`} x={i*40} y="0" width="4" height="250" fill="#CBD5E1" opacity="0.5" />)}
        {/* Blocks */}
        {[[44,4,36,36],[84,4,36,76],[124,4,36,36],[44,44,76,36],[164,4,36,36],
          [44,84,76,36],[124,44,76,76],[204,4,36,36],[44,124,36,36],[84,124,36,36],
          [164,44,36,76],[204,44,36,76],[244,4,76,76],[164,124,116,36]
        ].map(([x,y,w,h],i) => <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#94A3B8" opacity="0.2" />)}
        {/* Parking lot highlight */}
        <rect x="164" y="84" width="76" height="36" rx="6" fill="#2563EB" opacity="0.15" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 2" />
        {/* Parking pin */}
        <circle cx="202" cy="102" r="16" fill="#2563EB" />
        <circle cx="202" cy="102" r="12" fill="white" />
        <circle cx="202" cy="102" r="8" fill="#2563EB" />
        <text x="202" y="106" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">P</text>
        {/* Other pins */}
        <circle cx="88" cy="42" r="10" fill="#14B8A6" opacity="0.9" />
        <text x="88" y="46" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">P</text>
        <circle cx="268" cy="42" r="10" fill="#F59E0B" opacity="0.9" />
        <text x="268" y="46" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">P</text>
        {/* User location */}
        <circle cx="130" cy="120" r="8" fill="#2563EB" opacity="0.2" />
        <circle cx="130" cy="120" r="5" fill="#2563EB" />
        <circle cx="130" cy="120" r="2.5" fill="white" />
        {/* Scale bar */}
        <rect x="20" y="230" width="60" height="2" rx="1" fill="#94A3B8" />
        <text x="50" y="244" textAnchor="middle" fill="#94A3B8" fontSize="8">0.5 mi</text>
      </svg>
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        {["+","−","⌖"].map((sym, i) => (
          <div key={i} className="w-8 h-8 bg-card/90 backdrop-blur-sm rounded-lg border border-border flex items-center justify-center text-sm font-medium text-foreground cursor-pointer hover:bg-card transition-colors shadow-sm">
            {sym}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Auth Layout ──────────────────────────────────────────────────────────────
function AuthLayout({ children, nav }: { children: React.ReactNode; nav: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <button onClick={() => nav("landing")} className="flex items-center gap-2 mb-8 group">
          <div className="w-9 h-9 bg-primary rounded-[11px] flex items-center justify-center shadow-sm shadow-blue-500/30">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-lg">ParkHere</span>
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ nav }: { nav: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleLogin = async () => {
    if (!email || !pass) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.login({ email, password: pass });
      nav("dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify your email.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout nav={nav}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Crd p={false} className="p-8">
          <h1 className="text-xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your ParkHere account</p>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-[12px] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Inp label="Email address" placeholder="you@example.com" type="email" value={email} onChange={setEmail} icon={<Mail className="w-4 h-4" />} />
            <Inp label="Password" placeholder="Enter your password" type="password" value={pass} onChange={setPass} icon={<Lock className="w-4 h-4" />} />
            <div className="flex justify-end -mt-1">
              <button onClick={() => nav("forgot")} className="text-xs text-primary hover:text-blue-700 transition-colors">Forgot password?</button>
            </div>
            <Btn variant="primary" size="lg" full onClick={handleLogin} loading={loading}>Sign in</Btn>
          </div>
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or continue with</span><div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Btn variant="outline" size="md">
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </Btn>
            <Btn variant="outline" size="md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Apple
            </Btn>
          </div>
        </Crd>
        <p className="text-center text-sm text-muted-foreground mt-4">
          No account?{" "}<button onClick={() => nav("register")} className="text-primary font-medium hover:text-blue-700 transition-colors">Create one</button>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

// ─── Register Screen ──────────────────────────────────────────────────────────
function RegisterScreen({ nav }: { nav: (s: Screen) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.register({ firstName, lastName, email, phone, password });
      localStorage.setItem("parkhere_reg_email", email);
      nav("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout nav={nav}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Crd p={false} className="p-8">
          <h1 className="text-xl font-bold text-foreground mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join 200,000+ smart parkers today</p>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-[12px] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Inp label="First name" placeholder="Sarah" value={firstName} onChange={setFirstName} />
              <Inp label="Last name" placeholder="Chen" value={lastName} onChange={setLastName} />
            </div>
            <Inp label="Email" placeholder="you@example.com" type="email" value={email} onChange={setEmail} icon={<Mail className="w-4 h-4" />} />
            <Inp label="Phone" placeholder="+91 98765 43210" type="tel" value={phone} onChange={setPhone} icon={<Phone className="w-4 h-4" />} />
            <Inp label="Password" placeholder="Create a strong password" type="password" value={password} onChange={setPassword} icon={<Lock className="w-4 h-4" />} note="Min. 8 characters with a number" />
            <Btn variant="primary" size="lg" full onClick={handleRegister} loading={loading}>Create account</Btn>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            By signing up you agree to our{" "}<a href="#" className="text-primary">Terms</a>{" "}and{" "}<a href="#" className="text-primary">Privacy Policy</a>
          </p>
        </Crd>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}<button onClick={() => nav("login")} className="text-primary font-medium">Sign in</button>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

// ─── OTP Screen ───────────────────────────────────────────────────────────────
function OTPScreen({ nav }: { nav: (s: Screen) => void }) {
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const email = localStorage.getItem("parkhere_reg_email") || "";
  
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit OTP code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.verifyEmail(email, code);
      nav("auth-success");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout nav={nav}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Crd p={false} className="p-8 text-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-[18px] flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">Check your phone</h1>
          <p className="text-sm text-muted-foreground mb-6">We sent a 6-digit code to {email || "your registered email"}</p>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-[12px] text-xs flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-2.5 justify-center mb-6">
            {otp.map((v, i) => (
              <input key={i} type="text" inputMode="numeric" maxLength={1} value={v}
                onChange={e => { 
                  const n = [...otp]; 
                  n[i] = e.target.value; 
                  setOtp(n);
                  // Auto focus next input
                  if (e.target.value && e.target.nextSibling) {
                    (e.target.nextSibling as HTMLInputElement).focus();
                  }
                }}
                className={cn("w-11 h-12 text-center text-lg font-bold rounded-[12px] border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all", v ? "border-primary/60 bg-primary/5" : "border-border")} />
            ))}
          </div>
          <Btn variant="primary" size="lg" full onClick={handleVerify} loading={loading}>Verify code</Btn>
          <button className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Didn&apos;t receive it? <span className="text-primary font-medium">Resend in 0:48</span>
          </button>
        </Crd>
      </motion.div>
    </AuthLayout>
  );
}

// ─── Auth Success ─────────────────────────────────────────────────────────────
function AuthSuccess({ nav }: { nav: (s: Screen) => void }) {
  const user = authService.getCurrentUser();
  const name = user ? user.firstName : "there";
  useEffect(() => { const t = setTimeout(() => nav("dashboard"), 2500); return () => clearTimeout(t); }, [nav]);
  return (
    <AuthLayout nav={nav}>
      <div className="text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re all set!</h1>
          <p className="text-muted-foreground mb-6">Welcome to ParkHere, {name}. Taking you to your dashboard...</p>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    </AuthLayout>
  );
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
function ForgotScreen({ nav }: { nav: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset code. Email not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!token || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.resetPassword(token, password);
      setSuccess("Password reset successfully. Redirecting to login...");
      setTimeout(() => nav("login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired reset token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout nav={nav}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button onClick={() => nav("login")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to sign in
        </button>
        <Crd p={false} className="p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-[12px] text-xs flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 p-3 rounded-[12px] text-xs flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          {sent ? (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground mb-1 text-center">Reset your password</h1>
              <p className="text-sm text-muted-foreground mb-6 text-center">Enter the reset code sent to your email.</p>
              <Inp label="Reset Code" placeholder="Enter code" value={token} onChange={setToken} icon={<Key className="w-4 h-4" />} />
              <Inp label="New Password" placeholder="Create a strong password" type="password" value={password} onChange={setPassword} icon={<Lock className="w-4 h-4" />} />
              <Btn variant="primary" size="lg" full onClick={handleReset} loading={loading}>Reset Password</Btn>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-foreground mb-1">Reset password</h1>
              <p className="text-sm text-muted-foreground mb-6">Enter your email and we&apos;ll send a reset link.</p>
              <div className="space-y-4">
                <Inp label="Email address" placeholder="you@example.com" type="email" value={email} onChange={setEmail} icon={<Mail className="w-4 h-4" />} />
                <Btn variant="primary" size="lg" full onClick={handleSend} loading={loading}>Send reset link</Btn>
              </div>
            </>
          )}
        </Crd>
      </motion.div>
    </AuthLayout>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell({ children, nav, screen, dark, setDark }: {
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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn("hidden md:flex flex-col w-60 bg-sidebar border-r border-sidebar-border flex-shrink-0")}>
        <div className="p-5 flex items-center gap-2.5 border-b border-sidebar-border">
          <img src="/logo.png" alt="ParkHere Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-sidebar-foreground">ParkHere</span>
          {isAdmin && <Bdg label="Admin" type="warning" />}
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map(({ icon, label, s }) => (
            <button key={s} onClick={() => nav(s)}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-150",
                screen === s ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
              {icon}{label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <button onClick={() => nav(isAdmin ? "dashboard" : "admin")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-150">
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
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-150">
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
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <button onClick={() => nav("profile")} className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">{initials}</button>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
              <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="ParkHere Logo" className="w-8 h-8 object-contain" />
                  <span className="font-bold text-sidebar-foreground">ParkHere</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {items.map(({ icon, label, s }) => (
                  <button key={s} onClick={() => { nav(s); setMobileOpen(false); }}
                    className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all", screen === s ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50")}>
                    {icon}{label}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-sidebar-border">
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500">
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
                <button onClick={() => setNotifOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n, i) => {
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
                <button onClick={handleMarkAllAsRead} className="w-full text-center text-xs font-semibold text-primary py-2.5 hover:bg-muted/50 border-t border-border block transition-colors">
                  Mark all as read
                </button>
              )}
            </Crd>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
          <div className="mx-4 mb-4">
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-[20px] shadow-xl px-2 py-2 flex items-center justify-around">
              {items.map(({ icon, label, s }) => (
                <button key={s} onClick={() => nav(s)} className={cn("flex flex-col items-center gap-1 px-3 py-1.5 rounded-[14px] transition-all duration-150",
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ nav }: { nav: (s: Screen) => void }) {
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, hoursSaved: 0, totalSpent: 0, nearbyLots: 0 });
  const [loading, setLoading] = useState(true);

  const currentUser = authService.getCurrentUser();
  const firstName = currentUser ? currentUser.firstName : "Smart Parker";

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const bookingsList = await bookingService.getMyBookings();
        // Sort bookings by creation date descending
        const sortedBookings = bookingsList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentBookings(sortedBookings);

        const active = sortedBookings.find((b: any) => b.status === "ACTIVE" || b.status === "CONFIRMED");
        setActiveBooking(active);

        // Fetch lots
        const lotsList = await lotService.searchLots();
        setLots(lotsList);

        // Calculate stats
        const total = sortedBookings.length;
        const totalSpentVal = sortedBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
        const hours = sortedBookings.reduce((sum: number, b: any) => {
          const diff = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
          return sum + Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
        }, 0);

        setStats({
          totalBookings: total,
          hoursSaved: hours,
          totalSpent: Math.round(totalSpentVal),
          nearbyLots: lotsList.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{todayStr} · Bangalore, India</p>
          <h1 className="text-2xl font-bold text-foreground">Good afternoon, {firstName} 👋</h1>
        </div>
        <div className="flex items-center gap-3">
          <Crd className="flex items-center gap-2.5 px-4 py-2.5">
            <div className="text-2xl">☀️</div>
            <div>
              <p className="text-sm font-semibold text-foreground">28°C</p>
              <p className="text-xs text-muted-foreground">Clear skies</p>
            </div>
          </Crd>
          <Btn variant="primary" size="md" onClick={() => nav("search")} icon={<Search className="w-4 h-4" />}>Find Parking</Btn>
        </div>
      </div>

      {/* Active Booking */}
      {activeBooking ? (
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-16" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-[14px] flex items-center justify-center flex-shrink-0">
                <CircleParking className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">ACTIVE BOOKING</span>
                  <span className="text-xs bg-green-400/30 text-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Live
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-0.5">{activeBooking.parkingLotName}</h2>
                <p className="text-blue-100 text-sm">
                  Slot {activeBooking.slotNumber} · {activeBooking.floorName} · {new Date(activeBooking.startTime).toLocaleTimeString("en-IN", {hour: '2-digit', minute:'2-digit'})} – {new Date(activeBooking.endTime).toLocaleTimeString("en-IN", {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
            <div className="flex flex-col md:items-end gap-3">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-blue-200">Total Paid</p>
                  <p className="text-2xl font-bold">₹{activeBooking.totalAmount}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Btn variant="ghost" size="sm" className="bg-white/15 text-white hover:bg-white/25" onClick={() => {
                  localStorage.setItem("parkhere_current_booking", JSON.stringify(activeBooking));
                  nav("booking-confirmation");
                }} icon={<QrCode className="w-3.5 h-3.5" />}>QR Receipt</Btn>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-16" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-[14px] flex items-center justify-center flex-shrink-0">
                <CircleParking className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">Find and book parking slots instantly in your city.</h2>
                <p className="text-blue-100 text-sm">Real-time availability, secure digital validation, and zero waiting time.</p>
              </div>
            </div>
            <div>
              <Btn variant="ghost" size="md" className="bg-white text-indigo-600 hover:bg-white/90" onClick={() => nav("search")} icon={<Search className="w-4 h-4" />}>Find Parking Lot</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={String(stats.totalBookings)} change="+8" icon={<Bookmark className="w-5 h-5" />} color="blue" />
        <StatCard label="Hours Saved" value={`${stats.hoursSaved}h`} sub="vs searching manually" icon={<Clock className="w-5 h-5" />} color="teal" />
        <StatCard label="Total Spent" value={`₹${stats.totalSpent}`} sub="this month" icon={<IndianRupee className="w-5 h-5" />} color="green" />
        <StatCard label="Nearby Lots" value={String(stats.nearbyLots)} sub="within Bangalore" icon={<MapPin className="w-5 h-5" />} color="amber" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Search className="w-5 h-5" />, label: "Find Parking", s: "search" as Screen, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
            { icon: <History className="w-5 h-5" />, label: "My Bookings", s: "history" as Screen, color: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400" },
            { icon: <Car className="w-5 h-5" />, label: "My Vehicles", s: "profile" as Screen, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
            { icon: <CreditCard className="w-5 h-5" />, label: "Payments", s: "profile" as Screen, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
          ].map(({ icon, label, s, color }) => (
            <Crd key={label} onClick={() => nav(s)} className="flex flex-col items-center gap-3 p-5 text-center cursor-pointer hover:shadow-md transition-all">
              <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center", color)}>{icon}</div>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </Crd>
          ))}
        </div>
      </div>

      {/* Nearby + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Nearby Parking</h2>
            <button onClick={() => nav("search")} className="text-sm text-primary hover:text-blue-700 flex items-center gap-1 transition-colors">See all <ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            {lots.slice(0, 3).map(lot => {
              const totalSlots = 20;
              const availableSlots = (Number(lot.id) * 3 + 2) % 15 + 1;
              const pct = availableSlots / totalSlots;
              return (
                <Crd key={lot.id} onClick={() => {
                  localStorage.setItem("parkhere_selected_lot", JSON.stringify(lot));
                  nav("details");
                }} className="flex items-center gap-4 p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="w-16 h-16 rounded-[12px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">🏬</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{lot.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{lot.address.split(',')[0]} · ₹{lot.pricePerHour || 50}/hr</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div className={cn("h-full rounded-full", pct > 0.3 ? "bg-green-500" : pct > 0.1 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${pct * 100}%` }} />
                      </div>
                      <span className={cn("text-xs font-medium", pct > 0.3 ? "text-green-500" : pct > 0.1 ? "text-amber-500" : "text-red-500")}>{availableSlots} free</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Crd>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Bookings</h2>
            <button onClick={() => nav("history")} className="text-sm text-primary hover:text-blue-700 flex items-center gap-1 transition-colors">All <ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            {recentBookings.slice(0, 4).map(b => (
              <Crd key={b.id} onClick={() => {
                localStorage.setItem("parkhere_current_booking", JSON.stringify(b));
                nav("booking-confirmation");
              }} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:shadow-sm transition-all">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", b.status === "ACTIVE" ? "bg-green-500" : b.status === "COMPLETED" ? "bg-blue-400" : "bg-red-400")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{b.parkingLotName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(b.startTime).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">₹{b.totalAmount}</span>
              </Crd>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Search Screen ────────────────────────────────────────────────────────────
function SearchScreen({ nav }: { nav: (s: Screen) => void }) {
  const [query, setQuery] = useState("");
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"grid"|"list">("grid");
  const [priceRange, setPriceRange] = useState(200);
  const [evOnly, setEvOnly] = useState(false);
  const [coveredOnly, setCoveredOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("distance");
  const [vehicleType, setVehicleType] = useState("car");

  const performSearch = async () => {
    setLoading(true);
    try {
      const results = await lotService.searchLots(query);
      setLots(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const handleSearchClick = () => {
    performSearch();
  };

  const filteredLots = lots.filter(lot => {
    const price = lot.pricePerHour || lot.price || 50;
    const tags = lot.amenities || lot.tags || [];
    if (price > priceRange) return false;
    if (evOnly && !tags.some((t: string) => t.toLowerCase().includes("ev") || t.toLowerCase().includes("charging"))) return false;
    if (coveredOnly && !tags.some((t: string) => t.toLowerCase().includes("covered") || t.toLowerCase().includes("indoor"))) return false;
    return true;
  });

  const sortedLots = [...filteredLots].sort((a, b) => {
    if (sort === "price") {
      return (a.pricePerHour || a.price || 0) - (b.pricePerHour || b.price || 0);
    }
    return a.id - b.id;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Search bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64 flex items-center gap-3 bg-card border border-border rounded-[16px] px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none" placeholder="Search location (e.g. Banjara Hills, Whitefield)..." />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-[16px] px-4 py-3 shadow-sm cursor-pointer hover:border-primary/30 transition-all">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Today</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-[16px] px-4 py-3 shadow-sm cursor-pointer hover:border-primary/30 transition-all">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">2:00 – 5:00 PM</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        <Btn variant="primary" size="md" onClick={handleSearchClick} loading={loading} icon={<Search className="w-4 h-4" />}>Search</Btn>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Btn variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} icon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
          Filters {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Btn>
        {[
          { label: "EV Charging", active: evOnly, toggle: () => setEvOnly(!evOnly) },
          { label: "Covered", active: coveredOnly, toggle: () => setCoveredOnly(!coveredOnly) },
        ].map(f => (
          <button key={f.label} onClick={f.toggle}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
              f.active ? "bg-primary text-white border-primary" : "bg-card text-foreground border-border hover:border-primary/40")}>
            {f.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30">
            <option value="distance">Distance</option>
            <option value="price">Price</option>
          </select>
        </div>
        <div className="flex border border-border rounded-xl overflow-hidden">
          <button onClick={() => setView("grid")} className={cn("p-2 transition-colors", view === "grid" ? "bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted")}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={cn("p-2 transition-colors", view === "list" ? "bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted")}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}>
          <Crd className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Vehicle Type</p>
                <div className="space-y-2">
                  {["Car", "SUV", "Bike", "EV"].map(v => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="radio" name="vehicle" value={v.toLowerCase()} checked={vehicleType === v.toLowerCase()} onChange={() => setVehicleType(v.toLowerCase())} className="accent-primary" />
                      <span className="text-sm text-foreground">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Max Price / hour</p>
                <div className="space-y-3">
                  <input type="range" min={10} max={300} step={10} value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} className="w-full accent-primary" />
                  <p className="text-sm font-semibold text-primary">Up to ₹{priceRange}/hr</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Amenities</p>
                <div className="space-y-2">
                  {[
                    { label: "EV Charging", v: evOnly, set: setEvOnly },
                    { label: "Covered Parking", v: coveredOnly, set: setCoveredOnly },
                  ].map(({ label, v, set }) => (
                    <label key={label} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={v} onChange={e => set(e.target.checked)} className="accent-primary rounded" />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="mt-5 flex gap-2">
                  <Btn variant="primary" size="sm" onClick={() => setShowFilters(false)} full>Apply</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => { setEvOnly(false); setCoveredOnly(false); setPriceRange(200); }} full>Reset</Btn>
                </div>
              </div>
            </div>
          </Crd>
        </motion.div>
      )}

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{sortedLots.length}</span> parking spots found</p>
      </div>

      {sortedLots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">No parking lots found matching your filters.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedLots.map(lot => (
            <ParkingCard key={lot.id} lot={lot} onClick={() => {
              localStorage.setItem("parkhere_selected_lot", JSON.stringify(lot));
              nav("details");
            }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLots.map(lot => {
            const totalSlots = 20;
            const availableSlots = (Number(lot.id) * 3 + 2) % 15 + 1;
            const pct = availableSlots / totalSlots;
            const price = lot.pricePerHour || lot.price || 50;
            const tags = lot.amenities || lot.tags || ["EV Charging", "Covered"];
            return (
              <Crd key={lot.id} onClick={() => {
                localStorage.setItem("parkhere_selected_lot", JSON.stringify(lot));
                nav("details");
              }} className="flex gap-4 p-4 items-center cursor-pointer hover:shadow-md transition-all">
                <div className="w-24 h-20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl rounded-[14px] flex-shrink-0">🏬</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-foreground">{lot.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{lot.address} · {lot.distance || "0.8 km"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{price}<span className="text-xs font-normal text-muted-foreground">/hr</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="font-medium">4.8</span><span className="text-muted-foreground">(42)</span></div>
                    <span className={cn("text-xs font-semibold", pct > 0.3 ? "text-green-500" : pct > 0.1 ? "text-amber-500" : "text-red-500")}>{availableSlots}/{totalSlots} available</span>
                    {tags.map((t: string) => <Bdg key={t} label={t} type="muted" />)}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </Crd>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Parking Details ──────────────────────────────────────────────────────────
function DetailsScreen({ nav }: { nav: (s: Screen) => void }) {
  const lotStr = localStorage.getItem("parkhere_selected_lot");
  const lot = lotStr ? JSON.parse(lotStr) : null;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromTime, setFromTime] = useState("14:00");
  const [untilTime, setUntilTime] = useState("17:00");

  if (!lot) {
    return <div className="p-8 text-center text-muted-foreground">No parking lot selected. Please search first.</div>;
  }

  const price = lot.pricePerHour || lot.price || 50;
  const tags = lot.amenities || lot.tags || ["EV Charging", "Covered"];
  const address = lot.address || "Bangalore";
  const rating = lot.rating || 4.8;
  const reviewsCount = lot.reviews || 42;
  const total = lot.total || 20;
  const available = lot.available !== undefined ? lot.available : ((Number(lot.id) * 3 + 2) % 15 + 1);

  // Calculate duration
  const [h1, m1] = fromTime.split(":").map(Number);
  const [h2, m2] = untilTime.split(":").map(Number);
  const durationHours = Math.max(1, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);

  const baseAmount = price * durationHours;
  const taxAmount = baseAmount * 0.18; // 18% GST (CGST 9% + SGST 9%)
  const totalAmount = baseAmount + taxAmount;

  const handleChooseSlot = () => {
    // Construct ISO strings for start and end times
    const startTimeIso = `${date}T${fromTime}:00`;
    const endTimeIso = `${date}T${untilTime}:00`;
    localStorage.setItem("parkhere_booking_start", startTimeIso);
    localStorage.setItem("parkhere_booking_end", endTimeIso);
    localStorage.setItem("parkhere_base_amount", String(baseAmount));
    localStorage.setItem("parkhere_tax_amount", String(taxAmount));
    localStorage.setItem("parkhere_total_amount", String(totalAmount));
    nav("slots");
  };

  const reviews = [
    { name: "Rahul S.", avatar: "RS", rating: 5, date: "Dec 5", text: "Incredibly smooth experience. Found my spot instantly, QR code worked perfectly. Staff was also very helpful." },
    { name: "Priya P.", avatar: "PP", rating: 4, date: "Nov 28", text: "Great location and very clean. Slightly pricey but worth it for the peace of mind. EV charger worked great." },
    { name: "Akash R.", avatar: "AR", rating: 5, date: "Nov 20", text: "Highly secure, well-lit, and the app integration is seamless. Truly premium service." },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      <button onClick={() => nav("search")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ChevronLeft className="w-4 h-4" />Back to results
      </button>

      {/* Hero */}
      <div className="relative h-64 md:h-80 rounded-[20px] overflow-hidden bg-muted">
        <img src={lot.image || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80"} alt={lot.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <div className="flex gap-2 mb-2">
            {tags.map((t: string) => <span key={t} className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-0.5 rounded-full">{t}</span>)}
          </div>
          <h1 className="text-2xl font-bold">{lot.name}</h1>
          <p className="text-white/80 text-sm mt-0.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{address}</p>
        </div>
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-foreground shadow-sm">
          ₹{price}/hr
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Key info */}
          <Crd className="grid grid-cols-3 gap-px bg-border overflow-hidden">
            {[
              { icon: <Car className="w-5 h-5" />, label: "Distance", value: lot.distance || "0.8 km", color: "text-blue-500" },
              { icon: <Star className="w-5 h-5 fill-amber-400 text-amber-400" />, label: "Rating", value: `${rating} (${reviewsCount})`, color: "text-amber-400" },
              { icon: <CheckCircle className="w-5 h-5" />, label: "Available", value: `${available} of ${total}`, color: "text-green-500" },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="bg-card flex flex-col items-center gap-2 p-5 text-center">
                <div className={cn("w-10 h-10 rounded-[12px] bg-muted flex items-center justify-center", color)}>{icon}</div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </Crd>

          {/* Amenities */}
          <div>
            <h2 className="font-semibold text-foreground mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <BatteryCharging className="w-4 h-4" />, label: "EV Charging", color: "text-green-500" },
                { icon: <Shield className="w-4 h-4" />, label: "24/7 Security", color: "text-blue-500" },
                { icon: <Wifi className="w-4 h-4" />, label: "Free Wi-Fi", color: "text-teal-500" },
                { icon: <Building2 className="w-4 h-4" />, label: "Covered Parking", color: "text-purple-500" },
                { icon: <Accessibility className="w-4 h-4" />, label: "Accessible Spots", color: "text-amber-500" },
                { icon: <Coffee className="w-4 h-4" />, label: "Nearby Café", color: "text-rose-500" },
              ].map(({ icon, label, color }) => (
                <div key={label} className="flex items-center gap-3 bg-muted/50 rounded-[14px] px-4 py-3">
                  <div className={cn("w-8 h-8 rounded-[10px] bg-card flex items-center justify-center shadow-sm", color)}>{icon}</div>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <Check className="w-4 h-4 text-green-500 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <h2 className="font-semibold text-foreground mb-4">Location</h2>
            <div style={{ height: 200 }}><MapPlaceholder /></div>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Navigation className="w-4 h-4 text-primary" />
              <span>Walking distance: ~4 min (0.3 km from entrance)</span>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Reviews</h2>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{rating}</span>
                <span className="text-sm text-muted-foreground">({reviewsCount} reviews)</span>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map(r => (
                <Crd key={r.name} className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{r.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                </Crd>
              ))}
            </div>
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="space-y-4">
          <Crd p className="sticky top-6 space-y-4">
            <h2 className="font-semibold text-foreground">Reserve this spot</h2>
            <Inp label="Date" type="date" value={date} onChange={setDate} icon={<Calendar className="w-4 h-4" />} />
            <div className="grid grid-cols-2 gap-3">
              <Inp label="From" type="time" value={fromTime} onChange={setFromTime} />
              <Inp label="Until" type="time" value={untilTime} onChange={setUntilTime} />
            </div>
            <div className="bg-muted/50 rounded-[14px] p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Rate</span><span className="text-foreground">₹{price}/hr</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="text-foreground">{durationHours.toFixed(1)} hours</span></div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="text-foreground">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between font-semibold text-foreground"><span>Total</span><span>₹{totalAmount.toFixed(2)}</span></div>
            </div>
            <Btn variant="primary" size="lg" full onClick={handleChooseSlot}>
              Choose Slot <ArrowRight className="w-4 h-4" />
            </Btn>
            <p className="text-xs text-center text-muted-foreground">Free cancellation up to 1 hour before</p>
          </Crd>
        </div>
      </div>
    </div>
  );
}

// ─── Slot Selection ───────────────────────────────────────────────────────────
function SlotSelection({ nav }: { nav: (s: Screen) => void }) {
  const lotStr = localStorage.getItem("parkhere_selected_lot");
  const lot = lotStr ? JSON.parse(lotStr) : null;
  const startTime = localStorage.getItem("parkhere_booking_start") || "";
  const endTime = localStorage.getItem("parkhere_booking_end") || "";

  const [floors, setFloors] = useState<any[]>([]);
  const [selectedFloorIdx, setSelectedFloorIdx] = useState(0);
  const [slotsGrid, setSlotsGrid] = useState<any[][]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotObj, setSelectedSlotObj] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const price = lot ? (lot.pricePerHour || lot.price || 50) : 50;
  const baseAmountStr = localStorage.getItem("parkhere_base_amount") || "0";
  const taxAmountStr = localStorage.getItem("parkhere_tax_amount") || "0";
  const totalAmountStr = localStorage.getItem("parkhere_total_amount") || "0";
  const totalAmount = parseFloat(totalAmountStr);

  useEffect(() => {
    if (!lot) return;
    const fetchFloorsAndSlots = async () => {
      setLoading(true);
      try {
        const floorsList = await lotService.getLotFloors(lot.id);
        setFloors(floorsList);
        if (floorsList.length > 0) {
          const selectedFloor = floorsList[selectedFloorIdx] || floorsList[0];
          const slotsList = await lotService.getSlotsAvailability(selectedFloor.id, startTime, endTime);
          
          // Group slots by row character (A, B, C etc.)
          const rowsMap: Record<string, any[]> = {};
          slotsList.forEach((s: any) => {
            const rowChar = s.slotNumber.charAt(0).toUpperCase();
            if (!rowsMap[rowChar]) rowsMap[rowChar] = [];
            rowsMap[rowChar].push({
              id: s.id,
              slotNumber: s.slotNumber,
              status: s.status === "AVAILABLE" ? (s.type === "EV" ? "ev" : s.type === "ACCESSIBLE" ? "accessible" : "available") : "occupied",
              backendSlot: s
            });
          });

          // Convert rowsMap to sorted array of rows
          const sortedRowKeys = Object.keys(rowsMap).sort();
          const grid = sortedRowKeys.map(k => {
            return rowsMap[k].sort((a: any, b: any) => a.slotNumber.localeCompare(b.slotNumber));
          });
          setSlotsGrid(grid);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFloorsAndSlots();
  }, [lot, selectedFloorIdx, startTime, endTime]);

  const handleSelect = (slotObj: any) => {
    if (slotObj.status === "occupied" || slotObj.status === "reserved" || slotObj.status === "disabled") return;
    
    if (selectedSlot === slotObj.slotNumber) {
      setSelectedSlot(null);
      setSelectedSlotObj(null);
    } else {
      setSelectedSlot(slotObj.slotNumber);
      setSelectedSlotObj(slotObj.backendSlot);
    }
  };

  const handleConfirmSlot = () => {
    if (!selectedSlotObj) return;
    localStorage.setItem("parkhere_selected_slot_id", String(selectedSlotObj.id));
    localStorage.setItem("parkhere_selected_slot_number", selectedSlotObj.slotNumber);
    localStorage.setItem("parkhere_selected_floor_name", floors[selectedFloorIdx]?.floorName || "Ground Floor");
    nav("booking");
  };

  const slotColors: Record<string, string> = {
    available: "bg-blue-100 border-blue-200 text-blue-500 hover:bg-blue-200 hover:border-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40",
    occupied: "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-60",
    reserved: "bg-amber-100 border-amber-200 text-amber-500 cursor-not-allowed dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
    selected: "bg-primary border-primary text-white shadow-md shadow-primary/30",
    disabled: "bg-muted/50 border-dashed border-muted-foreground/20 text-muted-foreground/30 cursor-not-allowed",
    ev: "bg-green-100 border-green-200 text-green-500 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
    accessible: "bg-teal-100 border-teal-200 text-teal-500 hover:bg-teal-200 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-400",
  };

  const legend = [
    { label: "Available", color: "bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800" },
    { label: "Selected", color: "bg-primary border-primary" },
    { label: "Occupied", color: "bg-muted border-border opacity-60" },
    { label: "EV Only", color: "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800" },
    { label: "Accessible", color: "bg-teal-100 border-teal-200 dark:bg-teal-900/30 dark:border-teal-800" },
  ];

  if (!lot) {
    return <div className="p-8 text-center text-muted-foreground">No parking lot selected. Please search first.</div>;
  }

  const availableSlotsCount = slotsGrid.flat().filter(s => s.status === "available" || s.status === "ev" || s.status === "accessible").length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <button onClick={() => nav("details")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" />Back to details
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Choose Your Slot</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{lot.name} · {floors[selectedFloorIdx]?.floorName || "Ground Floor"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{availableSlotsCount} available</span>
          <Bdg label={`${availableSlotsCount} free`} type="success" />
        </div>
      </div>

      {/* Floor selection tabs */}
      {floors.length > 1 && (
        <div className="flex gap-2 border-b border-border pb-3 flex-wrap">
          {floors.map((f, idx) => (
            <button key={f.id} onClick={() => { setSelectedFloorIdx(idx); setSelectedSlot(null); setSelectedSlotObj(null); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all", 
                selectedFloorIdx === idx ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
              {f.floorName}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {legend.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn("w-5 h-5 rounded-[6px] border-2", color)} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Entrance indicator */}
      <div className="relative">
        <div className="flex items-center justify-center mb-3 gap-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-xs text-muted-foreground font-medium">
            <ArrowDown className="w-3 h-3" /> ENTRANCE
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

        {/* Slot grid */}
        <Crd className="p-5 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading slots...</div>
          ) : slotsGrid.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No slots configured for this floor.</div>
          ) : (
            <div className="inline-block min-w-full">
              {slotsGrid.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center gap-2 mb-2 last:mb-0">
                  <div className="w-6 text-xs font-bold text-muted-foreground text-center flex-shrink-0">
                    {row[0]?.slotNumber.charAt(0) || String.fromCharCode(65 + rIdx)}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center flex-1">
                    {row.map((slot) => {
                      const isSelected = selectedSlot === slot.slotNumber;
                      const statusKey = isSelected ? "selected" : slot.status;
                      return (
                        <button key={slot.id} onClick={() => handleSelect(slot)}
                          className={cn("w-10 h-10 md:w-12 md:h-12 rounded-[10px] border-2 flex flex-col items-center justify-center transition-all duration-150 font-mono text-[9px] leading-tight relative",
                            slotColors[statusKey]
                          )}>
                          {slot.status === "ev" && !isSelected && <Zap className="w-2.5 h-2.5 mb-0.5 text-green-500" />}
                          {slot.status === "accessible" && !isSelected && <Accessibility className="w-2.5 h-2.5 mb-0.5 text-teal-500" />}
                          {isSelected && <Check className="w-3 h-3 mb-0.5 text-white" />}
                          {slot.status === "occupied" && <Car className="w-2.5 h-2.5 mb-0.5" />}
                          <span className="font-medium">{slot.slotNumber.split("-")[1] || slot.slotNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Crd>
      </div>

      {/* Selected slot info */}
      <div className={cn("transition-all duration-300", selectedSlot ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none")}>
        {selectedSlot && (
          <Crd className="bg-primary text-white border-primary p-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 bg-white/20 rounded-[14px] flex items-center justify-center flex-shrink-0">
              <CircleParking className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Slot {selectedSlot} selected</p>
              <p className="text-blue-100 text-sm">{lot.name} · {floors[selectedFloorIdx]?.floorName || "Ground Floor"}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-xs text-blue-200">Total</p>
                <p className="font-bold text-xl">₹{totalAmount.toFixed(2)}</p>
              </div>
              <Btn variant="ghost" size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold" onClick={handleConfirmSlot}>
                Confirm Slot <ArrowRight className="w-4 h-4" />
              </Btn>
            </div>
          </Crd>
        )}
      </div>
      {!selectedSlot && (
        <p className="text-center text-sm text-muted-foreground py-4">Tap an available slot to select it</p>
      )}
    </div>
  );
}

// ─── Booking Confirmation ──────────────────────────────────────────────────────
function BookingConfirmation({ nav }: { nav: (s: Screen) => void }) {
  const lotStr = localStorage.getItem("parkhere_selected_lot");
  const lot = lotStr ? JSON.parse(lotStr) : null;
  const slotNumber = localStorage.getItem("parkhere_selected_slot_number");
  const slotId = parseInt(localStorage.getItem("parkhere_selected_slot_id") || "0");
  const floorName = localStorage.getItem("parkhere_selected_floor_name");
  const startTimeStr = localStorage.getItem("parkhere_booking_start") || "";
  const endTimeStr = localStorage.getItem("parkhere_booking_end") || "";
  const baseAmountStr = localStorage.getItem("parkhere_base_amount") || "0";
  const taxAmountStr = localStorage.getItem("parkhere_tax_amount") || "0";
  const totalAmountStr = localStorage.getItem("parkhere_total_amount") || "0";

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleIdx, setSelectedVehicleIdx] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const list = await vehicleService.getMyVehicles();
        setVehicles(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVehicles();
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        parkingSlotId: slotId,
        startTime: startTimeStr,
        endTime: endTimeStr,
        paymentMethod
      };

      const result = await bookingService.createBooking(payload);
      localStorage.setItem("parkhere_confirmed_booking", JSON.stringify(result));
      nav("success");
    } catch (err: any) {
      setError(err.response?.data?.message || "Booking failed. Slot might have been booked concurrently.");
    } finally {
      setLoading(false);
    }
  };

  if (!lot) {
    return <div className="p-8 text-center text-muted-foreground">No lot selected. Please search first.</div>;
  }

  const durationHours = (new Date(endTimeStr).getTime() - new Date(startTimeStr).getTime()) / (1000 * 60 * 60);
  const vehicleText = vehicles[selectedVehicleIdx] 
    ? `${vehicles[selectedVehicleIdx].modelName} (${vehicles[selectedVehicleIdx].registrationNumber})`
    : "AP-39-AB-1234 (Default)";

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto space-y-6">
      <button onClick={() => nav("slots")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" />Back to slot selection
      </button>
      <h1 className="text-xl font-bold text-foreground">Booking Summary</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-[12px] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary card */}
      <Crd className="overflow-hidden">
        <div className="relative h-36 overflow-hidden bg-muted">
          <img src={lot.image || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80"} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <p className="font-bold text-lg">{lot.name}</p>
            <p className="text-sm text-white/80 flex items-center gap-1"><MapPin className="w-3 h-3" />{lot.address}</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          {[
            { icon: <CircleParking className="w-4 h-4 text-blue-500" />, label: "Slot", value: `Slot ${slotNumber} · ${floorName}` },
            { icon: <Calendar className="w-4 h-4 text-teal-500" />, label: "Date", value: new Date(startTimeStr).toLocaleDateString("en-IN") },
            { icon: <Clock className="w-4 h-4 text-purple-500" />, label: "Time", value: `${new Date(startTimeStr).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} – ${new Date(endTimeStr).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` },
            { icon: <Car className="w-4 h-4 text-amber-500" />, label: "Vehicle", value: vehicleText },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0">{icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Crd>

      {/* Vehicles Selection if available */}
      {vehicles.length > 1 && (
        <Crd p>
          <h2 className="font-semibold text-foreground mb-2">Select Vehicle</h2>
          <div className="flex gap-2 flex-wrap">
            {vehicles.map((v, idx) => (
              <button key={v.id} onClick={() => setSelectedVehicleIdx(idx)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                  selectedVehicleIdx === idx ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground hover:bg-muted/30")}>
                {v.registrationNumber} ({v.modelName})
              </button>
            ))}
          </div>
        </Crd>
      )}

      {/* Pricing */}
      <Crd p>
        <h2 className="font-semibold text-foreground mb-4">Price Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: "Parking rate", value: `₹${lot.pricePerHour || lot.price || 50}/hr` },
            { label: "Duration", value: `${durationHours.toFixed(1)} hours` },
            { label: "Subtotal", value: `₹${parseFloat(baseAmountStr).toFixed(2)}` },
            { label: "GST (18%)", value: `₹${parseFloat(taxAmountStr).toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
          <div className="h-px bg-border" />
          <div className="flex justify-between font-bold text-foreground">
            <span>Total</span><span className="text-primary text-lg">₹{parseFloat(totalAmountStr).toFixed(2)}</span>
          </div>
        </div>
      </Crd>

      {/* Payment */}
      <Crd p>
        <h2 className="font-semibold text-foreground mb-3">Payment Method</h2>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
          className="w-full text-sm bg-muted/50 border border-border rounded-[14px] p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="UPI">Google Pay / PhonePe (UPI)</option>
          <option value="PAYTM">Paytm Wallet</option>
          <option value="CARD">Credit / Debit Card</option>
          <option value="NETBANKING">Net Banking</option>
        </select>
      </Crd>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
        Your payment is protected with secure UPI validation
      </div>

      <Btn variant="primary" size="xl" full onClick={handleConfirm} loading={loading}
        icon={<Lock className="w-4 h-4" />}>
        Confirm & Pay ₹{parseFloat(totalAmountStr).toFixed(2)}
      </Btn>
    </div>
  );
}

// ─── Booking Success ──────────────────────────────────────────────────────────
function BookingSuccess({ nav }: { nav: (s: Screen) => void }) {
  const bookingStr = localStorage.getItem("parkhere_confirmed_booking");
  const booking = bookingStr ? JSON.parse(bookingStr) : null;

  if (!booking) {
    return <div className="p-8 text-center text-muted-foreground">No confirmed booking found.</div>;
  }

  const handleDownloadQr = () => {
    // Standard base64 downloader trigger
    const link = document.createElement("a");
    link.href = booking.qrCode;
    link.download = `parkhere_booking_${booking.id}.png`;
    link.click();
  };

  return (
    <div className="p-6 md:p-8 max-w-lg mx-auto text-center space-y-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.1 }}
        className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground">Your parking spot has been reserved. See you at the garage!</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <Crd className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Booking ID</p>
              <p className="font-mono font-bold text-foreground text-sm">BK-{booking.id}</p>
            </div>
            <Bdg label="Confirmed" type="success" />
          </div>
          <div className="flex justify-center">
            {booking.qrCode ? (
              <img src={booking.qrCode} alt="Booking QR Code" className="w-[180px] h-[180px] object-contain border border-border p-2 rounded-xl bg-white" />
            ) : (
              <QRCode size={180} />
            )}
          </div>
          <div className="text-xs text-muted-foreground text-center">Scan at entry & exit gates</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Location", value: booking.parkingLotName },
              { label: "Slot", value: `${booking.slotNumber} (${booking.floorName})` },
              { label: "Date", value: new Date(booking.startTime).toLocaleDateString("en-IN") },
              { label: "Time", value: `${new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} – ${new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-[12px] p-3 text-left">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="font-medium text-foreground text-xs truncate">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Btn variant="outline" size="sm" onClick={handleDownloadQr} icon={<Download className="w-3.5 h-3.5" />}>QR Code</Btn>
            <Btn variant="outline" size="sm" icon={<Calendar className="w-3.5 h-3.5" />}>Calendar</Btn>
            <Btn variant="secondary" size="sm" icon={<Navigation className="w-3.5 h-3.5" />}>Navigate</Btn>
          </div>
        </Crd>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex gap-3">
        <Btn variant="outline" size="lg" full onClick={() => nav("history")}>View all bookings</Btn>
        <Btn variant="primary" size="lg" full onClick={() => nav("dashboard")}>Go to dashboard</Btn>
      </motion.div>
    </div>
  );
}

// ─── Booking History ──────────────────────────────────────────────────────────
function BookingHistory({ nav }: { nav: (s: Screen) => void }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const list = await bookingService.getMyBookings();
        const sortedList = list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookings(sortedList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const statusMap: Record<string, { label: string; type: "success"|"default"|"danger"|"muted" }> = {
    ACTIVE: { label: "Active", type: "success" },
    CONFIRMED: { label: "Confirmed", type: "success" },
    COMPLETED: { label: "Completed", type: "default" },
    CANCELLED: { label: "Cancelled", type: "danger" },
  };

  const filtered = bookings.filter(b => {
    const term = search.toLowerCase();
    const matchesSearch = b.parkingLotName.toLowerCase().includes(term) || b.slotNumber.toLowerCase().includes(term);
    
    if (filter === "all") return matchesSearch;
    if (filter === "active") return (b.status === "ACTIVE" || b.status === "CONFIRMED") && matchesSearch;
    if (filter === "completed") return b.status === "COMPLETED" && matchesSearch;
    if (filter === "cancelled") return b.status === "CANCELLED" && matchesSearch;
    return matchesSearch;
  });

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.cancelBooking(id);
      const list = await bookingService.getMyBookings();
      setBookings(list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Booking History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{bookings.length} total bookings</p>
        </div>
        <Btn variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>Export</Btn>
      </div>

      {/* Search + filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-3 bg-card border border-border rounded-[14px] px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="Search bookings..." />
        </div>
        <div className="flex gap-1.5 bg-muted rounded-[14px] p-1">
          {["all", "active", "completed", "cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-[10px] text-xs font-medium capitalize transition-all duration-150",
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4 pl-6">
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-border rounded-full" />
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading bookings...</div>
        ) : filtered.map((b) => {
          const duration = Math.max(1, Math.ceil((new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60)));
          const currentStatus = statusMap[b.status] || { label: b.status, type: "muted" };
          return (
            <div key={b.id} className="relative">
              <div className={cn("absolute -left-6 top-5 w-3 h-3 rounded-full border-2 border-card",
                b.status === "ACTIVE" || b.status === "CONFIRMED" ? "bg-green-500" : b.status === "COMPLETED" ? "bg-blue-400" : "bg-red-400")} />
              <Crd className="flex gap-4 p-4 items-center flex-wrap">
                <div className="w-16 h-14 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl rounded-[12px] flex-shrink-0">🏬</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{b.parkingLotName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.floorName} · Slot {b.slotNumber}</p>
                    </div>
                    <Bdg label={currentStatus.label} type={currentStatus.type as any} />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(b.startTime).toLocaleDateString("en-IN")}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="flex items-center gap-1"><Car className="w-3 h-3" />{duration} hours</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-foreground">₹{b.totalAmount}</span>
                  <div className="flex gap-2">
                    {(b.status === "ACTIVE" || b.status === "CONFIRMED") && (
                      <Btn variant="danger" size="xs" onClick={() => handleCancelBooking(b.id)}>Cancel</Btn>
                    )}
                    {b.status === "COMPLETED" && (
                      <Btn variant="teal" size="xs" onClick={() => {
                        localStorage.setItem("parkhere_selected_lot", JSON.stringify({ id: b.parkingLotId, name: b.parkingLotName }));
                        nav("details");
                      }}>Rebook</Btn>
                    )}
                    <Btn variant="ghost" size="xs" onClick={() => {
                      localStorage.setItem("parkhere_confirmed_booking", JSON.stringify(b));
                      nav("success");
                    }} icon={<FileText className="w-3 h-3" />}>Receipt</Btn>
                  </div>
                </div>
              </Crd>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center">
            <History className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileScreen({ nav, dark, setDark }: { nav: (s: Screen) => void; dark: boolean; setDark: (v: boolean) => void }) {
  const user = authService.getCurrentUser();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  // Vehicles state
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [newModel, setNewModel] = useState("");
  const [newReg, setNewReg] = useState("");
  const [newType, setNewType] = useState("CAR");
  const [bookingsCount, setBookingsCount] = useState(0);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const list = await vehicleService.getMyVehicles();
      setVehicles(list);
    } catch (err) {
      console.error("Error loading vehicles", err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchBookingsCount = async () => {
    try {
      const list = await bookingService.getMyBookings();
      setBookingsCount(list.length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchBookingsCount();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel || !newReg) return;
    try {
      await vehicleService.addVehicle({
        modelName: newModel,
        registrationNumber: newReg.toUpperCase().replace(/\s/g, ""),
        type: newType,
      });
      setNewModel("");
      setNewReg("");
      setAddingVehicle(false);
      fetchVehicles();
    } catch (err) {
      console.error("Failed to add vehicle", err);
      alert("Error adding vehicle. Registration number might already exist.");
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await vehicleService.deleteVehicle(id);
      fetchVehicles();
    } catch (err) {
      console.error("Failed to delete vehicle", err);
      alert("Error deleting vehicle.");
    }
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: <User className="w-4 h-4" /> },
    { id: "vehicles", label: "My Vehicles", icon: <Car className="w-4 h-4" /> },
    { id: "payment", label: "Payment", icon: <CreditCard className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  ];

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Sarah Chen";
  const userEmail = user ? user.email : "sarah.chen@gmail.com";
  const userPhone = user ? user.phone : "+91 98765 43210";
  const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : "SC";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-foreground">Profile Settings</h1>

      {/* Profile header */}
      <Crd p className="flex items-center gap-5 flex-wrap">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">{userInitials}</div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-card shadow-sm">
            <Edit className="w-3 h-3 text-white" />
          </button>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{userEmail} · {userPhone}</p>
          <div className="flex items-center gap-2 mt-2">
            <Bdg label="Registered Member" type="default" />
            <Bdg label={`${bookingsCount} Bookings`} type="muted" />
          </div>
        </div>
        <Btn variant="outline" size="md" icon={<Edit className="w-4 h-4" />} onClick={() => setActiveSection("personal")}>Edit Profile</Btn>
      </Crd>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Nav */}
        <div>
          <Crd className="p-2 space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all",
                  activeSection === s.id ? "bg-accent text-accent-foreground" : "text-foreground/70 hover:bg-muted")}>
                {s.icon}{s.label}
              </button>
            ))}
            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                  {dark ? <Moon className="w-4 h-4 text-foreground/70" /> : <Sun className="w-4 h-4 text-foreground/70" />}
                  <span className="text-sm font-medium text-foreground/70">Dark Mode</span>
                </div>
                <Toggle checked={dark} onChange={setDark} />
              </div>
            </div>
          </Crd>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeSection === "personal" && (
            <Crd p className="space-y-5">
              <h2 className="font-semibold text-foreground">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Inp label="First Name" value={user?.firstName || ""} disabled />
                <Inp label="Last Name" value={user?.lastName || ""} disabled />
                <Inp label="Email" value={user?.email || ""} type="email" icon={<Mail className="w-4 h-4" />} disabled />
                <Inp label="Phone" value={user?.phone || ""} icon={<Phone className="w-4 h-4" />} disabled />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Personal info edit is disabled in this demo.</p>
            </Crd>
          )}

          {activeSection === "vehicles" && (
            <div className="space-y-4">
              <Crd p>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-foreground">Saved Vehicles</h2>
                  {!addingVehicle && (
                    <Btn variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAddingVehicle(true)}>Add Vehicle</Btn>
                  )}
                </div>

                {addingVehicle && (
                  <form onSubmit={handleAddVehicle} className="bg-muted/30 p-4 rounded-xl border border-border space-y-4 mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Add New Vehicle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Inp label="Model Name" placeholder="e.g. Maruti Suzuki Swift" value={newModel} onChange={setNewModel} />
                      <Inp label="Registration Number" placeholder="e.g. MH12AB1234" value={newReg} onChange={setNewReg} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Vehicle Type</label>
                      <select value={newType} onChange={e => setNewType(e.target.value)}
                        className="w-full text-sm bg-card border border-border rounded-[14px] p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="CAR">Car</option>
                        <option value="BIKE">Bike / Two-Wheeler</option>
                        <option value="SUV">SUV</option>
                        <option value="EV">Electric Vehicle (EV)</option>
                        <option value="MINI_TRUCK">Luxury / Large vehicle</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Btn variant="ghost" size="sm" onClick={() => setAddingVehicle(false)}>Cancel</Btn>
                      <Btn variant="primary" size="sm" type="submit">Save Vehicle</Btn>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {loadingVehicles ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">Loading vehicles...</div>
                  ) : vehicles.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">No vehicles saved. Add one to book slots faster.</div>
                  ) : (
                    vehicles.map((v, index) => (
                      <div key={v.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-[14px]">
                        <div className="w-12 h-8 rounded-[8px] bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {v.type}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground text-sm">{v.modelName}</p>
                            {index === 0 && <Bdg label="Primary" type="default" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{v.registrationNumber}</p>
                        </div>
                        <div className="flex gap-2">
                          <Btn variant="ghost" size="xs" onClick={() => handleDeleteVehicle(v.id)} icon={<Trash2 className="w-3 h-3 text-red-400" />} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Crd>
            </div>
          )}

          {activeSection === "payment" && (
            <Crd p className="space-y-4">
              <h2 className="font-semibold text-foreground">Saved Payment Methods</h2>
              <div className="p-4 bg-muted/30 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
                Payment details are abstracted via standard UPI checkout.
              </div>
            </Crd>
          )}

          {activeSection === "notifications" && (
            <Crd p className="space-y-5">
              <h2 className="font-semibold text-foreground">Notification Preferences</h2>
              {[
                { label: "Email notifications", desc: "Booking confirmations, receipts, and updates", value: notifEmail, set: setNotifEmail },
                { label: "SMS notifications", desc: "Reminders 30 min before your booking starts", value: notifSms, set: setNotifSms },
                { label: "Push notifications", desc: "Real-time alerts from the mobile app", value: notifPush, set: setNotifPush },
              ].map(({ label, desc, value, set }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <Toggle checked={value} onChange={set} />
                </div>
              ))}
            </Crd>
          )}

          {activeSection === "security" && (
            <Crd p className="space-y-5">
              <h2 className="font-semibold text-foreground">Security Settings</h2>
              <p className="text-xs text-muted-foreground">Two-factor authentication is active on all accounts via JWT validation.</p>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">JWT Session Key</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Expires automatically after 24 hours</p>
                  </div>
                  <Btn variant="outline" size="sm" onClick={() => { authService.logout(); nav("login"); window.location.reload(); }}>Log out</Btn>
                </div>
              </div>
            </Crd>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ nav }: { nav: (s: Screen) => void }) {
  const [period, setPeriod] = useState("year");
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Error loading dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-[12px] shadow-lg p-3 text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}: <span className="font-semibold text-foreground ml-1">{typeof p.value === "number" && p.name === "Revenue" ? `₹${p.value.toLocaleString("en-IN")}` : p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  const revenueChartData = metrics?.revenueData || REVENUE_DATA;
  const dailyBookingsChartData = metrics?.dailyData || DAILY_DATA;
  const vehicleChartData = metrics?.vehicleData || VEHICLE_DATA;
  const utilizationChartData = metrics?.utilizationData || UTILIZATION_DATA;

  const totalRev = metrics?.totalRevenue ? `₹${metrics.totalRevenue.toLocaleString("en-IN")}` : "₹7.65L";
  const totalBkg = metrics?.totalBookings ? metrics.totalBookings.toLocaleString("en-IN") : "22.4K";
  const avgUtil = metrics?.occupancyRate ? `${metrics.occupancyRate.toFixed(1)}%` : "83.5%";
  const activeUsers = metrics?.totalUsers ? metrics.totalUsers.toLocaleString("en-IN") : "18.2K";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time performance across all locations</p>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="outline" size="md" icon={<Download className="w-4 h-4" />}>Export</Btn>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm text-muted-foreground">Loading dashboard analytics...</div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={totalRev} change="+18.4%" icon={<DollarSign className="w-5 h-5" />} color="blue" />
            <StatCard label="Total Bookings" value={totalBkg} change="+12.1%" icon={<Bookmark className="w-5 h-5" />} color="teal" />
            <StatCard label="Avg. Utilization" value={avgUtil} change="+3.2%" icon={<BarChart2 className="w-5 h-5" />} color="green" />
            <StatCard label="Active Users" value={activeUsers} change="+24.7%" icon={<Users className="w-5 h-5" />} color="purple" />
          </div>

          {/* Revenue chart */}
          <Crd p>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-semibold text-foreground">Revenue & Bookings</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Monthly performance (Current Year)</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" />Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-secondary inline-block rounded" />Bookings</span>
              </div>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: "#2563EB" }} />
                  <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#14B8A6" strokeWidth={2} fill="url(#colorBookings)" dot={false} activeDot={{ r: 5, fill: "#14B8A6" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Crd>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily bookings bar */}
            <Crd p className="lg:col-span-2">
              <h2 className="font-semibold text-foreground mb-1">Bookings by Day</h2>
              <p className="text-sm text-muted-foreground mb-5">Weekly breakdown</p>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyBookingsChartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", fillOpacity: 0.05 }} />
                    <Bar dataKey="bookings" name="Bookings" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Crd>

            {/* Vehicle distribution */}
            <Crd p>
              <h2 className="font-semibold text-foreground mb-1">Vehicle Types</h2>
              <p className="text-sm text-muted-foreground mb-4">Distribution</p>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={vehicleChartData} innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                      {vehicleChartData.map((entry: any, i: number) => <Cell key={i} fill={entry.color || "#3b82f6"} stroke="none" />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {vehicleChartData.map((v: any) => (
                  <div key={v.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: v.color || "#3b82f6" }} />
                      <span className="text-muted-foreground">{v.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{v.value}</span>
                  </div>
                ))}
              </div>
            </Crd>
          </div>

          {/* Utilization */}
          <Crd p>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="font-semibold text-foreground">Parking Utilization</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Occupancy rate by location</p>
              </div>
              <Btn variant="outline" size="sm" onClick={() => nav("management")}>Manage Lots</Btn>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationChartData} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", fillOpacity: 0.05 }} />
                  <Bar dataKey="value" name="Utilization %" radius={[0, 6, 6, 0]}>
                    {utilizationChartData.map((e: any, i: number) => (
                      <Cell key={i} fill={e.value >= 90 ? "#EF4444" : e.value >= 80 ? "#F59E0B" : "#22C55E"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Crd>
        </>
      )}
    </div>
  );
}

// ─── Parking Management ───────────────────────────────────────────────────────
function ParkingManagement({ nav }: { nav: (s: Screen) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const list = await lotService.searchLots();
        setLots(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLots();
  }, []);

  const filtered = lots.filter(l => search === "" || l.name.toLowerCase().includes(search.toLowerCase()));

  // Sum stats
  const totalSlots = lots.reduce((acc, curr) => acc + (curr.total || 20), 0);
  const totalAvailable = lots.reduce((acc, curr) => acc + (curr.available !== undefined ? curr.available : 10), 0);
  const occupiedSlots = totalSlots - totalAvailable;
  const avgUtilization = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Parking Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{lots.length} lots across Indian cities</p>
        </div>
        <div className="flex gap-3">
          <Btn variant="outline" size="md" icon={<Download className="w-4 h-4" />}>Export</Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Lots" value={String(lots.length)} sub="All locations" icon={<Building2 className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Slots" value={String(totalSlots)} sub="Across all lots" icon={<Layers className="w-5 h-5" />} color="teal" />
        <StatCard label="Currently Occupied" value={String(occupiedSlots)} sub={`${avgUtilization.toFixed(1)}% utilization`} icon={<Car className="w-5 h-5" />} color="amber" />
        <StatCard label="Average Rate" value={`₹${lots.length > 0 ? Math.round(lots.reduce((acc, c) => acc + (c.price || 50), 0) / lots.length) : 50}/hr`} change="Standard pricing" icon={<DollarSign className="w-5 h-5" />} color="green" />
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-48 flex items-center gap-3 bg-card border border-border rounded-[14px] px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="Search lots..." />
        </div>
        <Btn variant="outline" size="md" icon={<Filter className="w-4 h-4" />}>Filter</Btn>
      </div>

      {/* Table */}
      <Crd className="overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading parking lots...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left">
                    <input type="checkbox" className="accent-primary" onChange={e => setSelected(e.target.checked ? filtered.map(l => l.id) : [])} />
                  </th>
                  {["Location", "Address", "Total Slots", "Available", "Rate", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(lot => {
                  const available = lot.available !== undefined ? lot.available : ((Number(lot.id) * 3 + 2) % 15 + 1);
                  const total = lot.total || 20;
                  const pct = available / total;
                  const lotStatus = pct > 0.3 ? "Active" : pct > 0.05 ? "Busy" : "Full";
                  const lotPrice = lot.pricePerHour || lot.price || 50;
                  return (
                    <tr key={lot.id} className={cn("hover:bg-muted/30 transition-colors", selected.includes(lot.id) && "bg-primary/5")}>
                      <td className="px-5 py-4">
                        <input type="checkbox" className="accent-primary" checked={selected.includes(lot.id)} onChange={e => setSelected(e.target.checked ? [...selected, lot.id] : selected.filter(id => id !== lot.id))} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img src={lot.image || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=120&q=80"} alt="" className="w-10 h-10 rounded-[10px] object-cover flex-shrink-0" />
                          <span className="font-medium text-foreground">{lot.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs max-w-xs truncate">{lot.address}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{total}</span>
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div className={cn("h-full rounded-full", pct > 0.3 ? "bg-green-500" : pct > 0.1 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${(1 - pct) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn("font-semibold text-sm", pct > 0.3 ? "text-green-500" : pct > 0.1 ? "text-amber-500" : "text-red-500")}>{available}</span>
                        <span className="text-muted-foreground text-xs"> / {total}</span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-foreground">₹{lotPrice}/hr</td>
                      <td className="px-4 py-4">
                        <Bdg label={lotStatus} type={lotStatus === "Active" ? "success" : lotStatus === "Busy" ? "warning" : "danger"} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5">
                          <button onClick={() => {
                            localStorage.setItem("parkhere_selected_lot", JSON.stringify(lot));
                            nav("details");
                          }} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><Eye className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {lots.length} lots</p>
        </div>
      </Crd>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ nav, dark, setDark }: { nav: (s: Screen) => void; dark: boolean; setDark: (v: boolean) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: "Instant Booking", desc: "Reserve your spot in under 30 seconds with real-time availability across 50,000+ locations.", c: "blue" },
    { icon: <Shield className="w-6 h-6" />, title: "Fully Secured", desc: "24/7 CCTV surveillance, licensed attendants, and full insurance on every booking.", c: "teal" },
    { icon: <Car className="w-6 h-6" />, title: "Smart Navigation", desc: "Turn-by-turn directions to your reserved spot the moment your booking is confirmed.", c: "green" },
    { icon: <BatteryCharging className="w-6 h-6" />, title: "EV Charging", desc: "Hundreds of EV-ready stalls at major locations — filter by connector type.", c: "amber" },
    { icon: <Clock className="w-6 h-6" />, title: "Flexible Duration", desc: "Hourly, daily, or monthly — book exactly what you need, cancel what you don't.", c: "purple" },
    { icon: <CreditCard className="w-6 h-6" />, title: "Contactless Pay", desc: "Apple Pay, Google Pay, and all major credit cards. Zero hidden fees, ever.", c: "rose" },
  ];

  const testimonials = [
    { name: "Alex Rivera", role: "Daily Commuter, NY", avatar: "AR", text: "ParkHere has completely transformed my morning commute. I never worry about parking anymore — everything is handled before I leave home.", rating: 5 },
    { name: "Samantha Lee", role: "Business Traveler", avatar: "SL", text: "As someone who travels constantly, having a reliable parking solution is non-negotiable. ParkHere delivers every single time.", rating: 5 },
    { name: "David Park", role: "Weekend Explorer", avatar: "DP", text: "Found a perfect spot near the museum in seconds. The design is gorgeous and the experience is completely seamless.", rating: 5 },
  ];

  const plans = [
    { name: "Free", price: 0, desc: "For occasional parkers", features: ["5 bookings/month", "Standard locations", "Email support", "Basic history"] },
    { name: "Pro", price: 9.99, desc: "For regular commuters", popular: true, features: ["Unlimited bookings", "Priority slot selection", "EV charging access", "24/7 priority support", "Invoice generation", "Advanced analytics"] },
    { name: "Business", price: 29.99, desc: "For teams & fleets", features: ["Everything in Pro", "Up to 10 vehicles", "Centralized billing", "Dedicated manager", "Custom reporting", "API access"] },
  ];

  const faqs = [
    { q: "How does ParkHere work?", a: "Browse available parking lots near your destination, select a slot, and confirm your booking. You receive a QR code for touchless entry and exit." },
    { q: "Can I cancel or modify my booking?", a: "Yes — cancel or modify up to 1 hour before your booking starts for a full refund. Late changes incur a small convenience fee." },
    { q: "Are all parking lots verified?", a: "Every lot on ParkHere is inspected and must meet our strict safety and security standards before going live." },
    { q: "What payment methods are accepted?", a: "All major cards, Apple Pay, Google Pay, and PayPal. All transactions are encrypted end-to-end." },
    { q: "Do you support EV charging?", a: "Yes. EV-enabled lots are clearly marked with a filter so you can search specifically for your connector type." },
  ];

  const iconColor: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ParkHere Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-foreground text-lg">ParkHere</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {["Features","Availability","Pricing","FAQ"].map(l => <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-foreground transition-colors">{l}</a>)}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDark(!dark)} className="p-2 rounded-xl hover:bg-muted transition-colors">
              {dark ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <Btn variant="ghost" size="sm" onClick={() => nav("login")}>Sign in</Btn>
            <Btn variant="primary" size="sm" onClick={() => nav("register")}>Get started</Btn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-blue-600/8 via-teal-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-blue-100 dark:border-blue-800">
            <Zap className="w-3.5 h-3.5" />Smart Parking for Modern Cities
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground leading-[1.08] tracking-tight mb-5">
            Parking,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">simplified.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Reserve your perfect spot in seconds. Real-time availability, seamless booking, and effortless navigation — all in one place.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl mb-12">
          <div className="bg-card border border-border rounded-[22px] shadow-xl p-2 flex gap-2 flex-col sm:flex-row">
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <input type="text" defaultValue="New York, NY" className="flex-1 bg-transparent text-foreground text-sm focus:outline-none" placeholder="Enter destination..." />
            </div>
            <div className="h-px sm:h-auto sm:w-px bg-border" />
            <div className="flex items-center gap-2 px-4 py-2">
              <Calendar className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Today, 2:00 PM</span>
            </div>
            <Btn variant="primary" size="md" onClick={() => nav("search")} className="rounded-[18px]" icon={<Search className="w-4 h-4" />}>Find Parking</Btn>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl mb-12">
          <ParkingIllustration />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="flex flex-wrap justify-center gap-10 text-center">
          {[["50K+","Parking Spots"],["200K+","Happy Drivers"],["98%","Satisfaction"],["4.9★","App Rating"]].map(([v, l]) => (
            <div key={l}><p className="text-2xl font-black text-foreground">{v}</p><p className="text-sm text-muted-foreground mt-0.5">{l}</p></div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">Why ParkHere?</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">Everything you need to park smarter</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">From instant reservations to EV charging, we&apos;ve built every feature for a stress-free experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <Crd key={f.title} className="p-6 hover:shadow-md transition-all duration-200">
                <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center mb-5", iconColor[f.c])}>{f.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Crd>
            ))}
          </div>
        </div>
      </section>

      {/* Live availability */}
      <section id="availability" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">Live Availability</p>
              <h2 className="text-3xl font-black text-foreground">Parking near you, right now</h2>
            </div>
            <Btn variant="outline" size="md" onClick={() => nav("search")} iconRight={<ChevronRight className="w-4 h-4" />}>View all lots</Btn>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {LOTS.slice(0, 4).map(lot => <ParkingCard key={lot.id} lot={lot} onClick={() => nav("login")} />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Loved by 200,000+ drivers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <Crd key={t.name} className="p-6">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm text-foreground leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Crd>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Crd key={plan.name} className={cn("p-8 relative", plan.popular && "border-primary ring-2 ring-primary/15 shadow-xl shadow-primary/5")}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-sm">Most Popular</span>
                  </div>
                )}
                <p className="font-bold text-foreground mb-1">{plan.name}</p>
                <p className="text-sm text-muted-foreground mb-5">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <Btn variant={plan.popular ? "primary" : "outline"} size="md" full onClick={() => nav("register")} className="mb-6">
                  Get started {plan.popular ? "free" : ""}
                </Btn>
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
              </Crd>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">FAQ</p>
            <h2 className="text-3xl font-black text-foreground">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Crd key={i} className="overflow-hidden">
                <button className="w-full flex items-center justify-between px-6 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-medium text-foreground text-sm">{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-4", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && <div className="px-6 pb-5"><p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p></div>}
              </Crd>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[28px] p-12 text-white shadow-xl shadow-blue-500/20">
            <div className="w-14 h-14 bg-white/15 rounded-[18px] flex items-center justify-center mx-auto mb-5">
              <img src="/logo.png" alt="ParkHere Logo" className="w-8 h-8 object-contain" />
            </div>
            <h2 className="text-3xl font-black mb-3">Ready to park smarter?</h2>
            <p className="text-blue-100 mb-8 max-w-sm mx-auto">Join 200,000+ drivers who&apos;ve eliminated parking stress from their lives.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Btn variant="ghost" size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold" onClick={() => nav("register")}>Get started free</Btn>
              <Btn variant="ghost" size="lg" className="text-white border border-white/30 hover:bg-white/10" onClick={() => nav("login")}>Sign in</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="ParkHere Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-foreground text-lg">ParkHere</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">Smart parking reservations for modern cities. Save time, reduce stress.</p>
              <div className="flex gap-3 mt-5">
                {["Twitter","LinkedIn","Instagram"].map(s => (
                  <div key={s} className="w-9 h-9 rounded-[10px] bg-muted flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors">
                    <span className="text-xs text-muted-foreground">{s[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["Features","Pricing","For Business","API","Changelog"] },
              { title: "Company", links: ["About","Careers","Blog","Press","Legal"] },
              { title: "Support", links: ["Help Center","Contact","Status","Privacy","Terms"] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-semibold text-foreground text-sm mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(link => <li key={link}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border gap-4">
            <p className="text-sm text-muted-foreground">© 2024 ParkHere, Inc. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">Crafted with care for a better city.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [dark, setDark] = useState(false);

  const nav = useCallback((s: Screen) => setScreen(s), []);

  const appScreens: Screen[] = ["dashboard","search","details","slots","booking","success","history","profile","admin","management"];
  const isApp = appScreens.includes(screen);

  return (
    <div className={cn("font-[Inter,system-ui,sans-serif]", dark && "dark")}>
      {!isApp ? (
        <>
          {screen === "landing" && <LandingPage nav={nav} dark={dark} setDark={setDark} />}
          {screen === "login" && <LoginScreen nav={nav} />}
          {screen === "register" && <RegisterScreen nav={nav} />}
          {screen === "forgot" && <ForgotScreen nav={nav} />}
          {screen === "otp" && <OTPScreen nav={nav} />}
          {screen === "auth-success" && <AuthSuccess nav={nav} />}
        </>
      ) : (
        <AppShell nav={nav} screen={screen} dark={dark} setDark={setDark}>
          {screen === "dashboard" && <Dashboard nav={nav} />}
          {screen === "search" && <SearchScreen nav={nav} />}
          {screen === "details" && <DetailsScreen nav={nav} />}
          {screen === "slots" && <SlotSelection nav={nav} />}
          {screen === "booking" && <BookingConfirmation nav={nav} />}
          {screen === "success" && <BookingSuccess nav={nav} />}
          {screen === "history" && <BookingHistory nav={nav} />}
          {screen === "profile" && <ProfileScreen nav={nav} dark={dark} setDark={setDark} />}
          {screen === "admin" && <AdminDashboard nav={nav} />}
          {screen === "management" && <ParkingManagement nav={nav} />}
        </AppShell>
      )}
    </div>
  );
}
