import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/services");
      const data = await response.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      vehicleInfo: {
        ...prev.vehicleInfo,
        [name]: value,
      },
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.serviceId) {
        newErrors.serviceId = "Please select a service";
      }
    } else if (step === 2) {
      if (!formData.vehicleInfo.make)
        newErrors.make = "Vehicle make is required";
      if (!formData.vehicleInfo.model)
        newErrors.model = "Vehicle model is required";
      if (!formData.vehicleInfo.licensePlate)
        newErrors.licensePlate = "License plate is required";
    } else if (step === 3) {
      if (!formData.bookingDate) newErrors.bookingDate = "Date is required";
      if (!formData.timeSlot) newErrors.timeSlot = "Time slot is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
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
      const selectedService = services.find(
        (s) => s._id === formData.serviceId,
      );
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
          totalPrice: selectedService?.price || 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setErrors({ submit: data.message || "Booking failed" });
      }
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">AS</span>
            </div>
            <span className="text-gray-900 font-bold text-lg hidden sm:inline">
              AutoServe
            </span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 sm:px-6 py-4">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center animate-pulse">
            <p className="text-green-800 font-semibold">
              ✓ Booking confirmed! Redirecting...
            </p>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
            <p className="text-red-800 text-sm font-semibold">
              {errors.submit}
            </p>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      step >= num
                        ? "bg-blue-600 text-white scale-100 shadow-md"
                        : "bg-gray-200 text-gray-600 scale-90"
                    }`}
                  >
                    {num}
                  </div>
                  {num < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                        step > num ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {step === 1 && "Select Your Service"}
                {step === 2 && "Vehicle Information"}
                {step === 3 && "Choose Date & Time"}
                {step === 4 && "Review Booking"}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col p-6 overflow-auto"
          >
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Select a Service
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Choose the service you need
                </p>

                <div className="grid md:grid-cols-2 gap-3">
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
                        className={`text-left p-4 rounded-lg border-2 transition-all duration-300 transform hover:shadow-md ${
                          formData.serviceId === service._id
                            ? "border-blue-600 bg-blue-50 scale-102 shadow-md"
                            : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:scale-101"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {service.name}
                          </h3>
                          {formData.serviceId === service._id && (
                            <span className="inline-block w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs animate-scaleIn">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-bold text-blue-600">
                            ${service.price}
                          </span>
                          <span className="text-xs text-gray-500">
                            {service.duration}m
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500">Loading services...</p>
                    </div>
                  )}
                </div>

                {errors.serviceId && (
                  <p className="text-red-600 text-xs mt-4 font-medium">
                    {errors.serviceId}
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Vehicle Information */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Vehicle Information
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Tell us about your vehicle
                </p>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Make
                      </label>
                      <input
                        type="text"
                        name="make"
                        value={formData.vehicleInfo.make}
                        onChange={handleVehicleChange}
                        placeholder="Toyota"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.make ? "border-red-400" : "border-gray-300"
                        }`}
                      />
                      {errors.make && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.make}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.vehicleInfo.model}
                        onChange={handleVehicleChange}
                        placeholder="Camry"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.model ? "border-red-400" : "border-gray-300"
                        }`}
                      />
                      {errors.model && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.model}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <input
                        type="number"
                        name="year"
                        value={formData.vehicleInfo.year}
                        onChange={handleVehicleChange}
                        min="1990"
                        max={new Date().getFullYear()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Plate
                      </label>
                      <input
                        type="text"
                        name="licensePlate"
                        value={formData.vehicleInfo.licensePlate}
                        onChange={handleVehicleChange}
                        placeholder="ABC123"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.licensePlate
                            ? "border-red-400"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.licensePlate && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.licensePlate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.vehicleInfo.color}
                      onChange={handleVehicleChange}
                      placeholder="Silver"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Schedule Appointment
                </h2>
                <p className="text-gray-600 text-sm mb-5">
                  Choose your preferred date and time
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                        errors.bookingDate
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.bookingDate && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.bookingDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-3">
                      Select Time Slot
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          className={`py-2 px-2 rounded-lg font-medium text-xs transition-all duration-300 transform ${
                            formData.timeSlot === slot
                              ? "bg-blue-600 text-white shadow-md scale-105"
                              : "border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:scale-102"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {errors.timeSlot && (
                      <p className="text-red-600 text-xs mt-2">
                        {errors.timeSlot}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Review Your Booking
                </h2>

                <div className="space-y-3 mb-5">
                  <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-300 bg-gray-50">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Service
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {selectedService?.name}
                    </p>
                    <p className="text-sm text-blue-600 font-bold mt-1">
                      ${selectedService?.price}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-300 bg-gray-50">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Vehicle
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formData.vehicleInfo.year} {formData.vehicleInfo.make}{" "}
                      {formData.vehicleInfo.model}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formData.vehicleInfo.licensePlate} •{" "}
                      {formData.vehicleInfo.color}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-300 bg-gray-50">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Appointment
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(formData.bookingDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.timeSlot}
                    </p>
                  </div>

                  {formData.notes && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-gray-700">{formData.notes}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special requests or notes..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 justify-between mt-auto pt-6 border-t border-gray-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-102"
                >
                  ← Previous
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-102 active:scale-95"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-8 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-102 active:scale-95 disabled:bg-gray-400 disabled:hover:scale-100"
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .scale-101 {
          transform: scale(1.01);
        }

        .scale-102 {
          transform: scale(1.02);
        }

        input:focus,
        textarea:focus,
        select:focus {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export default BookingPage;
