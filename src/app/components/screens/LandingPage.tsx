import React, { useState, useEffect } from "react";
import {
  Search, ChevronRight, ChevronDown, MapPin, Zap, Sun, Moon, Calendar, Check,
  Car, Shield, BatteryCharging, Clock, CreditCard, Building2, Layers, DollarSign
} from "lucide-react";
import { motion } from "motion/react";
import { lotService } from "../../services/api";
import {
  Btn, Crd, Bdg, AnimatedLogo, ParkingIllustration, ParkingCard, cn, Screen
} from "../ui/core-widgets";

export default function LandingPage({ nav, dark, setDark }: { nav: (s: Screen) => void; dark: boolean; setDark: (v: boolean) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lots, setLots] = useState<any[]>([]);
  const [loadingLots, setLoadingLots] = useState(true);

  useEffect(() => {
    let active = true;
    lotService.searchLots()
      .then(res => {
        if (active) setLots(res || []);
      })
      .catch(err => {
        console.error("Failed to load lots:", err);
      })
      .finally(() => {
        if (active) setLoadingLots(false);
      });
    return () => { active = false; };
  }, []);

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: "Instant Booking", desc: "Reserve your spot in under 30 seconds with real-time availability across our registered locations.", c: "blue" },
    { icon: <Shield className="w-6 h-6" />, title: "Fully Secured", desc: "24/7 CCTV surveillance, licensed attendants, and full insurance on every booking.", c: "teal" },
    { icon: <Car className="w-6 h-6" />, title: "Smart Navigation", desc: "Turn-by-turn directions to your reserved spot the moment your booking is confirmed.", c: "green" },
    { icon: <BatteryCharging className="w-6 h-6" />, title: "EV Charging", desc: "Hundreds of EV-ready stalls at major locations — filter by connector type.", c: "amber" },
    { icon: <Clock className="w-6 h-6" />, title: "Flexible Duration", desc: "Hourly, daily, or monthly — book exactly what you need, cancel what you don't.", c: "purple" },
    { icon: <CreditCard className="w-6 h-6" />, title: "Contactless Pay", desc: "Apple Pay, Google Pay, and all major credit cards. Zero hidden fees, ever.", c: "rose" },
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
            <AnimatedLogo className="w-8 h-8 flex-shrink-0" />
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
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
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

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl">
          <ParkingIllustration />
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
          {loadingLots ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Loading active parking lots...</div>
          ) : lots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {lots.slice(0, 4).map(lot => <ParkingCard key={lot.id} lot={lot} onClick={() => nav("login")} />)}
            </div>
          ) : (
            <div className="text-center py-16 px-6 border border-border rounded-[22px] bg-muted/10">
              <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4 animate-bounce" />
              <p className="text-base font-bold text-foreground mb-1">No active parking spots</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">There are no parking lots registered on ParkHere at the moment. Sign in to add your first lot!</p>
              <Btn variant="primary" size="sm" onClick={() => nav("login")}>Sign in as Admin</Btn>
            </div>
          )}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Crd key={plan.name} className={cn("p-8 relative bg-card", plan.popular && "border-primary ring-2 ring-primary/15 shadow-xl shadow-primary/5")}>
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
      <section id="faq" className="py-24 px-6">
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
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[28px] p-12 text-white shadow-xl shadow-blue-500/20">
            <div className="w-14 h-14 bg-white/15 rounded-[18px] flex items-center justify-center mx-auto mb-5">
              <AnimatedLogo className="w-8 h-8 flex-shrink-0" />
            </div>
            <h2 className="text-3xl font-black mb-3">Ready to park smarter?</h2>
            <p className="text-blue-100 mb-8 max-w-sm mx-auto">Join drivers who have eliminated parking stress from their lives.</p>
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
                <AnimatedLogo className="w-8 h-8 flex-shrink-0" />
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
