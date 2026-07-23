import React from "react";
import {
  MapPin, Star, ArrowUp, Car, ArrowDown
} from "lucide-react";

// Types
export type Screen =
  | "landing" | "login" | "register" | "forgot" | "otp" | "auth-success"
  | "dashboard" | "search" | "details" | "slots" | "booking" | "success"
  | "history" | "profile" | "admin" | "management";

export type SlotStatus = "available" | "occupied" | "reserved" | "selected" | "disabled" | "ev" | "accessible";

export interface Lot {
  id: number;
  name: string;
  address: string;
  distance: string;
  price: number;
  rating: number;
  reviews: number;
  available: number;
  total: number;
  image: string;
  amenities: string[];
  tags: string[];
}

// Helper Utilities
export function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

export function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function makeSlots(): { id: string; status: SlotStatus }[][] {
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

// ─── Custom Button ──────────────────────────────────────────────────────────
export function Btn({
  children, variant = "primary", size = "md", onClick, className, disabled, loading, full, icon, iconRight
}: {
  children?: React.ReactNode; variant?: "primary"|"secondary"|"ghost"|"outline"|"danger"|"success";
  size?: "xs"|"sm"|"md"|"lg"|"xl"; onClick?: () => void; className?: string;
  disabled?: boolean; loading?: boolean; full?: boolean; icon?: React.ReactNode; iconRight?: React.ReactNode;
}) {
  const V: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm shadow-blue-500/20",
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

// ─── Custom Badge ───────────────────────────────────────────────────────────
export function Bdg({ label, type = "default" }: { label: string; type?: "default"|"success"|"warning"|"danger"|"teal"|"purple"|"muted" }) {
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

// ─── Custom Card ────────────────────────────────────────────────────────────
export function Crd({ children, className, onClick, p }: { children: React.ReactNode; className?: string; onClick?: () => void; p?: boolean }) {
  return (
    <div onClick={onClick} className={cn("bg-card border border-border rounded-[18px] shadow-sm", onClick && "cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 active:scale-[0.99]", p && "p-6", className)}>
      {children}
    </div>
  );
}

// ─── Custom Input ───────────────────────────────────────────────────────────
export function Inp({ label, placeholder, type = "text", value, onChange, icon, note, error }: {
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

// ─── Stat Card ──────────────────────────────────────────────────────────────
export function StatCard({ label, value, change, sub, icon, color = "blue" }: {
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

// ─── Animated Logo ─────────────────────────────────────────────────────────
export function AnimatedLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid meet">
      <path
        d="M 25 40 C 35 40 40 50 30 60 C 20 70 35 72 47 72"
        stroke="#FBBF24"
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle r="6" fill="#06B6D4" opacity="0.6">
        <animateMotion dur="2.5s" repeatCount="indefinite" path="M 25 40 C 35 40 40 50 30 60 C 20 70 35 72 47 72" />
        <animate attributeName="r" values="3;9;3" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle r="3.5" fill="#06B6D4" stroke="white" strokeWidth="1">
        <animateMotion dur="2.5s" repeatCount="indefinite" path="M 25 40 C 35 40 40 50 30 60 C 20 70 35 72 47 72" />
      </circle>
      <g fill="#0EA5E9" stroke="#1E3A8A" strokeWidth="2">
        <path d="M 25 10 C 18 10 13 15 13 22 C 13 30 25 40 25 40 C 25 40 37 30 37 22 C 37 15 32 10 25 10 Z" />
        <circle cx="25" cy="22" r="4.5" fill="white" />
      </g>
      <g transform="translate(45, 48)" stroke="#1E3A8A" strokeWidth="2">
        <path d="M 12 10 L 34 10 L 39 22 L 7 22 Z" fill="#D1FAE5" />
        <rect x="2" y="22" width="42" height="15" rx="5" fill="#F43F5E" />
        <circle cx="8" cy="27.5" r="2.5" fill="white" />
        <circle cx="38" cy="27.5" r="2.5" fill="white" />
        <rect x="17" y="28" width="12" height="6" rx="1" fill="white" />
        <rect x="7" y="37" width="8" height="6" rx="1.5" fill="#1E3A8A" />
        <rect x="31" y="37" width="8" height="6" rx="1.5" fill="#1E3A8A" />
      </g>
    </svg>
  );
}

// ─── Custom Toggle ──────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200", checked ? "bg-primary" : "bg-muted")} role="switch" aria-checked={checked}>
      <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

// ─── Parking Illustration ────────────────────────────────────────────────────
export function ParkingIllustration() {
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden border border-border bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800" style={{ height: 300 }}>
      <svg viewBox="0 0 900 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect x="0" y="0" width="900" height="300" fill="url(#sky)" />
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
        </defs>
        <rect x="50" y="60" width="800" height="200" rx="12" fill="#CBD5E1" opacity="0.5" />
        <rect x="60" y="70" width="780" height="180" rx="10" fill="#E2E8F0" opacity="0.8" />
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
          <rect key={i} x={80 + i * 64} y="80" width="2" height="160" fill="#94A3B8" opacity="0.6" />
        ))}
        <rect x="60" y="155" width="780" height="14" fill="#CBD5E1" opacity="0.6" />
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
        {[3, 7].map(i => (
          <g key={i}>
            <rect x={82 + i * 64 + 2} y="90" width="56" height="58" rx="6" fill="#2563EB" opacity="0.1" strokeDasharray="4 2" stroke="#2563EB" strokeWidth="2" />
            <text x={82 + i * 64 + 30} y="124" textAnchor="middle" fill="#2563EB" fontSize="11" fontWeight="600">FREE</text>
          </g>
        ))}
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
        <g>
          <rect x="20" y="145" width="40" height="20" rx="4" fill="#2563EB" opacity="0.15" />
          <text x="40" y="159" textAnchor="middle" fill="#2563EB" fontSize="10" fontWeight="700">IN</text>
        </g>
        <circle cx="840" cy="100" r="22" fill="#2563EB" />
        <text x="840" y="107" textAnchor="middle" fill="white" fontSize="22" fontWeight="800">P</text>
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

// ─── Parking Card ────────────────────────────────────────────────────────────
export function ParkingCard({ lot, onClick }: { lot: any; onClick: () => void }) {
  const price = lot.pricePerHour || lot.price || 0;
  const tags = lot.amenities || lot.tags || [];
  const address = lot.address ? lot.address.split(",")[0] : "";
  const rating = lot.rating !== undefined && lot.rating !== null ? Number(lot.rating) : 0;
  const reviewsCount = lot.reviewsCount || lot.reviews || 0;
  const total = lot.totalSlots || lot.total || 0;
  const available = lot.availableSlots !== undefined ? lot.availableSlots : (lot.available !== undefined ? lot.available : 0);
  const pct = total > 0 ? available / total : 0;
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

// ─── QR Code Generator ────────────────────────────────────────────────────────
export function QRCode({ size = 160, blurred = false }: { size?: number; blurred?: boolean }) {
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
export function MapPlaceholder() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800 dark:to-slate-700 overflow-hidden rounded-[18px]">
      <svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        {[0,1,2,3,4,5,6].map(i => <rect key={`h${i}`} x="0" y={i*40} width="400" height="4" fill="#CBD5E1" opacity="0.5" />)}
        {[0,1,2,3,4,5,6,7,8,9,10].map(i => <rect key={`v${i}`} x={i*40} y="0" width="4" height="250" fill="#CBD5E1" opacity="0.5" />)}
        {[[44,4,36,36],[84,4,36,76],[124,4,36,36],[44,44,76,36],[164,4,36,36],
          [44,84,76,36],[124,44,76,76],[204,4,36,36],[44,124,36,36],[84,124,36,36],
          [164,44,36,76],[204,44,36,76],[244,4,76,76],[164,124,116,36]
        ].map(([x,y,w,h],i) => <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#94A3B8" opacity="0.2" />)}
        <rect x="164" y="84" width="76" height="36" rx="6" fill="#2563EB" opacity="0.15" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="202" cy="102" r="16" fill="#2563EB" />
        <circle cx="202" cy="102" r="12" fill="white" />
        <circle cx="202" cy="102" r="8" fill="#2563EB" />
        <text x="202" y="106" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">P</text>
        <circle cx="88" cy="42" r="10" fill="#14B8A6" opacity="0.9" />
        <text x="88" y="46" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">P</text>
        <circle cx="268" cy="42" r="10" fill="#F59E0B" opacity="0.9" />
        <text x="268" y="46" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">P</text>
        <circle cx="130" cy="120" r="8" fill="#2563EB" opacity="0.2" />
        <circle cx="130" cy="120" r="5" fill="#2563EB" />
        <circle cx="130" cy="120" r="2.5" fill="white" />
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
