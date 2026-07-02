import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Mail, User, ShieldAlert, KeyRound, CheckCircle2, ArrowRight } from "lucide-react";

export function AuthScreen() {
  const { t } = useTranslation();
  const { login, signup, verifyOtp, forgotPassword, authLoading, authError, clearAuthError } = useAppStore();

  const [mode, setMode] = useState<"login" | "signup" | "otp" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpToken, setOtpToken] = useState("");
  
  const [successMsg, setSuccessMsg] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSwitchMode = (newMode: "login" | "signup" | "otp" | "forgot") => {
    setLocalError("");
    setSuccessMsg("");
    clearAuthError();
    setMode(newMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError("Please fill out all fields.");
      return;
    }
    setLocalError("");
    try {
      await login(email, password);
      // login action sets the store token, which automatically redirects the app
    } catch (err) {
      // Error handled in store's authError
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setLocalError("Please fill out all fields.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters long.");
      return;
    }
    setLocalError("");
    try {
      const msg = await signup(email, password, fullName);
      setSuccessMsg(msg);
      // Wait a moment, then transition to verify OTP panel
      setTimeout(() => {
        handleSwitchMode("otp");
      }, 2000);
    } catch (err) {
      // Error handled in store's authError
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpToken) {
      setLocalError("Please enter the OTP token.");
      return;
    }
    if (!/^\d{6}$/.test(otpToken)) {
      setLocalError("OTP must be exactly 6 digits.");
      return;
    }
    setLocalError("");
    try {
      await verifyOtp(email, otpToken);
    } catch (err) {
      // Error handled in store's authError
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setLocalError("Please enter your email.");
      return;
    }
    setLocalError("");
    try {
      const msg = await forgotPassword(email);
      setSuccessMsg(msg);
    } catch (err) {
      // Error handled in store's authError
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1116] flex flex-col justify-center px-6 relative overflow-hidden font-inter py-10">
      {/* Decorative Grid and Ambient Glow Backgrounds */}
      <div className="absolute inset-0 grid-bg-hero opacity-10 pointer-events-none animate-grid-move" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#1E8A5F]/10 blur-3xl pointer-events-none animate-glow-pulse" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <img 
          src="/logo.jpg" 
          alt="CivicPulse Logo" 
          className="w-14 h-14 rounded-2xl mx-auto border border-[#1E8A5F]/40 shadow-lg object-cover mb-3"
        />
        <h2 className="text-[#E8EDF2] text-xl font-bold font-sora tracking-tight">CivicPulse</h2>
        <p className="text-[#8B949E] text-xs mt-1">Nigeria's AI Civic Accountability Portal</p>
      </div>

      {/* Main Glassmorphic Card Container */}
      <div className="bg-[#161B22]/80 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-xl relative z-10 w-full max-w-[340px] mx-auto">
        <AnimatePresence mode="wait">
          {/* Error Banner */}
          {(authError || localError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#E3433D]/10 border border-[#E3433D]/30 text-[#FF6B65] text-xs rounded-xl p-3 flex items-start gap-2 mb-4"
            >
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </motion.div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#1E8A5F]/15 border border-[#1E8A5F]/40 text-[#26B07A] text-xs rounded-xl p-3 flex items-start gap-2 mb-4"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <h3 className="text-[#E8EDF2] text-sm font-bold font-sora uppercase tracking-wider mb-1">
                Log In
              </h3>

              <div className="space-y-1">
                <label className="text-[#8B949E] text-[10px] uppercase font-bold tracking-wider font-dm-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0E1116] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F] placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[#8B949E] text-[10px] uppercase font-bold tracking-wider font-dm-mono">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("forgot")}
                    className="text-[#1E8A5F] text-[10px] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0E1116] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F] placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#1E8A5F] hover:bg-[#26A674] text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-md shadow-[#1E8A5F]/15 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {authLoading ? "Logging in..." : "Log In"}
                <ArrowRight size={14} />
              </button>

              <div className="text-center pt-2">
                <p className="text-[#8B949E] text-[11px]">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("signup")}
                    className="text-[#1E8A5F] font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </motion.form>
          )}

          {mode === "signup" && (
            <motion.form
              key="signup"
              onSubmit={handleSignup}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3.5"
            >
              <h3 className="text-[#E8EDF2] text-sm font-bold font-sora uppercase tracking-wider mb-1">
                Create Account
              </h3>

              <div className="space-y-1">
                <label className="text-[#8B949E] text-[10px] uppercase font-bold tracking-wider font-dm-mono">
                  Full Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input
                    type="text"
                    required
                    placeholder="Ada Lovelace"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0E1116] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F] placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#8B949E] text-[10px] uppercase font-bold tracking-wider font-dm-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0E1116] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F] placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#8B949E] text-[10px] uppercase font-bold tracking-wider font-dm-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input
                    type="password"
                    required
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0E1116] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F] placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#1E8A5F] hover:bg-[#26A674] text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-md shadow-[#1E8A5F]/15 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {authLoading ? "Creating account..." : "Sign Up"}
                <ArrowRight size={14} />
              </button>

              <div className="text-center pt-1.5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode("otp")}
                  className="text-[#E8B95C] text-[10px] hover:underline"
                >
                  Enter verification OTP code instead
                </button>
                <p className="text-[#8B949E] text-[11px]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("login")}
                    className="text-[#1E8A5F] font-semibold hover:underline"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </motion.form>
          )}

          {mode === "otp" && (
            <motion.form
              key="otp"
              onSubmit={handleVerifyOtp}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <h3 className="text-[#E8EDF2] text-sm font-bold font-sora uppercase tracking-wider mb-1">
                Verify Email
              </h3>
              <p className="text-[#8B949E] text-[10.5px] leading-relaxed">
                Please enter the 6-digit confirmation token sent to your email to activate your account.
              </p>

              <div className="space-y-1">
                <label className="text-[#8B949E] text-[10px] uppercase font-bold tracking-wider font-dm-mono">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]/40" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0E1116]/50 border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#8B949E] focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#8B949E] text-[10px] uppercase font-bold tracking-wider font-dm-mono">
                  6-Digit OTP Token
                </label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#0E1116] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#E8EDF2] tracking-[0.2em] font-bold focus:outline-none focus:border-[#1E8A5F] placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#1E8A5F] hover:bg-[#26A674] text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-md shadow-[#1E8A5F]/15 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {authLoading ? "Verifying..." : "Verify & Log In"}
                <ArrowRight size={14} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode("signup")}
                  className="text-[#1E8A5F] text-[11px] font-semibold hover:underline"
                >
                  Back to Sign Up
                </button>
              </div>
            </motion.form>
          )}

          {mode === "forgot" && (
            <motion.form
              key="forgot"
              onSubmit={handleForgotPassword}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <h3 className="text-[#E8EDF2] text-sm font-bold font-sora uppercase tracking-wider mb-1">
                Reset Password
              </h3>
              <p className="text-[#8B949E] text-[11px] leading-relaxed">
                Enter your email address below. If an account is associated with it, we will email a password reset link.
              </p>

              <div className="space-y-1">
                <label className="text-[#8B949E] text-[10px] uppercase font-bold tracking-wider font-dm-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0E1116] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F] placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#1E8A5F] hover:bg-[#26A674] text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-md shadow-[#1E8A5F]/15 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {authLoading ? "Sending link..." : "Send Reset Email"}
                <ArrowRight size={14} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode("login")}
                  className="text-[#1E8A5F] text-[11px] font-semibold hover:underline"
                >
                  Back to Log In
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
