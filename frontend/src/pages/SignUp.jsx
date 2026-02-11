import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Mail,
  Lock,
  Phone,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        login(data.token, data.user);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setErrors({ submit: data.message || "Registration failed" });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    icon: Icon,
    label,
    name,
    type = "text",
    placeholder,
    error,
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none transition-all duration-200 text-sm ${
            error
              ? "border-red-400 focus:border-red-500 bg-red-50/50"
              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
          }`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-32 right-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <a href="/" className="flex items-center gap-3 mb-12">
            <img
              src="/favicon.svg"
              alt="AutoServe"
              className="w-12 h-12 rounded-xl border border-white/20"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">AutoServe</h1>
              <p className="text-[10px] text-blue-300 font-semibold tracking-wider uppercase">
                Vehicle Service Pro
              </p>
            </div>
          </a>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Join thousands of
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              smart vehicle owners
            </span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md mb-10">
            Create your free account and start booking vehicle services in
            minutes. Quick, easy, and hassle-free.
          </p>
          <div className="space-y-4">
            {[
              "Book services in under 2 minutes",
              "Track real-time service updates",
              "Access certified technicians",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <a href="/" className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt="AutoServe"
                className="w-11 h-11 rounded-xl shadow-md"
              />
              <span className="text-xl font-bold text-gray-800">AutoServe</span>
            </a>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-500 mb-8">
            Fill in your details to get started
          </p>

          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">
                Registration successful! Redirecting to dashboard...
              </span>
            </div>
          )}

          {errors.submit && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={User}
              label="Full Name"
              name="name"
              placeholder="John Doe"
              error={errors.name}
            />
            <InputField
              icon={Mail}
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              error={errors.email}
            />
            <InputField
              icon={Phone}
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="1234567890"
              error={errors.phone}
            />
            <InputField
              icon={Lock}
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              error={errors.password}
            />
            <InputField
              icon={Lock}
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              error={errors.confirmPassword}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/signin")}
              className="text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
