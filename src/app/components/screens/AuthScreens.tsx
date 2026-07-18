import React, { useState, useEffect } from "react";
import {
  Car, AlertCircle, Mail, Lock, Phone, Smartphone, CheckCircle, Key, ChevronLeft
} from "lucide-react";
import { motion } from "motion/react";
import { authService } from "../../services/api";
import { Btn, Crd, Inp, cn, Screen } from "../ui/core-widgets";

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
export function LoginScreen({ nav }: { nav: (s: Screen) => void }) {
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
export function RegisterScreen({ nav }: { nav: (s: Screen) => void }) {
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
export function OTPScreen({ nav }: { nav: (s: Screen) => void }) {
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
export function AuthSuccess({ nav }: { nav: (s: Screen) => void }) {
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
export function ForgotScreen({ nav }: { nav: (s: Screen) => void }) {
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
