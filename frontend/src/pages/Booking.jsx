import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Car,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ListChecks,
  CalendarClock,
  ClipboardCheck,
  Clock,
  DollarSign,
  StickyNote,
  Wrench,
  Shield,
  Sparkles,
  Search,
  Cog,
  Eye,
  Paintbrush,
  Tag,
  ChevronRight,
  ChevronDown,
  Zap,
  Star,
  Timer,
  Filter,
  X,
  Factory,
  Calendar,
  Hash,
  Palette,
  Info,
  TrendingUp,
  MapPin,
  Flame,
  Snowflake,
  Sun,
  CloudRain,
  History,
  Lightbulb,
  PartyPopper,
  BadgeCheck,
  RotateCcw,
  Gauge,
} from "lucide-react";

/* ─── Popular vehicle data for smart suggestions ─────────────── */
const popularMakes = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Nissan",
  "Hyundai",
  "Kia",
  "Volkswagen",
  "Subaru",
  "Mazda",
  "Lexus",
  "Jeep",
  "Tesla",
  "Volvo",
  "Porsche",
];

const modelsByMake = {
  Toyota: [
    "Camry",
    "Corolla",
    "RAV4",
    "Highlander",
    "Tacoma",
    "Prius",
    "4Runner",
    "Supra",
  ],
  Honda: [
    "Civic",
    "Accord",
    "CR-V",
    "Pilot",
    "HR-V",
    "Odyssey",
    "Fit",
    "Ridgeline",
  ],
  Ford: [
    "F-150",
    "Mustang",
    "Explorer",
    "Escape",
    "Bronco",
    "Edge",
    "Ranger",
    "Maverick",
  ],
  Chevrolet: [
    "Silverado",
    "Malibu",
    "Equinox",
    "Camaro",
    "Traverse",
    "Tahoe",
    "Colorado",
  ],
  BMW: ["3 Series", "5 Series", "X3", "X5", "X1", "7 Series", "M3", "M5"],
  "Mercedes-Benz": [
    "C-Class",
    "E-Class",
    "GLC",
    "GLE",
    "A-Class",
    "S-Class",
    "AMG GT",
  ],
  Audi: ["A4", "A6", "Q5", "Q7", "A3", "Q3", "e-tron", "RS5"],
  Nissan: [
    "Altima",
    "Sentra",
    "Rogue",
    "Pathfinder",
    "Frontier",
    "Maxima",
    "Kicks",
  ],
  Hyundai: [
    "Elantra",
    "Tucson",
    "Santa Fe",
    "Sonata",
    "Kona",
    "Palisade",
    "Ioniq 5",
  ],
  Kia: ["Forte", "Seltos", "Sportage", "Sorento", "Telluride", "K5", "EV6"],
  Volkswagen: ["Jetta", "Tiguan", "Atlas", "Golf", "ID.4", "Taos", "Passat"],
  Subaru: [
    "Outback",
    "Forester",
    "Crosstrek",
    "Impreza",
    "WRX",
    "Ascent",
    "BRZ",
  ],
  Mazda: ["Mazda3", "CX-5", "CX-30", "CX-50", "MX-5 Miata", "CX-9", "Mazda6"],
  Lexus: ["RX", "ES", "NX", "IS", "GX", "UX", "LC"],
  Jeep: [
    "Wrangler",
    "Grand Cherokee",
    "Cherokee",
    "Compass",
    "Gladiator",
    "Renegade",
  ],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  Volvo: ["XC60", "XC90", "S60", "V60", "XC40", "S90", "C40"],
  Porsche: ["911", "Cayenne", "Macan", "Taycan", "Panamera", "718 Boxster"],
};

/* ─── Category config ────────────────────────────────────────────── */
const categoryConfig = {
  maintenance: {
    label: "Maintenance",
    Icon: Wrench,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    ring: "ring-blue-400",
    badge: "bg-blue-100 text-blue-700",
    border: "border-blue-200",
    activeBorder: "border-blue-500",
    glow: "shadow-blue-200/50",
    accent: "from-blue-400 to-blue-600",
  },
  repair: {
    label: "Repair",
    Icon: Cog,
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    ring: "ring-amber-400",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    activeBorder: "border-amber-500",
    glow: "shadow-amber-200/50",
    accent: "from-amber-400 to-orange-500",
  },
  inspection: {
    label: "Inspection",
    Icon: Eye,
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    ring: "ring-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    activeBorder: "border-emerald-500",
    glow: "shadow-emerald-200/50",
    accent: "from-emerald-400 to-teal-500",
  },
  customization: {
    label: "Customization",
    Icon: Paintbrush,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    ring: "ring-violet-400",
    badge: "bg-violet-100 text-violet-700",
    border: "border-violet-200",
    activeBorder: "border-violet-500",
    glow: "shadow-violet-200/50",
    accent: "from-violet-400 to-purple-500",
  },
};

const categories = ["all", ...Object.keys(categoryConfig)];

/* ─── Time slots with smart popularity data ──────────────────── */
const timeSlotData = [
  { time: "09:00 AM", popularity: "high", period: "morning" },
  { time: "10:00 AM", popularity: "high", period: "morning" },
  { time: "11:00 AM", popularity: "medium", period: "morning" },
  { time: "12:00 PM", popularity: "low", period: "afternoon" },
  { time: "01:00 PM", popularity: "low", period: "afternoon" },
  { time: "02:00 PM", popularity: "medium", period: "afternoon" },
  { time: "03:00 PM", popularity: "medium", period: "afternoon" },
  { time: "04:00 PM", popularity: "high", period: "afternoon" },
];

const popularityColors = {
  high: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-400",
    label: "Popular",
  },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    dot: "bg-yellow-400",
    label: "Moderate",
  },
  low: {
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-400",
    label: "Available",
  },
};

/* ─── Smart date helpers ─────────────────────────────────────── */
function getSmartDates() {
  const dates = [];
  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === 0) continue; // Skip Sundays
    dates.push({
      date: d.toISOString().split("T")[0],
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
      isWeekend: d.getDay() === 6,
      isTomorrow: i === 1,
      isNextWeek: i > 7,
      label:
        i === 1
          ? "Tomorrow"
          : i === 2
            ? "Day after"
            : `${dayNames[d.getDay()]}`,
    });
  }
  return dates;
}

