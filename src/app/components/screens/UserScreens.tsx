import React, { useState, useEffect } from "react";
import {
  Search, CircleParking, QrCode, Bookmark, Clock, MapPin, CreditCard,
  ChevronRight, ChevronLeft, ArrowRight, ArrowDown, Shield, Lock, Download,
  Navigation, Calendar, Trash2, Edit, Plus, Mail, Phone, Moon, Sun, Accessibility,
  Zap, IndianRupee, Star, CheckCircle, AlertCircle, History, Check, BarChart2,
  Home
} from "lucide-react";
import { motion } from "motion/react";
import { authService, bookingService, lotService, vehicleService } from "../../services/api";
import {
  Btn, Crd, Inp, Bdg, cn, fmt, makeSlots, ParkingCard, QRCode, MapPlaceholder, Screen
} from "../ui/core-widgets";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard({ nav }: { nav: (s: Screen) => void }) {
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
        const sortedBookings = bookingsList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentBookings(sortedBookings);

        const active = sortedBookings.find((b: any) => b.status === "ACTIVE" || b.status === "CONFIRMED");
        setActiveBooking(active);

        const lotsList = await lotService.searchLots();
        setLots(lotsList);

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
                  nav("booking");
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
                localStorage.setItem("parkhere_confirmed_booking", JSON.stringify(b));
                nav("success");
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
export function SearchScreen({ nav }: { nav: (s: Screen) => void }) {
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
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer",
              f.active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40")}>
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
          <button onClick={() => setView("grid")} className={cn("p-2 transition-colors cursor-pointer", view === "grid" ? "bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted")}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={cn("p-2 transition-colors cursor-pointer", view === "list" ? "bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted")}><List className="w-4 h-4" /></button>
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
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3.5 h-3" />{lot.address} · {lot.distance || "0.8 km"}</p>
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
export function DetailsScreen({ nav }: { nav: (s: Screen) => void }) {
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

  const [h1, m1] = fromTime.split(":").map(Number);
  const [h2, m2] = untilTime.split(":").map(Number);
  const durationHours = Math.max(1, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);

  const baseAmount = price * durationHours;
  const taxAmount = baseAmount * 0.18;
  const totalAmount = baseAmount + taxAmount;

  const handleChooseSlot = () => {
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
      <button onClick={() => nav("search")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 cursor-pointer">
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

          <div>
            <h2 className="font-semibold text-foreground mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Zap className="w-4 h-4" />, label: "EV Charging", color: "text-green-500" },
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

          <div>
            <h2 className="font-semibold text-foreground mb-4">Location</h2>
            <div style={{ height: 200 }}><MapPlaceholder /></div>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Navigation className="w-4 h-4 text-primary" />
              <span>Walking distance: ~4 min (0.3 km from entrance)</span>
            </div>
          </div>

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
export function SlotSelection({ nav }: { nav: (s: Screen) => void }) {
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
    available: "bg-blue-100 border-blue-200 text-blue-500 hover:bg-blue-200 hover:border-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40 cursor-pointer",
    occupied: "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-60",
    reserved: "bg-amber-100 border-amber-200 text-amber-500 cursor-not-allowed dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
    selected: "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30 cursor-pointer",
    disabled: "bg-muted/50 border-dashed border-muted-foreground/20 text-muted-foreground/30 cursor-not-allowed",
    ev: "bg-green-100 border-green-200 text-green-500 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 cursor-pointer",
    accessible: "bg-teal-100 border-teal-200 text-teal-500 hover:bg-teal-200 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-400 cursor-pointer",
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
      <button onClick={() => nav("details")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
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

      {floors.length > 1 && (
        <div className="flex gap-2 border-b border-border pb-3 flex-wrap">
          {floors.map((f, idx) => (
            <button key={f.id} onClick={() => { setSelectedFloorIdx(idx); setSelectedSlot(null); setSelectedSlotObj(null); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer", 
                selectedFloorIdx === idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
              {f.floorName}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {legend.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn("w-5 h-5 rounded-[6px] border-2", color)} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center justify-center mb-3 gap-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-xs text-muted-foreground font-medium">
            <ArrowDown className="w-3 h-3" /> ENTRANCE
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

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

      <div className={cn("transition-all duration-300", selectedSlot ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none")}>
        {selectedSlot && (
          <Crd className="bg-primary text-primary-foreground border-primary p-5 flex items-center gap-4 flex-wrap">
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
export function BookingConfirmation({ nav }: { nav: (s: Screen) => void }) {
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
      <button onClick={() => nav("slots")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ChevronLeft className="w-4 h-4" />Back to slot selection
      </button>
      <h1 className="text-xl font-bold text-foreground">Booking Summary</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-[12px] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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

      {vehicles.length > 1 && (
        <Crd p>
          <h2 className="font-semibold text-foreground mb-2">Select Vehicle</h2>
          <div className="flex gap-2 flex-wrap">
            {vehicles.map((v, idx) => (
              <button key={v.id} onClick={() => setSelectedVehicleIdx(idx)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                  selectedVehicleIdx === idx ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:bg-muted/30")}>
                {v.registrationNumber} ({v.modelName})
              </button>
            ))}
          </div>
        </Crd>
      )}

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
export function BookingSuccess({ nav }: { nav: (s: Screen) => void }) {
  const bookingStr = localStorage.getItem("parkhere_confirmed_booking");
  const booking = bookingStr ? JSON.parse(bookingStr) : null;

  if (!booking) {
    return <div className="p-8 text-center text-muted-foreground">No confirmed booking found.</div>;
  }

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = booking.qrCode;
    link.download = `parkhere_booking_${booking.id}.png`;
    link.click();
  };

  return (
    <div className="p-6 md:p-8 max-lg mx-auto text-center space-y-6 max-w-lg">
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
export function BookingHistory({ nav }: { nav: (s: Screen) => void }) {
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

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-3 bg-card border border-border rounded-[14px] px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="Search bookings..." />
        </div>
        <div className="flex gap-1.5 bg-muted rounded-[14px] p-1">
          {["all", "active", "completed", "cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-[10px] text-xs font-medium capitalize transition-all duration-150 cursor-pointer",
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {f}
            </button>
          ))}
        </div>
      </div>

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

// ─── Profile Screen ───────────────────────────────────────────────────────────
export function ProfileScreen({ nav, dark, setDark }: { nav: (s: Screen) => void; dark: boolean; setDark: (v: boolean) => void }) {
  const user = authService.getCurrentUser();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

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

      <Crd p className="flex items-center gap-5 flex-wrap">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">{userInitials}</div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-card shadow-sm cursor-pointer">
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
        <div>
          <Crd className="p-2 space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all cursor-pointer",
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
                    <p className="text-xs text-muted-foreground mt-0.5">Expires automatically after 15 minutes</p>
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
