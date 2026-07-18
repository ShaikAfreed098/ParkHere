import React, { useState, useEffect } from "react";
import {
  Download, DollarSign, Bookmark, BarChart2, Users, Building2, Layers,
  Car, Search, Filter, Eye
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis,
  Tooltip, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { adminService, lotService } from "../../services/api";
import { Btn, Crd, Bdg, StatCard, cn, Screen } from "../ui/core-widgets";

const REVENUE_DATA: any[] = [];
const VEHICLE_DATA: any[] = [];
const UTILIZATION_DATA: any[] = [];
const DAILY_DATA: any[] = [];

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export function AdminDashboard({ nav }: { nav: (s: Screen) => void }) {
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

  const totalRev = metrics ? `₹${(metrics.totalRevenue || 0).toLocaleString("en-IN")}` : "₹0";
  const totalBkg = metrics ? (metrics.totalBookings || 0).toLocaleString("en-IN") : "0";
  const avgUtil = metrics ? `${(metrics.occupancyRate || 0).toFixed(1)}%` : "0.0%";
  const activeUsers = metrics ? (metrics.totalUsers || 0).toLocaleString("en-IN") : "0";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
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
            <StatCard label="Total Revenue" value={totalRev} icon={<DollarSign className="w-5 h-5" />} color="blue" />
            <StatCard label="Total Bookings" value={totalBkg} icon={<Bookmark className="w-5 h-5" />} color="teal" />
            <StatCard label="Avg. Utilization" value={avgUtil} icon={<BarChart2 className="w-5 h-5" />} color="green" />
            <StatCard label="Active Users" value={activeUsers} icon={<Users className="w-5 h-5" />} color="purple" />
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
export function ParkingManagement({ nav }: { nav: (s: Screen) => void }) {
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

  const totalSlots = lots.reduce((acc, curr) => acc + (curr.total || 20), 0);
  const totalAvailable = lots.reduce((acc, curr) => acc + (curr.available !== undefined ? curr.available : 10), 0);
  const occupiedSlots = totalSlots - totalAvailable;
  const avgUtilization = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Parking Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{lots.length} lots across Indian cities</p>
        </div>
        <div className="flex gap-3">
          <Btn variant="outline" size="md" icon={<Download className="w-4 h-4" />}>Export</Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Lots" value={String(lots.length)} sub="All locations" icon={<Building2 className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Slots" value={String(totalSlots)} sub="Across all lots" icon={<Layers className="w-5 h-5" />} color="teal" />
        <StatCard label="Currently Occupied" value={String(occupiedSlots)} sub={`${avgUtilization.toFixed(1)}% utilization`} icon={<Car className="w-5 h-5" />} color="amber" />
        <StatCard label="Average Rate" value={`₹${lots.length > 0 ? Math.round(lots.reduce((acc, c) => acc + (c.price || 50), 0) / lots.length) : 50}/hr`} change="Standard pricing" icon={<DollarSign className="w-5 h-5" />} color="green" />
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-48 flex items-center gap-3 bg-card border border-border rounded-[14px] px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="Search lots..." />
        </div>
        <Btn variant="outline" size="md" icon={<Filter className="w-4 h-4" />}>Filter</Btn>
      </div>

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
                          }} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground cursor-pointer"><Eye className="w-4 h-4" /></button>
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
