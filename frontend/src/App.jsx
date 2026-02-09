import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import BookingPage from "./pages/Booking";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AutoServe</h1>
              <p className="text-xs text-blue-600 font-semibold">
                Vehicle Service Pro
              </p>
            </div>
          </div>

          <div className="hidden md:flex gap-8 items-center">
            <a
              href="#services"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Services
            </a>
            <a
              href="#features"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              About
            </a>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => (window.location.href = "/signin")}
              className="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition"
            >
              Login
            </button>
            <button
              onClick={() => (window.location.href = "/signup")}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                Smart Vehicle Service Booking
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Book your vehicle service appointments online in seconds. No
                more phone calls, no more waiting. AutoServe connects you with
                the best service centers instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => (window.location.href = "/booking")}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                >
                  Book Now
                </button>
                <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="text-center text-white">
                  <div className="text-6xl font-bold mb-2">A</div>
                  <p className="text-lg font-semibold">AutoServe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose AutoServe
            </h3>
            <p className="text-xl text-gray-600">
              Experience the future of vehicle service booking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Easy Booking
              </h4>
              <p className="text-gray-600">
                Select your service, choose a convenient date and time slot, and
                confirm your booking in just three clicks.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Secure & Safe
              </h4>
              <p className="text-gray-600">
                Your personal data is encrypted and protected. We use
                industry-standard security protocols for all transactions.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Real-time Updates
              </h4>
              <p className="text-gray-600">
                Get instant notifications about your booking status, service
                updates, and completion confirmations via email and SMS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">
              Our Services
            </h3>
            <p className="text-xl text-gray-600">
              Complete vehicle maintenance solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">Maintenance</div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                Regular Maintenance
              </h4>
              <p className="text-gray-600 text-sm">
                Oil changes, filter replacements, fluid checks
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">Repair</div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                Repair Services
              </h4>
              <p className="text-gray-600 text-sm">
                Engine repairs, electrical issues, brake service
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">Inspection</div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                Vehicle Inspection
              </h4>
              <p className="text-gray-600 text-sm">
                Comprehensive diagnostics, health reports
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">Custom</div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                Customization
              </h4>
              <p className="text-gray-600 text-sm">
                Upgrades, detailing, interior modifications
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <p className="text-blue-100">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-blue-100">Service Centers</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50k+</div>
              <p className="text-blue-100">Bookings Completed</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-4xl font-bold text-gray-800 mb-6">
            Ready to Book Your Service?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers who have simplified their
            vehicle maintenance with AutoServe.
          </p>
          <button
            onClick={() => (window.location.href = "/booking")}
            className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="text-white font-bold mb-4">AutoServe</h5>
              <p className="text-sm">Smart vehicle service booking system</p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Quick Links</h5>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Legal</h5>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
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
              <h5 className="text-white font-bold mb-4">Contact</h5>
              <p className="text-sm">support@autoserve.com</p>
              <p className="text-sm">+1 (555) 123-4567</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>Copyright 2026 AutoServe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
