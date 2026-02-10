import { useState } from "react";
import {
  Wrench,
  Cog,
  CircleDot,
  Thermometer,
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  BarChart3,
  Bell,
  CalendarClock,
  Trophy,
  UserPlus,
  ListChecks,
  Clock,
  CheckCircle2,
  ChevronDown,
  Star,
  ArrowRight,
  Car,
} from "lucide-react";

const faqs = [
  {
    question: "How do I book a vehicle service?",
    answer:
      "Simply create an account or sign in, browse our available services, select the one you need, choose a convenient date and time slot, provide your vehicle details, and confirm your booking. It takes less than 2 minutes!",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes! You can cancel or reschedule your booking anytime from your dashboard. Navigate to your bookings, select the one you want to modify, and choose reschedule or cancel. No extra charges apply for changes made 24 hours before the appointment.",
  },
  {
    question: "What types of vehicles do you service?",
    answer:
      "We service all types of vehicles including sedans, SUVs, trucks, vans, motorcycles, and electric vehicles. Our certified technicians are trained to handle a wide range of makes and models.",
  },
  {
    question: "How do I track my service status?",
    answer:
      "Once your vehicle is checked in, you can track real-time status updates from your customer dashboard. You'll receive notifications at each stage — from inspection to completion.",
  },
  {
    question: "Are your technicians certified?",
    answer:
      "Absolutely. All our technicians are ASE-certified with years of professional experience. We continuously invest in training to stay updated with the latest vehicle technologies.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards, digital wallets, UPI, and net banking. Payment is collected after the service is completed to your satisfaction.",
  },
];

const services = [
  {
    Icon: Wrench,
    title: "Regular Maintenance",
    description:
      "Keep your vehicle running smoothly with scheduled oil changes, filter replacements, fluid top-ups, tire rotations, and multi-point inspections.",
    features: [
      "Oil & filter change",
      "Brake inspection",
      "Tire rotation & pressure check",
      "Fluid level check & top-up",
      "Battery health test",
    ],
    accent: "blue",
  },
  {
    Icon: Cog,
    title: "Engine & Transmission",
    description:
      "From minor tune-ups to major overhauls, our certified technicians handle all engine and transmission issues with precision.",
    features: [
      "Engine diagnostics",
      "Timing belt replacement",
      "Transmission fluid service",
      "Spark plug replacement",
      "Exhaust system repair",
    ],
    accent: "indigo",
  },
  {
    Icon: CircleDot,
    title: "Brake & Suspension",
    description:
      "Ensure your safety with complete brake and suspension services. We inspect, repair, and replace components to keep you safe on the road.",
    features: [
      "Brake pad replacement",
      "Rotor resurfacing",
      "Shock & strut replacement",
      "Wheel alignment",
      "Steering system service",
    ],
    accent: "red",
  },
  {
    Icon: Thermometer,
    title: "AC & Electrical",
    description:
      "Stay comfortable with our heating, cooling, and electrical system services. We diagnose and fix all climate and electrical issues.",
    features: [
      "AC recharge & repair",
      "Heater core service",
      "Alternator & starter repair",
      "Wiring diagnostics",
      "Lighting system repair",
    ],
    accent: "cyan",
  },
  {
    Icon: Search,
    title: "Inspection & Diagnostics",
    description:
      "Get a comprehensive health report for your vehicle. Our state-of-the-art diagnostic tools identify issues before they become problems.",
    features: [
      "Full vehicle inspection",
      "OBD-II diagnostics",
      "Pre-purchase inspection",
      "Emission testing",
      "Safety compliance check",
    ],
    accent: "amber",
  },
  {
    Icon: Sparkles,
    title: "Detailing & Customization",
    description:
      "Give your vehicle a fresh new look with our detailing packages, paint protection, and custom upgrades tailored to your style.",
    features: [
      "Interior deep cleaning",
      "Exterior polish & wax",
      "Ceramic coating",
      "Paint protection film",
      "Custom accessories",
    ],
    accent: "violet",
  },
];

const steps = [
  {
    step: 1,
    Icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up with your email and set a secure password. It only takes 30 seconds to get started.",
  },
  {
    step: 2,
    Icon: ListChecks,
    title: "Choose a Service",
    description:
      "Browse our comprehensive list of vehicle services and select the one that fits your needs.",
  },
  {
    step: 3,
    Icon: Clock,
    title: "Pick Date & Time",
    description:
      "Choose a convenient date and available time slot that works best for your schedule.",
  },
  {
    step: 4,
    Icon: CheckCircle2,
    title: "Confirm & Relax",
    description:
      "Review your booking details, confirm, and we'll take care of the rest. Track status from your dashboard.",
  },
];

