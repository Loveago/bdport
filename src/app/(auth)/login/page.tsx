"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { BrandMark } from "@/components/brand-logo";
import { useToast } from "@/components/toast";
import { Spinner } from "@/components/shared";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  User,
  Users,
  Briefcase,
  Layers,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpTicket, setOtpTicket] = useState<string>("");
  const [otpEmail, setOtpEmail] = useState<string>("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string>("");
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@mycedinet.com",
      password: "ChooseAStrongPassword123!",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Login failed");
        return;
      }

      if (json.requireOtp) {
        setStep("otp");
        setOtpTicket(json.otpTicket);
        setOtpEmail(json.email);
        if (json.devOtp) setDevOtp(json.devOtp);
        toast("One-Time Passcode sent to your email", "info");
        return;
      }

      toast("Signed in successfully", "success");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("An unexpected connection error occurred. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast("Please enter the 6-digit code", "error");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpTicket, code: otpCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "OTP verification failed", "error");
        return;
      }
      toast("Signed in successfully", "success");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setVerifyingOtp(false);
    }
  };

  const setDemoAccount = (email: string) => {
    setValue("email", email);
    setValue("password", "ChooseAStrongPassword123!");
    toast(`Loaded ${email} credentials`, "info");
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-[#00df82] selection:text-slate-950 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Header / Brand Logo matching screenshot */}
        <div className="flex flex-col items-center text-center space-y-2">
          <BrandMark size="lg" className="shadow-2xl shadow-[#00df82]/30 mb-2" />
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white tracking-tight">BUNDLE PORTAL</span>
            <span className="rounded bg-[#00df82]/15 text-[#00df82] border border-[#00df82]/40 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
              PORTAL
            </span>
          </div>
          <p className="text-xs text-slate-400">Telecom Wholesale &amp; Reseller Engine</p>
          <h2 className="text-xl font-bold text-white pt-2">Sign in to your account</h2>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl border border-[#14233a] bg-[#0a1220]/90 backdrop-blur-xl p-6 sm:p-7 shadow-2xl space-y-5">
          {serverError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {serverError}
            </div>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="admin@mycedinet.com"
                    className="w-full h-11 rounded-xl bg-[#070d18] border border-[#14233a] pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none focus:border-[#00df82] transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-rose-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] text-[#00df82] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    className="w-full h-11 rounded-xl bg-[#070d18] border border-[#14233a] pl-10 pr-10 text-xs text-white placeholder:text-slate-600 outline-none focus:border-[#00df82] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-rose-400">{errors.password.message}</p>
                )}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#00df82] hover:bg-[#00f59b] text-slate-950 font-black text-xs shadow-lg shadow-[#00df82]/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <div className="inline-flex p-3 rounded-full bg-[#00df82]/15 text-[#00df82]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Enter Security Code</h3>
                <p className="text-[11px] text-slate-400">
                  Check <span className="text-white">{otpEmail}</span> for your 6-digit passcode.
                </p>
                {devOtp && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                    Development OTP: <strong>{devOtp}</strong>
                  </div>
                )}
              </div>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full h-12 text-center text-xl font-mono tracking-widest rounded-xl bg-[#070d18] border border-[#14233a] text-white outline-none focus:border-[#00df82]"
              />

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otpCode.length !== 6}
                className="w-full h-11 rounded-xl bg-[#00df82] hover:bg-[#00f59b] text-slate-950 font-black text-xs shadow-lg shadow-[#00df82]/25 flex items-center justify-center gap-2 transition-all"
              >
                {verifyingOtp ? <Spinner className="h-4 w-4" /> : <span>Verify &amp; Enter Dashboard</span>}
              </button>
            </div>
          )}

          {/* One-Click Demo Access matching screenshot */}
          <div className="pt-4 border-t border-[#14233a] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <span>🔑</span>
              <span>One-Click Demo Access</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDemoAccount("admin@mycedinet.com")}
                className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-colors"
              >
                <div className="text-xs font-bold text-emerald-400">Super Admin</div>
                <div className="text-[9px] text-slate-500 truncate">admin@mycedinet.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount("reseller@mycedinet.com")}
                className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-left transition-colors"
              >
                <div className="text-xs font-bold text-blue-400">Reseller Pro</div>
                <div className="text-[9px] text-slate-500 truncate">reseller@mycedinet.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount("user@mycedinet.com")}
                className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-left transition-colors"
              >
                <div className="text-xs font-bold text-purple-400">Retail User</div>
                <div className="text-[9px] text-slate-500 truncate">user@mycedinet.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount("secretary@mycedinet.com")}
                className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-left transition-colors"
              >
                <div className="text-xs font-bold text-amber-400">Secretary</div>
                <div className="text-[9px] text-slate-500 truncate">secretary@mycedinet.com</div>
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Don't have an account? </span>
            <Link
              href="/register"
              className="text-xs font-bold text-[#00df82] hover:underline"
            >
              Sign up with invite code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
