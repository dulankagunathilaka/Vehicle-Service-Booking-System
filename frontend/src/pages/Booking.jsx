import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    fetchServices();
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

  const handleNextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 3000);
      } else setErrors({ submit: data.message || "Booking failed" });
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => s._id === formData.serviceId);
  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                AutoServe
              </h1>
              <p className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">
                Vehicle Service Pro
              </p>
            </div>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Compact Hero */}
      <section className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Book Your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            <p className="text-blue-200/80 text-xs mt-1">
              Follow the steps to schedule your vehicle service appointment
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-blue-200">
              Book in under 2 minutes
            </span>
          </div>
        </div>
      </section>

      {/* Progress Steps Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {stepInfo.map((s, index) => (
              <div key={s.num} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (s.num < step) setStep(s.num);
                  }}
                  className={`flex items-center gap-3 ${s.num < step ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-300 flex-shrink-0 ${
                      step === s.num
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : step > s.num
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <s.Icon className="w-5 h-5" />
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
                    className={`flex-1 h-0.5 mx-4 rounded-full transition-all duration-500 ${
                      step > s.num ? "bg-emerald-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-6">
        {/* Alerts */}
        {success && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl animate-pulse">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Booking confirmed successfully!
              </p>
              <p className="text-xs text-emerald-600">
                Redirecting to home page...
              </p>
            </div>
          </div>
        )}
        {errors.submit && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{errors.submit}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Step Header inside card */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  {(() => {
                    const StepIcon = stepInfo[step - 1].Icon;
                    return <StepIcon className="w-5 h-5 text-blue-600" />;
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

            <div className="p-6">
              {/* Step 1: Service Selection */}
              {step === 1 && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Choose the service your vehicle needs from the options below
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {services.length > 0 ? (
                      services.map((service) => (
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
                          className={`text-left p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                            formData.serviceId === service._id
                              ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900 text-sm">
                              {service.name}
                            </h3>
                            {formData.serviceId === service._id && (
                              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                          <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                            <span className="text-lg font-bold text-blue-600">
                              ${service.price}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                              <Clock className="w-3 h-3" />
                              {service.duration} min
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <ListChecks className="w-7 h-7 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          Loading available services...
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.serviceId && (
                    <p className="text-red-500 text-xs mt-3 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.serviceId}
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Vehicle Information */}
              {step === 2 && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Tell us about your vehicle so we can serve you better
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        name: "make",
                        label: "Make",
                        placeholder: "e.g. Toyota",
                        error: errors.make,
                      },
                      {
                        name: "model",
                        label: "Model",
                        placeholder: "e.g. Camry",
                        error: errors.model,
                      },
                      {
                        name: "year",
                        label: "Year",
                        placeholder: "",
                        type: "number",
                      },
                      {
                        name: "licensePlate",
                        label: "License Plate",
                        placeholder: "e.g. ABC-1234",
                        error: errors.licensePlate,
                      },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          {field.label} {field.error ? "" : ""}
                        </label>
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={formData.vehicleInfo[field.name]}
                          onChange={handleVehicleChange}
                          placeholder={field.placeholder}
                          min={field.name === "year" ? "1990" : undefined}
                          max={
                            field.name === "year"
                              ? new Date().getFullYear()
                              : undefined
                          }
                          className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200 text-sm ${
                            field.error
                              ? "border-red-400 focus:border-red-500 bg-red-50/50"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                        />
                        {field.error && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {field.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Color (Optional)
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.vehicleInfo.color}
                      onChange={handleVehicleChange}
                      placeholder="e.g. Silver"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:outline-none transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Date & Time */}
              {step === 3 && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Pick a date and time that works best for you
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Select Date
                      </label>
                      <input
                        type="date"
                        name="bookingDate"
                        value={formData.bookingDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200 text-sm ${
                          errors.bookingDate
                            ? "border-red-400 bg-red-50/50"
                            : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                        }`}
                      />
                      {errors.bookingDate && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.bookingDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Time Slot
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                timeSlot: slot,
                              }));
                              setErrors((prev) => ({ ...prev, timeSlot: "" }));
                            }}
                            className={`py-3 px-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                              formData.timeSlot === slot
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                : "border-2 border-gray-200 text-gray-600 hover:border-blue-400 hover:-translate-y-0.5"
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            {slot}
                          </button>
                        ))}
                      </div>
                      {errors.timeSlot && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.timeSlot}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any special requests or notes for the technician..."
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:outline-none transition-all duration-200 text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div>
                  <p className="text-sm text-gray-500 mb-5">
                    Please review all details before confirming your booking
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-5">
                    {/* Service */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ListChecks className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          Service
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 text-lg">
                        {selectedService?.name}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xl font-bold text-blue-600 flex items-center">
                          <DollarSign className="w-5 h-5" />
                          {selectedService?.price}
                        </span>
                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedService?.duration} min
                        </span>
                      </div>
                    </div>

                    {/* Vehicle */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Car className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {formData.vehicleInfo.year} {formData.vehicleInfo.make}{" "}
                        {formData.vehicleInfo.model}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.vehicleInfo.licensePlate}
                        {formData.vehicleInfo.color &&
                          ` \u00B7 ${formData.vehicleInfo.color}`}
                      </p>
                    </div>

                    {/* Appointment */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <CalendarClock className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Appointment
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {new Date(formData.bookingDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formData.timeSlot}
                      </p>
                    </div>

                    {/* Notes */}
                    {formData.notes && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                            <StickyNote className="w-4 h-4 text-gray-600" />
                          </div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Notes
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {formData.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirmation notice */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        Ready to confirm
                      </p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Click the button below to finalize your booking. You'll
                        receive a confirmation shortly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="px-6 pb-6">
              <div className="flex gap-3 justify-between pt-5 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 text-gray-600 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="group px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 flex items-center gap-2 text-sm"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2 text-sm"
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
                        Confirm Booking
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Trust Badges */}
      <section className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-800">Secure Booking</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Your data is encrypted
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-gray-800">
                Instant Confirmation
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Get notified immediately
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs font-bold text-gray-800">
                Expert Technicians
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Certified professionals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">AutoServe</span>
          </div>
          <p className="text-xs">
            Copyright 2026 AutoServe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default BookingPage;
