import React, { useState, useCallback } from "react";
import { Screen, cn } from "./components/ui/core-widgets";
import LandingPage from "./components/screens/LandingPage";
import {
  LoginScreen, RegisterScreen, ForgotScreen, OTPScreen, AuthSuccess
} from "./components/screens/AuthScreens";
import AppShell from "./components/layout/AppShell";
import {
  Dashboard, SearchScreen, DetailsScreen, SlotSelection, BookingConfirmation,
  BookingSuccess, BookingHistory, ProfileScreen
} from "./components/screens/UserScreens";
import {
  AdminDashboard, ParkingManagement
} from "./components/screens/AdminScreens";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [dark, setDark] = useState(false);

  const nav = useCallback((s: Screen) => setScreen(s), []);

  const appScreens: Screen[] = [
    "dashboard", "search", "details", "slots", "booking", "success", "history", "profile", "admin", "management"
  ];
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