const advantages = [
  {
    Icon: Zap,
    title: "Instant Booking",
    description:
      "No more phone calls or waiting on hold. Book your service online in under 2 minutes, anytime, anywhere.",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    Icon: ShieldCheck,
    title: "Certified Technicians",
    description:
      "All our service partners are vetted and certified. Your vehicle is always in expert hands.",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    Icon: BarChart3,
    title: "Transparent Pricing",
    description:
      "No hidden fees or surprise charges. See the complete price breakdown before you book.",
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    Icon: Bell,
    title: "Real-Time Updates",
    description:
      "Track your vehicle's service progress live from your dashboard. Get notified at every step.",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    Icon: CalendarClock,
    title: "Flexible Scheduling",
    description:
      "Choose from multiple time slots that fit your busy schedule. Reschedule anytime with no penalties.",
    bg: "bg-rose-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    Icon: Trophy,
    title: "Quality Guarantee",
    description:
      "Every service comes with a satisfaction guarantee. If you're not happy, we'll make it right.",
    bg: "bg-teal-50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Car Owner",
    text: "AutoServe made booking my car's maintenance incredibly easy. I love the real-time updates — I always know exactly what's happening with my vehicle.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Fleet Manager",
    text: "Managing service bookings for our fleet of 30 vehicles used to be a nightmare. AutoServe simplified everything. Highly recommended for business owners!",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Bike Enthusiast",
    text: "Finally a service platform that handles motorcycles too! The booking process is smooth and the service quality has been consistently excellent.",
    rating: 4,
  },
];

const accentMap = {
  blue: {
    card: "border-blue-200 hover:border-blue-400",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  indigo: {
    card: "border-indigo-200 hover:border-indigo-400",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  red: {
    card: "border-red-200 hover:border-red-400",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  cyan: {
    card: "border-cyan-200 hover:border-cyan-400",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  amber: {
    card: "border-amber-200 hover:border-amber-400",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  violet: {
    card: "border-violet-200 hover:border-violet-400",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
};

function FAQItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 ${
        isOpen ? "bg-blue-50/50 border-blue-200 shadow-sm" : "bg-white"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-blue-600 bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition">
            {question}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-6 pb-5 pl-[4.5rem] text-gray-600 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

function LearnMore() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">
                AutoServe
              </h1>
              <p className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">
                Vehicle Service Pro
              </p>
            </div>
          </a>

          <div className="hidden md:flex gap-8 items-center">
            <a
              href="#how-it-works"
              className="text-sm text-gray-500 hover:text-blue-600 font-medium transition"
            >
              How It Works
            </a>
            <a
              href="#services"
              className="text-sm text-gray-500 hover:text-blue-600 font-medium transition"
            >
              Services
            </a>
            <a
              href="#testimonials"
              className="text-sm text-gray-500 hover:text-blue-600 font-medium transition"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-sm text-gray-500 hover:text-blue-600 font-medium transition"
            >
              FAQ
            </a>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => (window.location.href = "/signin")}
              className="px-4 py-2 text-sm text-gray-600 font-semibold hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              Login
            </button>
            <button
              onClick={() => (window.location.href = "/signup")}
              className="px-5 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto max-w-5xl px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-blue-200 mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Trusted by 5,000+ vehicle owners</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Everything You Need to Know
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              About AutoServe
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover how we're transforming vehicle maintenance. From seamless
            online booking to expert-certified technicians — everything is
            designed around your convenience.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => (window.location.href = "/signup")}
              className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">
              Simple Process
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Four simple steps to get your vehicle serviced. No complexity, no
              hassle.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div key={item.step} className="relative group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-blue-200 to-transparent z-0" />
                )}

                <div className="relative z-10 text-center p-6">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-100 transition-all duration-300">
                    <item.Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-xs font-bold text-blue-600 bg-blue-50 rounded-full px-3 py-1 inline-block mb-3">
                    Step {item.step}
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">
              What We Offer
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services in Detail
            </h3>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              A comprehensive range of vehicle maintenance and repair services
              to keep your ride in peak condition.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const colors = accentMap[service.accent];
              return (
                <div
                  key={service.title}
                  className={`bg-white rounded-2xl p-8 border-2 ${colors.card} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                >
                  <div
                    className={`w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center mb-5`}
                  >
                    <service.Icon className={`w-7 h-7 ${colors.iconColor}`} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                    {service.title}
                  </h4>
                  <p className="text-gray-500 mb-5 leading-relaxed text-sm">
                    {service.description}
                  </p>
                  <ul className="space-y-2.5">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-sm text-gray-600"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why AutoServe */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">
              Why Choose Us
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Thousands Trust AutoServe
            </h3>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Built for reliability, designed for convenience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((item) => (
              <div
                key={item.title}
                className={`${item.bg} rounded-2xl p-7 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-gray-200`}
              >
                <div
                  className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">
              Testimonials
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h3>
            <p className="text-lg text-gray-500">
              Real feedback from real users
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">
              FAQ
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-lg text-gray-500">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-64 h-64 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto max-w-3xl px-4 py-24 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience AutoServe?
          </h3>
          <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
            Join thousands of satisfied vehicle owners. Sign up today and book
            your first service in minutes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => (window.location.href = "/signup")}
              className="group px-10 py-4 bg-blue-600 text-white font-semibold text-base rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 flex items-center gap-2"
            >
              Sign Up Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => (window.location.href = "/booking")}
              className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-base rounded-xl border border-white/20 hover:bg-white/20 transition"
            >
              Book a Service
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-14 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">AutoServe</span>
              </div>
              <p className="text-sm leading-relaxed">
                Smart vehicle service booking platform built for modern vehicle
                owners.
              </p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
                Quick Links
              </h5>
              <ul className="text-sm space-y-2.5">
                <li>
                  <a href="/" className="hover:text-white transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
                Legal
              </h5>
              <ul className="text-sm space-y-2.5">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
                Contact
              </h5>
              <p className="text-sm mb-1">support@autoserve.com</p>
              <p className="text-sm">+1 (555) 123-4567</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
            <p>Copyright 2026 AutoServe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LearnMore;
