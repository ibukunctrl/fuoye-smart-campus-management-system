import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Building2,
  BookOpen,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import fuoyeLogo from "../../assets/images/fuoye-logo.jpg";
import { useAuth } from "../../context/AuthContext";

const features = [
  {
    icon: Building2,
    label: "Hostel Space Availability",
    desc: "See real-time room status across all hostel blocks",
  },
  {
    icon: BookOpen,
    label: "Classroom Booking",
    desc: "Reserve lecture halls, labs, and seminar rooms instantly",
  },
  {
    icon: CalendarCheck,
    label: "Real-time Booking Tracking",
    desc: "Track approvals and manage all your bookings in one place",
  },
];


export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("student");

  const [studentForm, setStudentForm] = useState({
    matricNumber: "",
    password: "",
  });

  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isAdmin = mode === "admin";

  function handleStudentChange(key) {
    return (e) => {
      setStudentForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));

      if (errors[key]) {
        setErrors((prev) => ({
          ...prev,
          [key]: "",
        }));
      }
    };
  }

  function handleAdminChange(key) {
    return (e) => {
      setAdminForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));

      if (errors[key]) {
        setErrors((prev) => ({
          ...prev,
          [key]: "",
        }));
      }
    };
  }

  function switchMode(next) {
    setMode(next);
    setErrors({});
    setShowPassword(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = {};

    // =========================
    // ADMIN LOGIN
    // =========================
    if (isAdmin) {
      if (!adminForm.email.trim()) {
        errs.email = "Email is required";
      }

      if (!adminForm.password) {
        errs.password = "Password is required";
      }

      if (Object.keys(errs).length) {
        setErrors(errs);
        return;
      }

      setLoading(true);

      const result = await login(
        adminForm.email.trim(),
        adminForm.password
      );

      if (!result || !result.success) {
        setLoading(false);
        setErrors({
          credential: result?.message || "Invalid admin credentials.",
        });
        return;
      }

      setLoading(false);
      navigate("/admin/dashboard");
      return;
    }

    // =========================
    // STUDENT LOGIN
    // =========================
    if (!studentForm.matricNumber.trim()) {
      errs.matricNumber = "Matric number is required";
    }

    if (!studentForm.password) {
      errs.password = "Password is required";
    }

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    const result = await login(
      studentForm.matricNumber.trim(),
      studentForm.password
    );

    if (!result || !result.success) {
      setLoading(false);
      setErrors({
        credential: result?.message || "Invalid matric number or password. Please try again.",
      });
      return;
    }

    setLoading(false);
    navigate("/dashboard");
  }

  const inputClass = (hasError) =>
    [
      "w-full px-4 py-2.5 rounded-xl border text-sm text-gray-700",
      "placeholder:text-gray-400 outline-none transition-all duration-200",
      hasError
        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
        : "border-gray-200 bg-gray-50 focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 focus:bg-white",
    ].join(" ");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT PANEL */}
      <div
        className="relative flex flex-col justify-between overflow-hidden
        px-8 py-10 lg:px-12 lg:py-12 lg:w-[44%] text-white"
        style={{
          background:
            "linear-gradient(150deg, #0B5D1E 0%, #0e6e25 55%, #084415 100%)",
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10 lg:mb-14">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
              <img
                src={fuoyeLogo}
                alt="FUOYE Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <p className="font-bold text-lg leading-none tracking-wide">
                FUOYE
              </p>

              <p
                className="text-[11px] leading-none mt-0.5"
                style={{ color: "#a8d5a2" }}
              >
                Smart Space System
              </p>
            </div>
          </div>

          <div className="mb-10 lg:mb-12">
            <h1 className="text-3xl lg:text-[2.4rem] font-bold leading-tight mb-3">
              One Platform.
              <br />
              All Your Spaces.
            </h1>

            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "#b8ddb2" }}
            >
              Book lecture halls, track hostel availability, and manage all your
              campus space needs from a single smart dashboard.
            </p>
          </div>

          <div className="hidden sm:flex flex-col space-y-5">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: "rgba(109,190,69,0.18)",
                  }}
                >
                  <Icon size={16} style={{ color: "#6DBE45" }} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>

                  <p
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: "#8dc98a" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-10 lg:mt-0">
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "#6DBE45" }}
          >
            <ShieldCheck size={13} />
            <span>Secured by FUOYE ICT Directorate</span>
          </div>

          <p className="text-[10px] mt-1" style={{ color: "#4a7a4a" }}>
            Federal University Oye-Ekiti
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-5 py-10 lg:px-12">
        <div className="w-full max-w-md">
          {/* MODE TOGGLE */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => switchMode("student")}
              className={[
                "flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200",
                !isAdmin
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              Student Login
            </button>

            <button
              onClick={() => switchMode("admin")}
              className={[
                "flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200",
                isAdmin
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              Admin Login
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-9">
            <div className="mb-7">
              {isAdmin ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={18} style={{ color: "#0B5D1E" }} />

                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                      Admin Access
                    </h2>
                  </div>

                  <p className="text-gray-500 text-sm">
                    Sign in to the FUOYE administration panel.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                    Welcome back
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    Sign in to access your FUOYE Smart Campus Management System
                    dashboard.
                  </p>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {isAdmin ? (
                <>
                  <div className="p-3 rounded-xl border border-amber-100 bg-amber-50">
                    <p className="text-[11px] text-amber-700 font-medium">
                      Demo credentials:
                      <span className="font-mono"> admin@fuoye.edu.ng</span>/
                      <span className="font-mono"> admin123</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="admin@fuoye.edu.ng"
                      value={adminForm.email}
                      onChange={handleAdminChange("email")}
                      className={inputClass(!!errors.email)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter admin password"
                        value={adminForm.password}
                        onChange={handleAdminChange("password")}
                        className={inputClass(!!errors.password) + " pr-11"}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Matric Number
                    </label>

                    <input
                      type="text"
                      placeholder="CSC/2022/1045"
                      value={studentForm.matricNumber}
                      onChange={handleStudentChange("matricNumber")}
                      className={
                        inputClass(!!errors.matricNumber) +
                        " font-mono tracking-wide"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={studentForm.password}
                        onChange={handleStudentChange("password")}
                        className={inputClass(!!errors.password) + " pr-11"}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-[#0B5D1E]"
                      />

                      <span className="text-xs text-gray-600">Remember me</span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium hover:underline"
                      style={{ color: "#0B5D1E" }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                </>
              )}

              {errors.credential && (
                <div className="p-3 rounded-xl border border-red-100 bg-red-50">
                  <p className="text-red-600 text-xs">{errors.credential}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
                style={{ backgroundColor: "#0B5D1E" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    {isAdmin ? "Access Admin Panel" : "Sign In"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {!isAdmin && (
              <div className="mt-5 text-center">
                <p className="text-sm text-gray-500">
                  New student?{" "}
                  <Link
                    to="/register"
                    className="font-semibold hover:underline"
                    style={{ color: "#0B5D1E" }}
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Having trouble signing in?{" "}
                <button className="font-semibold text-gray-600 hover:underline">
                  Contact ICT Support
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-5">
            FUOYE Smart Campus Management System © 2026 Developed by CSC 320
            Project GROUP B · Federal University Oye-Ekiti
          </p>
        </div>
      </div>
    </div>
  );
}