/* ─── Confetti particle ──────────────────────────────────────── */
function ConfettiCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ef4444",
      "#06b6d4",
      "#ec4899",
    ];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 6 - 3,
      opacity: 1,
    }));

    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        alive = true;
        p.y += p.speed;
        p.x += Math.sin(p.wobble) * 0.5;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) p.opacity -= 0.02;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}

/* ─── Animated number counter ────────────────────────────────── */
function AnimatedPrice({ value }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 600;
    const start = displayed;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{displayed}</>;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  BOOKING PAGE                                                  */
/* ═══════════════════════════════════════════════════════════════ */
function BookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategory, setServiceCategory] = useState("all");
  const [direction, setDirection] = useState("forward");
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [savedVehicle, setSavedVehicle] = useState(null);
  const [showSavedVehicleHint, setShowSavedVehicleHint] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const makeRef = useRef(null);
  const modelRef = useRef(null);
  const contentRef = useRef(null);

  const [formData, setFormData] = useState({
    serviceId: "",
    vehicleInfo: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
      color: "",
    },
    bookingDate: "",
    timeSlot: "",
    notes: "",
  });

  /* ── Fetch services ── */
  useEffect(() => {
    fetchServices();
    // Load saved vehicle from localStorage
    const saved = localStorage.getItem("lastVehicle");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedVehicle(parsed);
        setShowSavedVehicleHint(true);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/services");
      const data = await response.json();
      if (data.success) setServices(data.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      vehicleInfo: { ...prev.vehicleInfo, [name]: value },
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const selectMake = (make) => {
    setFormData((prev) => ({
      ...prev,
      vehicleInfo: { ...prev.vehicleInfo, make, model: "" },
    }));
    setShowMakeSuggestions(false);
    setErrors((prev) => ({ ...prev, make: "" }));
  };

  const selectModel = (model) => {
    setFormData((prev) => ({
      ...prev,
      vehicleInfo: { ...prev.vehicleInfo, model },
    }));
    setShowModelSuggestions(false);
    setErrors((prev) => ({ ...prev, model: "" }));
  };

  const loadSavedVehicle = () => {
    if (savedVehicle) {
      setFormData((prev) => ({
        ...prev,
        vehicleInfo: { ...savedVehicle },
      }));
      setShowSavedVehicleHint(false);
      setErrors({});
    }
  };

  /* ── Validation ── */
  const validateStep = () => {
    const newErrors = {};
    if (step === 1 && !formData.serviceId)
      newErrors.serviceId = "Please select a service";
    if (step === 2) {
      if (!formData.vehicleInfo.make)
        newErrors.make = "Vehicle make is required";
      if (!formData.vehicleInfo.model)
        newErrors.model = "Vehicle model is required";
      if (!formData.vehicleInfo.licensePlate)
        newErrors.licensePlate = "License plate is required";
    }
    if (step === 3) {
      if (!formData.bookingDate) newErrors.bookingDate = "Date is required";
      if (!formData.timeSlot) newErrors.timeSlot = "Time slot is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (target) => {
    setDirection(target > step ? "forward" : "backward");
    setStep(target);
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextStep = () => {
    if (validateStep()) goToStep(step + 1);
  };

  const handlePrevStep = () => {
    goToStep(step - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    setLoading(true);
    try {
      const sel = services.find((s) => s._id === formData.serviceId);
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          vehicleInfo: formData.vehicleInfo,
          bookingDate: formData.bookingDate,
          timeSlot: formData.timeSlot,
          notes: formData.notes,
          totalPrice: sel?.price || 0,
          serviceName: sel?.name || "Vehicle Service",
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Save vehicle info for next time
        localStorage.setItem(
          "lastVehicle",
          JSON.stringify(formData.vehicleInfo),
        );
        setBookingId(data.data?._id);
        setSuccess(true);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin");
      } else {
        setErrors({ submit: data.message || "Booking failed" });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived data ── */
  const selectedService = services.find((s) => s._id === formData.serviceId);
  const smartDates = useMemo(() => getSmartDates(), []);

  const filtered = services.filter((s) => {
    const matchCat =
      serviceCategory === "all" || s.category === serviceCategory;
    const matchSearch =
      !serviceSearch ||
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const cheapest =
    services.length > 0
      ? services.reduce((a, b) => (a.price < b.price ? a : b))._id
      : null;
  const mostExpensive =
    services.length > 0
      ? services.reduce((a, b) => (a.price > b.price ? a : b))._id
      : null;

  // Smart recommendations based on vehicle age
  const vehicleAge =
    new Date().getFullYear() -
    (formData.vehicleInfo.year || new Date().getFullYear());
  const recommendedCategories = useMemo(() => {
    if (vehicleAge > 8) return ["inspection", "repair"];
    if (vehicleAge > 4) return ["maintenance", "inspection"];
    return ["maintenance", "customization"];
  }, [vehicleAge]);

  const filteredMakes = popularMakes.filter((m) =>
    m.toLowerCase().includes((formData.vehicleInfo.make || "").toLowerCase()),
  );

  const availableModels = modelsByMake[formData.vehicleInfo.make] || [];
  const filteredModels = availableModels.filter((m) =>
    m.toLowerCase().includes((formData.vehicleInfo.model || "").toLowerCase()),
  );

  // Estimate total with tax
  const subtotal = selectedService?.price || 0;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const stepInfo = [
    { num: 1, label: "Service", desc: "Choose a service", Icon: ListChecks },
    { num: 2, label: "Vehicle", desc: "Your vehicle info", Icon: Car },
    {
      num: 3,
      label: "Schedule",
      desc: "Pick date & time",
      Icon: CalendarClock,
    },
    { num: 4, label: "Review", desc: "Confirm booking", Icon: ClipboardCheck },
  ];

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handleClick = (e) => {
      if (makeRef.current && !makeRef.current.contains(e.target))
        setShowMakeSuggestions(false);
      if (modelRef.current && !modelRef.current.contains(e.target))
        setShowModelSuggestions(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ═══════════════════════════════════════════════════════════════ */
  /*  SUCCESS SCREEN                                                */
  /* ═══════════════════════════════════════════════════════════════ */
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <ConfettiCanvas />
        <div className="max-w-lg w-full text-center animate-[fadeInUp_0.6s_ease-out]">
          {/* Success icon */}
          <div className="relative mx-auto w-28 h-28 mb-8">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-emerald-400/30 rounded-full animate-pulse" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-gray-500 mb-2 text-lg">
            Your appointment has been successfully scheduled
          </p>

          {selectedService && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mt-8 text-left">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <BadgeCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {selectedService.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(formData.bookingDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      },
                    )}{" "}
                    at {formData.timeSlot}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                    Vehicle
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formData.vehicleInfo.year} {formData.vehicleInfo.make}{" "}
                    {formData.vehicleInfo.model}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                    Total
                  </p>
                  <p className="text-sm font-extrabold text-emerald-600">
                    ${total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              View My Bookings
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setStep(1);
                setFormData({
                  serviceId: "",
                  vehicleInfo: {
                    make: "",
                    model: "",
                    year: new Date().getFullYear(),
                    licensePlate: "",
                    color: "",
                  },
                  bookingDate: "",
                  timeSlot: "",
                  notes: "",
                });
              }}
              className="px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Book Another
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════ */
  /*  MAIN BOOKING FLOW                                             */
  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/80">
      {/* ═══ HERO HEADER ═══ */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40" />
          <div className="flex items-center justify-between py-5 sm:py-6">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20">
                <Car className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Book Your{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    Service
                  </span>
                </h1>
                <p className="text-blue-300/60 text-[11px] sm:text-xs mt-0.5 hidden sm:block">
                  Premium vehicle care in just a few clicks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-blue-200">
                    Hi, {user.name?.split(" ")[0] || "there"}
                  </span>
                </div>
              )}
              <div className="hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-medium text-blue-200">
                  Book in under 2 min
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium text-blue-200">
                  Secure & Encrypted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PROGRESS STEPS ═══ */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Progress bar background */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            {stepInfo.map((s, index) => (
              <div key={s.num} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (s.num < step) goToStep(s.num);
                  }}
                  className={`flex items-center gap-2 sm:gap-3 ${s.num < step ? "cursor-pointer group" : "cursor-default"}`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-500 flex-shrink-0 ${
                      step === s.num
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110"
                        : step > s.num
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <s.Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p
                      className={`text-xs font-bold ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {s.label}
                    </p>
                    <p className="text-[10px] text-gray-400">{s.desc}</p>
                  </div>
                </button>
                {index < stepInfo.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 rounded-full transition-all duration-700 ${step > s.num ? "bg-emerald-400" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ALERTS ═══ */}
      {errors.submit && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl animate-[shake_0.4s_ease-out]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{errors.submit}</span>
            <button
              type="button"
              onClick={() => setErrors((prev) => ({ ...prev, submit: "" }))}
              className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <form onSubmit={handleSubmit} className="flex-1">
        <div
          ref={contentRef}
          className="transition-all duration-500 ease-out"
          style={{ animation: "fadeSlide 0.4s ease-out" }}
          key={step}
        >
          {/* ─────────────────────────────────────────────────────── */}
          {/* STEP 1: SERVICE SELECTION                              */}
          {/* ─────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <ListChecks className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      Step 1 of 4
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Choose Your Service
                  </h2>
                  <p className="text-sm text-gray-400 mt-1 max-w-lg">
                    Browse our premium services. Select the one that best fits
                    your vehicle's needs.
                  </p>
                </div>

                {/* Selected service floating badge */}
                {selectedService && (
                  <div className="flex items-center gap-3 bg-white border-2 border-blue-100 rounded-2xl px-5 py-3 shadow-sm animate-[fadeInUp_0.3s_ease-out]">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                        Selected
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedService.name}
                      </p>
                    </div>
                    <div className="ml-4 pl-4 border-l border-gray-100">
                      <p className="text-lg font-extrabold text-blue-600">
                        ${selectedService.price}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Smart recommendation hint */}
              {formData.vehicleInfo.year &&
                formData.vehicleInfo.year < new Date().getFullYear() && (
                  <div className="mb-4 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-5 py-3">
                    <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">
                        Smart Suggestion
                      </p>
                      <p className="text-xs text-amber-600">
                        Based on your vehicle's age ({vehicleAge} years), we
                        recommend{" "}
                        <strong>
                          {recommendedCategories
                            .map((c) => categoryConfig[c]?.label)
                            .join(" & ")}
                        </strong>{" "}
                        services.
                      </p>
                    </div>
                  </div>
                )}

              {/* Search & Filter Bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search services by name or description..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 text-sm border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50/50 focus:bg-white"
                    />
                    {serviceSearch && (
                      <button
                        type="button"
                        onClick={() => setServiceSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1">
                      <Filter className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    {categories.map((cat) => {
                      const isActive = serviceCategory === cat;
                      const conf = categoryConfig[cat];
                      const count =
                        cat === "all"
                          ? services.length
                          : services.filter((s) => s.category === cat).length;
                      const isRecommended = recommendedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setServiceCategory(cat)}
                          className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 border-2 ${
                            isActive
                              ? cat === "all"
                                ? "border-gray-900 bg-gray-900 text-white shadow-md"
                                : `${conf.activeBorder} ${conf.badge} ring-1 ${conf.ring} shadow-sm`
                              : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {conf && <conf.Icon className="w-3.5 h-3.5" />}
                          {cat === "all" ? "All Services" : conf.label}
                          <span
                            className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? (cat === "all" ? "bg-white/20" : "bg-white/60") : "bg-gray-100"}`}
                          >
                            {count}
                          </span>
                          {isRecommended && !isActive && (
                            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                              <Star className="w-2 h-2 text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400 font-medium">
                    Showing {filtered.length} of {services.length} services
                    {serviceCategory !== "all" && (
                      <span className="ml-2 text-blue-500">
                        in {categoryConfig[serviceCategory]?.label}
                      </span>
                    )}
                  </p>
                  {(serviceSearch || serviceCategory !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setServiceSearch("");
                        setServiceCategory("all");
                      }}
                      className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* Smart Picks for You */}
              {services.length > 0 && !formData.serviceId && (
                <div className="mb-6 animate-[fadeInUp_0.4s_ease-out]">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-gray-800">
                      Smart Picks for You
                    </h3>
                    <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                      AI Powered
                    </span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {services
                      .filter(
                        (s) =>
                          recommendedCategories.includes(s.category) &&
                          s.isAvailable,
                      )
                      .slice(0, 3)
                      .map((service) => {
                        const conf =
                          categoryConfig[service.category] ||
                          categoryConfig.maintenance;
                        return (
                          <button
                            key={`smart-${service._id}`}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                serviceId: service._id,
                              }));
                              setErrors({});
                            }}
                            className={`flex-shrink-0 flex items-center gap-3 bg-gradient-to-r ${conf.accent} rounded-xl p-4 text-white min-w-[260px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${formData.serviceId === service._id ? "ring-2 ring-white/50 shadow-xl" : ""}`}
                          >
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <conf.Icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-sm">
                                {service.name}
                              </p>
                              <p className="text-white/70 text-xs mt-0.5">
                                ${service.price} · {service.duration}m
                              </p>
                            </div>
                            <Zap className="w-4 h-4 ml-auto text-white/50" />
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Service Cards Grid */}
              {filtered.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((service, idx) => {
                    const conf =
                      categoryConfig[service.category] ||
                      categoryConfig.maintenance;
                    const isSelected = formData.serviceId === service._id;
                    const isBestValue = service._id === cheapest;
                    const isPremium = service._id === mostExpensive;
                    const isRecommended = recommendedCategories.includes(
                      service.category,
                    );

                    return (
                      <button
                        key={service._id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            serviceId: service._id,
                          }));
                          setErrors({});
                        }}
                        className={`group relative text-left rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl overflow-hidden ${
                          isSelected
                            ? `${conf.activeBorder} ${conf.bg} shadow-xl ${conf.glow} ring-2 ${conf.ring}`
                            : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg"
                        }`}
                        style={{
                          animationDelay: `${idx * 50}ms`,
                          animation: "fadeInUp 0.4s ease-out both",
                        }}
                      >
                        {/* Top gradient accent */}
                        <div
                          className={`h-1.5 w-full bg-gradient-to-r ${conf.accent} transition-all duration-300 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        />

                        {/* Selection indicator */}
                        <div
                          className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                            isSelected
                              ? "border-blue-500 bg-blue-500 shadow-lg shadow-blue-500/30 scale-110"
                              : "border-gray-200 bg-white group-hover:border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>

                        <div className="p-5 sm:p-6">
                          {/* Category icon */}
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${isSelected ? conf.iconBg : "bg-gray-50 group-hover:" + conf.iconBg}`}
                          >
                            <conf.Icon
                              className={`w-6 h-6 transition-colors duration-300 ${isSelected ? conf.iconColor : "text-gray-400 group-hover:" + conf.iconColor}`}
                            />
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${conf.badge}`}
                            >
                              {conf.label}
                            </span>
                            {isBestValue && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                                <Tag className="w-2.5 h-2.5" />
                                Best Value
                              </span>
                            )}
                            {isPremium && !isBestValue && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                                <Star className="w-2.5 h-2.5" />
                                Premium
                              </span>
                            )}
                            {isRecommended && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-700">
                                <Lightbulb className="w-2.5 h-2.5" />
                                Suggested
                              </span>
                            )}
                          </div>

                          {/* Name */}
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug mb-2">
                            {service.name}
                          </h3>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>

                          {/* Price + Duration footer */}
                          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                            <div>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                                From
                              </p>
                              <p className="text-2xl font-extrabold text-gray-900">
                                <span className="text-sm font-bold text-gray-400 mr-0.5">
                                  $
                                </span>
                                {service.price}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                                <Timer className="w-3.5 h-3.5" />
                                <span className="font-semibold">
                                  {service.duration}m
                                </span>
                              </div>
                              {service.isAvailable && (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-2 rounded-lg">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  <span className="font-semibold">Open</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom selection highlight */}
                        {isSelected && (
                          <div
                            className={`h-1 w-full bg-gradient-to-r ${conf.accent}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <Search className="w-9 h-9 text-gray-300" />
                  </div>
                  <p className="text-gray-600 text-lg font-bold mb-1">
                    No services found
                  </p>
                  <p className="text-gray-400 text-sm mb-5 max-w-sm mx-auto">
                    We couldn't find any services matching your search. Try
                    adjusting your filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceSearch("");
                      setServiceCategory("all");
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Smart Bundle Suggestion */}
              {selectedService &&
                (() => {
                  const bundleMap = {
                    maintenance: "inspection",
                    repair: "maintenance",
                    inspection: "customization",
                    customization: "maintenance",
                  };
                  const suggestedCat =
                    bundleMap[selectedService.category] || "maintenance";
                  const bundleService = services.find(
                    (s) =>
                      s.category === suggestedCat &&
                      s._id !== selectedService._id &&
                      s.isAvailable,
                  );
                  if (!bundleService) return null;
                  const conf =
                    categoryConfig[suggestedCat] || categoryConfig.maintenance;
                  const comboSave = Math.round(
                    (selectedService.price + bundleService.price) * 0.1,
                  );
                  return (
                    <div className="mt-4 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 rounded-2xl border border-violet-200/50 p-5 animate-[fadeInUp_0.3s_ease-out]">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-violet-600" />
                        <p className="text-xs font-bold text-violet-800">
                          Customers Also Booked
                        </p>
                        <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold ml-auto">
                          Save ~${comboSave}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${conf.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                        >
                          <conf.Icon className={`w-5 h-5 ${conf.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800">
                            {bundleService.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {bundleService.description}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-extrabold text-gray-900">
                            ${bundleService.price}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {bundleService.duration}m
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {errors.serviceId && (
                <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl animate-[shake_0.4s_ease-out]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {errors.serviceId}
                  </span>
                </div>
              )}

              {/* Step 1 Navigation */}
              <div className="mt-8 flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  {selectedService ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {selectedService.name} selected — ${selectedService.price}
                    </span>
                  ) : (
                    <span>Select a service to continue</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className={`group px-8 py-3.5 font-semibold rounded-xl transition-all flex items-center gap-2 text-sm ${
                    selectedService
                      ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue to Vehicle Info
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────── */}
          {/* STEPS 2-4: SIDEBAR + CARD LAYOUT                      */}
          {/* ─────────────────────────────────────────────────────── */}
          {step > 1 && (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* ── Left: Summary sidebar ── */}
                <div className="lg:w-72 xl:w-80 flex-shrink-0">
                  <div className="lg:sticky lg:top-20 space-y-4">
                    {/* Selected service card */}
                    {selectedService && (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div
                          className={`h-1.5 w-full bg-gradient-to-r ${(categoryConfig[selectedService.category] || categoryConfig.maintenance).accent}`}
                        />
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            {(() => {
                              const c =
                                categoryConfig[selectedService.category] ||
                                categoryConfig.maintenance;
                              return (
                                <div
                                  className={`w-8 h-8 ${c.iconBg} rounded-lg flex items-center justify-center`}
                                >
                                  <c.Icon
                                    className={`w-4 h-4 ${c.iconColor}`}
                                  />
                                </div>
                              );
                            })()}
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${(categoryConfig[selectedService.category] || categoryConfig.maintenance).badge}`}
                            >
                              {
                                (
                                  categoryConfig[selectedService.category] ||
                                  categoryConfig.maintenance
                                ).label
                              }
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900">
                            {selectedService.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {selectedService.description}
                          </p>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Timer className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                {selectedService.duration} min
                              </span>
                            </div>
                            <p className="text-xl font-extrabold text-gray-900">
                              <span className="text-sm text-gray-400 mr-0.5">
                                $
                              </span>
                              {selectedService.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live cost breakdown */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5" />
                        Cost Breakdown
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Service</span>
                          <span className="font-semibold text-gray-900">
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tax (10%)</span>
                          <span className="font-semibold text-gray-900">
                            ${tax.toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-gray-900">
                              Total
                            </span>
                            <span className="text-lg font-extrabold text-blue-600">
                              $<AnimatedPrice value={total} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step progress */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Progress
                      </p>
                      <div className="space-y-2">
                        {stepInfo.map((s) => (
                          <button
                            key={s.num}
                            type="button"
                            onClick={() => {
                              if (s.num < step) goToStep(s.num);
                            }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                              step === s.num
                                ? "bg-blue-50 ring-1 ring-blue-200"
                                : s.num < step
                                  ? "hover:bg-gray-50 cursor-pointer"
                                  : ""
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                step > s.num
                                  ? "bg-emerald-100 text-emerald-600"
                                  : step === s.num
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {step > s.num ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                s.num
                              )}
                            </div>
                            <div>
                              <p
                                className={`text-xs font-semibold ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}
                              >
                                {s.label}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {s.desc}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Smart Insights */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <p className="text-xs font-bold text-indigo-800">
                          Smart Insights
                        </p>
                      </div>
                      <div className="space-y-2.5">
                        {step === 2 && vehicleAge > 5 && (
                          <p className="text-xs text-indigo-600 leading-relaxed">
                            💡 Vehicles over 5 years old benefit most from
                            regular inspections. Consider adding one to your
                            next visit.
                          </p>
                        )}
                        {step === 2 && vehicleAge <= 5 && (
                          <p className="text-xs text-indigo-600 leading-relaxed">
                            ✨ Your vehicle is relatively new! Preventive
                            maintenance now can save up to 40% on future
                            repairs.
                          </p>
                        )}
                        {step === 3 && (
                          <p className="text-xs text-indigo-600 leading-relaxed">
                            ⚡ Pro tip: Weekday appointments typically have 20%
                            faster turnaround than weekends.
                          </p>
                        )}
                        {step === 4 && (
                          <p className="text-xs text-indigo-600 leading-relaxed">
                            🎯 You're all set! After confirming, you'll receive
                            instant updates about your service progress.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Trust badges */}
                    <div className="hidden lg:block space-y-2">
                      {[
                        {
                          Icon: Shield,
                          text: "Secure Booking",
                          sub: "256-bit encrypted",
                          color: "text-blue-500 bg-blue-50",
                        },
                        {
                          Icon: CheckCircle2,
                          text: "Instant Confirm",
                          sub: "Real-time updates",
                          color: "text-emerald-500 bg-emerald-50",
                        },
                        {
                          Icon: Wrench,
                          text: "Expert Techs",
                          sub: "Certified professionals",
                          color: "text-amber-500 bg-amber-50",
                        },
                      ].map((b) => (
                        <div
                          key={b.text}
                          className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${b.color}`}
                          >
                            <b.Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700">
                              {b.text}
                            </p>
                            <p className="text-[10px] text-gray-400">{b.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Right: Main form content ── */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Step Header */}
                    <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          {(() => {
                            const StepIcon = stepInfo[step - 1].Icon;
                            return (
                              <StepIcon className="w-5 h-5 text-blue-600" />
                            );
                          })()}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {stepInfo[step - 1].label}
                          </h2>
                          <p className="text-xs text-gray-400">
                            {stepInfo[step - 1].desc}
                          </p>
                        </div>
                        <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          Step {step} of 4
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      {/* ── Step 2: Vehicle Information ── */}
                      {step === 2 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-5">
                            Tell us about your vehicle so we can serve you
                            better.
                          </p>

                          {/* Saved vehicle hint */}
                          {showSavedVehicleHint && savedVehicle && (
                            <div className="mb-6 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-5 py-4 animate-[fadeInUp_0.3s_ease-out]">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <History className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-blue-800">
                                  Use your previous vehicle?
                                </p>
                                <p className="text-xs text-blue-600">
                                  {savedVehicle.year} {savedVehicle.make}{" "}
                                  {savedVehicle.model} —{" "}
                                  {savedVehicle.licensePlate}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={loadSavedVehicle}
                                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition-all shadow-sm"
                              >
                                Use This
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowSavedVehicleHint(false)}
                                className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4 text-blue-400" />
                              </button>
                            </div>
                          )}

                          <div className="grid sm:grid-cols-2 gap-5">
                            {/* Make with autocomplete */}
                            <div ref={makeRef} className="relative">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Factory className="w-4 h-4 text-blue-500" />
                                Make{" "}
                                <span className="text-red-400 text-xs">*</span>
                              </label>
                              <input
                                type="text"
                                name="make"
                                value={formData.vehicleInfo.make}
                                onChange={(e) => {
                                  handleVehicleChange(e);
                                  setShowMakeSuggestions(true);
                                }}
                                onFocus={() => setShowMakeSuggestions(true)}
                                placeholder="e.g. Toyota"
                                autoComplete="off"
                                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200 text-sm ${
                                  errors.make
                                    ? "border-red-300 focus:border-red-500 bg-red-50/50"
                                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                                }`}
                              />
                              {errors.make && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />{" "}
                                  {errors.make}
                                </p>
                              )}
                              {showMakeSuggestions &&
                                filteredMakes.length > 0 && (
                                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-[fadeInUp_0.2s_ease-out]">
                                    {filteredMakes.map((make) => (
                                      <button
                                        key={make}
                                        type="button"
                                        onClick={() => selectMake(make)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                                      >
                                        <Car className="w-3.5 h-3.5 text-gray-300" />
                                        {make}
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>

                            {/* Model with autocomplete */}
                            <div ref={modelRef} className="relative">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Car className="w-4 h-4 text-blue-500" />
                                Model{" "}
                                <span className="text-red-400 text-xs">*</span>
                              </label>
                              <input
                                type="text"
                                name="model"
                                value={formData.vehicleInfo.model}
                                onChange={(e) => {
                                  handleVehicleChange(e);
                                  setShowModelSuggestions(true);
                                }}
                                onFocus={() => {
                                  if (availableModels.length > 0)
                                    setShowModelSuggestions(true);
                                }}
                                placeholder={
                                  formData.vehicleInfo.make
                                    ? `e.g. ${availableModels[0] || "Model"}`
                                    : "Select make first"
                                }
                                autoComplete="off"
                                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200 text-sm ${
                                  errors.model
                                    ? "border-red-300 focus:border-red-500 bg-red-50/50"
                                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                                }`}
                              />
                              {errors.model && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />{" "}
                                  {errors.model}
                                </p>
                              )}
                              {showModelSuggestions &&
                                filteredModels.length > 0 && (
                                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-[fadeInUp_0.2s_ease-out]">
                                    {filteredModels.map((model) => (
                                      <button
                                        key={model}
                                        type="button"
                                        onClick={() => selectModel(model)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                      >
                                        {model}
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>

                            {/* Year */}
                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                Year
                              </label>
                              <input
                                type="number"
                                name="year"
                                value={formData.vehicleInfo.year}
                                onChange={handleVehicleChange}
                                min="1990"
                                max={new Date().getFullYear() + 1}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:outline-none transition-all duration-200 text-sm"
                              />
                              {vehicleAge > 0 && (
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                  <Gauge className="w-3 h-3" />
                                  {vehicleAge} year{vehicleAge !== 1 ? "s" : ""}{" "}
                                  old
                                </p>
                              )}
                            </div>

                            {/* License Plate */}
                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Hash className="w-4 h-4 text-blue-500" />
                                License Plate{" "}
                                <span className="text-red-400 text-xs">*</span>
                              </label>
                              <input
                                type="text"
                                name="licensePlate"
                                value={formData.vehicleInfo.licensePlate}
                                onChange={(e) => {
                                  const upper = {
                                    ...e,
                                    target: {
                                      ...e.target,
                                      name: "licensePlate",
                                      value: e.target.value.toUpperCase(),
                                    },
                                  };
                                  handleVehicleChange(upper);
                                }}
                                placeholder="e.g. ABC-1234"
                                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200 text-sm uppercase font-mono tracking-wider ${
                                  errors.licensePlate
                                    ? "border-red-300 focus:border-red-500 bg-red-50/50"
                                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                                }`}
                              />
                              {errors.licensePlate && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />{" "}
                                  {errors.licensePlate}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <Palette className="w-4 h-4 text-blue-500" />
                              Color{" "}
                              <span className="text-xs font-normal text-gray-400">
                                (Optional)
                              </span>
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                name="color"
                                value={formData.vehicleInfo.color}
                                onChange={handleVehicleChange}
                                placeholder="e.g. Silver"
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:outline-none transition-all duration-200 text-sm"
                              />
                              {/* Quick color picks */}
                              <div className="flex items-center gap-1.5 px-2">
                                {[
                                  { color: "bg-gray-800", name: "Black" },
                                  { color: "bg-gray-300", name: "Silver" },
                                  {
                                    color: "bg-white border border-gray-300",
                                    name: "White",
                                  },
                                  { color: "bg-red-500", name: "Red" },
                                  { color: "bg-blue-500", name: "Blue" },
                                ].map((c) => (
                                  <button
                                    key={c.name}
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        vehicleInfo: {
                                          ...prev.vehicleInfo,
                                          color: c.name,
                                        },
                                      }))
                                    }
                                    className={`w-7 h-7 rounded-full ${c.color} transition-all hover:scale-110 ${
                                      formData.vehicleInfo.color === c.name
                                        ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                                        : ""
                                    }`}
                                    title={c.name}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Vehicle preview card */}
                          {formData.vehicleInfo.make &&
                            formData.vehicleInfo.model && (
                              <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-4 border border-gray-100 animate-[fadeInUp_0.3s_ease-out]">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
                                  Vehicle Preview
                                </p>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Car className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">
                                      {formData.vehicleInfo.year}{" "}
                                      {formData.vehicleInfo.make}{" "}
                                      {formData.vehicleInfo.model}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formData.vehicleInfo.licensePlate && (
                                        <span className="font-mono">
                                          {formData.vehicleInfo.licensePlate}
                                        </span>
                                      )}
                                      {formData.vehicleInfo.color && (
                                        <span>
                                          {" "}
                                          · {formData.vehicleInfo.color}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      )}

                      {/* ── Step 3: Date & Time ── */}
                      {step === 3 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-6">
                            Pick a date and time that works best for you.
                          </p>

                          {/* Smart date picker */}
                          <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                              <CalendarClock className="w-4 h-4 text-blue-500" />
                              Quick Pick a Date
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                              {smartDates.slice(0, 10).map((d) => (
                                <button
                                  key={d.date}
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      bookingDate: d.date,
                                    }));
                                    setErrors((prev) => ({
                                      ...prev,
                                      bookingDate: "",
                                    }));
                                  }}
                                  className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[72px] ${
                                    formData.bookingDate === d.date
                                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20 -translate-y-1"
                                      : d.isWeekend
                                        ? "border-gray-200 bg-amber-50/50 hover:border-amber-300 hover:-translate-y-0.5"
                                        : "border-gray-200 bg-white hover:border-blue-300 hover:-translate-y-0.5"
                                  }`}
                                >
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider ${
                                      formData.bookingDate === d.date
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {d.dayName}
                                  </span>
                                  <span
                                    className={`text-xl font-extrabold mt-0.5 ${
                                      formData.bookingDate === d.date
                                        ? "text-blue-600"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {d.dayNum}
                                  </span>
                                  <span
                                    className={`text-[10px] font-medium ${
                                      formData.bookingDate === d.date
                                        ? "text-blue-500"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {d.month}
                                  </span>
                                  {d.isTomorrow && (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1">
                                      Tomorrow
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Fallback date input */}
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                or pick a specific date:
                              </span>
                              <input
                                type="date"
                                name="bookingDate"
                                value={formData.bookingDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split("T")[0]}
                                className={`px-4 py-2 rounded-xl border-2 focus:outline-none transition-all duration-200 text-sm ${
                                  errors.bookingDate
                                    ? "border-red-300 bg-red-50/50"
                                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                                }`}
                              />
                            </div>
                            {errors.bookingDate && (
                              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{" "}
                                {errors.bookingDate}
                              </p>
                            )}
                          </div>

                          {/* Smart Scheduling Insight */}
                          {selectedService && formData.bookingDate && (
                            <div className="mb-5 flex items-start gap-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/60 rounded-xl px-5 py-3.5 animate-[fadeInUp_0.3s_ease-out]">
                              <Sparkles className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-cyan-800">
                                  Smart Scheduling Tip
                                </p>
                                <p className="text-xs text-cyan-600 mt-0.5 leading-relaxed">
                                  {selectedService.duration <= 30
                                    ? "⚡ Quick service! Morning slots (9–11 AM) typically have the fastest turnaround."
                                    : selectedService.duration <= 60
                                      ? "🕐 Standard service — afternoon slots tend to be less busy with shorter wait times."
                                      : "🔧 Extended service — book early morning for same-day completion. Afternoon bookings may carry over."}
                                  {new Date(formData.bookingDate).getDay() ===
                                    6 &&
                                    " Weekend slots fill up fast — great choice booking early!"}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Time slots with popularity */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                              <Clock className="w-4 h-4 text-blue-500" />
                              Select Time Slot
                            </label>

                            {/* Popularity legend */}
                            <div className="flex items-center gap-4 mb-3">
                              {Object.entries(popularityColors).map(
                                ([key, val]) => (
                                  <div
                                    key={key}
                                    className="flex items-center gap-1.5"
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${val.dot}`}
                                    />
                                    <span className="text-[10px] text-gray-400 font-medium">
                                      {val.label}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {timeSlotData.map((slot) => {
                                const popStyle =
                                  popularityColors[slot.popularity];
                                const isActive =
                                  formData.timeSlot === slot.time;
                                return (
                                  <button
                                    key={slot.time}
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        timeSlot: slot.time,
                                      }));
                                      setErrors((prev) => ({
                                        ...prev,
                                        timeSlot: "",
                                      }));
                                    }}
                                    className={`relative py-4 px-4 rounded-xl font-medium text-sm transition-all duration-300 flex flex-col items-center gap-1.5 ${
                                      isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 -translate-y-1 ring-2 ring-blue-400/50"
                                        : `border-2 ${popStyle.border} ${popStyle.bg} text-gray-600 hover:border-blue-400 hover:-translate-y-0.5`
                                    }`}
                                  >
                                    <Clock
                                      className={`w-4 h-4 ${isActive ? "text-blue-200" : "text-gray-400"}`}
                                    />
                                    <span className="font-bold">
                                      {slot.time}
                                    </span>
                                    {!isActive && (
                                      <span
                                        className={`flex items-center gap-1 text-[10px]`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${popStyle.dot}`}
                                        />
                                        {popStyle.label}
                                      </span>
                                    )}
                                    {isActive && (
                                      <span className="text-[10px] text-blue-200 font-semibold">
                                        Selected
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {errors.timeSlot && (
                              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{" "}
                                {errors.timeSlot}
                              </p>
                            )}
                          </div>

                          {/* Estimated completion */}
                          {formData.bookingDate &&
                            formData.timeSlot &&
                            selectedService && (
                              <div className="mt-6 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-4 border border-emerald-100 animate-[fadeInUp_0.3s_ease-out]">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Timer className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-emerald-800">
                                      Estimated Completion
                                    </p>
                                    <p className="text-xs text-emerald-600">
                                      Your vehicle should be ready approximately{" "}
                                      <strong>
                                        {selectedService.duration} minutes
                                      </strong>{" "}
                                      after your appointment time.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Notes */}
                          <div className="mt-6">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <StickyNote className="w-4 h-4 text-blue-500" />
                              Special Requests
                              <span className="text-xs font-normal text-gray-400">
                                (Optional)
                              </span>
                            </label>
                            <textarea
                              name="notes"
                              value={formData.notes}
                              onChange={handleChange}
                              placeholder="Any special requests or notes for the technician..."
                              rows="3"
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:outline-none transition-all duration-200 text-sm resize-none"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                              {formData.notes.length}/500 characters
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ── Step 4: Review ── */}
                      {step === 4 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-6">
                            Please review all details before confirming your
                            booking.
                          </p>

                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {/* Service */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                                  <ListChecks className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                  Service
                                </p>
                              </div>
                              <p className="font-bold text-gray-900 text-lg">
                                {selectedService?.name}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xl font-extrabold text-blue-600 flex items-center">
                                  <DollarSign className="w-5 h-5" />
                                  {selectedService?.price}
                                </span>
                                <span className="text-xs text-gray-400 bg-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {selectedService?.duration} min
                                </span>
                              </div>
                            </div>

                            {/* Vehicle */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-9 h-9 bg-gray-200 rounded-xl flex items-center justify-center">
                                  <Car className="w-4 h-4 text-gray-600" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  Vehicle
                                </p>
                              </div>
                              <p className="font-bold text-gray-900">
                                {formData.vehicleInfo.year}{" "}
                                {formData.vehicleInfo.make}{" "}
                                {formData.vehicleInfo.model}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                <span className="font-mono">
                                  {formData.vehicleInfo.licensePlate}
                                </span>
                                {formData.vehicleInfo.color &&
                                  ` · ${formData.vehicleInfo.color}`}
                              </p>
                            </div>

                            {/* Appointment */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-9 h-9 bg-gray-200 rounded-xl flex items-center justify-center">
                                  <CalendarClock className="w-4 h-4 text-gray-600" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  Appointment
                                </p>
                              </div>
                              <p className="font-bold text-gray-900">
                                {new Date(
                                  formData.bookingDate,
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />{" "}
                                {formData.timeSlot}
                              </p>
                            </div>

                            {/* Notes */}
                            {formData.notes && (
                              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-9 h-9 bg-gray-200 rounded-xl flex items-center justify-center">
                                    <StickyNote className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    Notes
                                  </p>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {formData.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Cost summary */}
                          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white mb-6">
                            <div className="flex items-center gap-2 mb-4">
                              <DollarSign className="w-5 h-5 text-blue-400" />
                              <p className="text-sm font-bold">
                                Payment Summary
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">
                                  {selectedService?.name}
                                </span>
                                <span className="font-semibold">
                                  ${subtotal.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Tax (10%)</span>
                                <span className="font-semibold">
                                  ${tax.toFixed(2)}
                                </span>
                              </div>
                              <div className="border-t border-gray-700 pt-3 mt-3">
                                <div className="flex justify-between">
                                  <span className="font-bold text-lg">
                                    Total
                                  </span>
                                  <span className="text-2xl font-extrabold text-blue-400">
                                    ${total.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Booking Confidence Score */}
                          {(() => {
                            let score = 0;
                            const checks = [];
                            if (selectedService) {
                              score += 25;
                              checks.push({
                                label: "Service selected",
                                done: true,
                              });
                            } else
                              checks.push({
                                label: "Service selected",
                                done: false,
                              });
                            if (
                              formData.vehicleInfo.make &&
                              formData.vehicleInfo.model &&
                              formData.vehicleInfo.licensePlate
                            ) {
                              score += 25;
                              checks.push({
                                label: "Vehicle info complete",
                                done: true,
                              });
                            } else
                              checks.push({
                                label: "Vehicle info complete",
                                done: false,
                              });
                            if (formData.bookingDate) {
                              score += 25;
                              checks.push({
                                label: "Date scheduled",
                                done: true,
                              });
                            } else
                              checks.push({
                                label: "Date scheduled",
                                done: false,
                              });
                            if (formData.timeSlot) {
                              score += 25;
                              checks.push({
                                label: "Time slot picked",
                                done: true,
                              });
                            } else
                              checks.push({
                                label: "Time slot picked",
                                done: false,
                              });
                            if (formData.notes)
                              score = Math.min(score + 5, 100);
                            return (
                              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-[fadeInUp_0.3s_ease-out]">
                                <div className="flex items-center gap-2 mb-4">
                                  <Gauge className="w-5 h-5 text-blue-600" />
                                  <p className="text-sm font-bold text-gray-900">
                                    Booking Readiness
                                  </p>
                                  <span
                                    className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
                                      score >= 100
                                        ? "bg-emerald-100 text-emerald-700"
                                        : score >= 75
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {score >= 100 ? "✓ Ready!" : `${score}%`}
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      score >= 100
                                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                        : score >= 75
                                          ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                          : "bg-gradient-to-r from-amber-400 to-amber-500"
                                    }`}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {checks.map((c, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2 text-xs"
                                    >
                                      {c.done ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200" />
                                      )}
                                      <span
                                        className={
                                          c.done
                                            ? "text-gray-700 font-medium"
                                            : "text-gray-400"
                                        }
                                      >
                                        {c.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Confirmation notice */}
                          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-emerald-800">
                                Ready to confirm
                              </p>
                              <p className="text-xs text-emerald-600 mt-0.5">
                                Click the button below to finalize your booking.
                                You'll receive a confirmation notification
                                shortly.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                      <div className="flex gap-3 justify-between pt-5 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 text-gray-600 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Previous
                        </button>

                        {step < 4 ? (
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="group px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                          >
                            Continue
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:cursor-not-allowed disabled:translate-y-0 flex items-center gap-2 text-sm"
                          >
                            {loading ? (
                              <>
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
                                Processing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Confirm Booking — ${total.toFixed(2)}
                                <CheckCircle2 className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-900 text-gray-400 mt-auto">
        <div className="lg:hidden border-b border-gray-800">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                {
                  Icon: Shield,
                  text: "Secure",
                  color: "bg-blue-900/30 text-blue-400",
                },
                {
                  Icon: CheckCircle2,
                  text: "Instant",
                  color: "bg-emerald-900/30 text-emerald-400",
                },
                {
                  Icon: Wrench,
                  text: "Expert",
                  color: "bg-amber-900/30 text-amber-400",
                },
              ].map((b) => (
                <div key={b.text}>
                  <div
                    className={`w-9 h-9 ${b.color.split(" ")[0]} rounded-xl flex items-center justify-center mx-auto mb-1.5`}
                  >
                    <b.Icon className={`w-4 h-4 ${b.color.split(" ")[1]}`} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-300">
                    {b.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-base font-extrabold text-white">
              Auto<span className="text-blue-400">Serve</span>
            </span>
            <p className="text-[11px] text-gray-500">
              © 2026 AutoServe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ═══ GLOBAL STYLES ═══ */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(${direction === "forward" ? "20px" : "-20px"}); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default BookingPage;
