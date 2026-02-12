import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Receipt,
  Clock,
  DollarSign,
  ChevronRight,
  Loader,
  X,
  Sparkles,
  BadgeCheck,
  Zap,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BRANDS = {
  visa: {
    name: "Visa",
    gradient: "from-blue-600 to-blue-800",
    logo: "VISA",
    pattern: /^4/,
  },
  mastercard: {
    name: "Mastercard",
    gradient: "from-red-500 to-orange-600",
    logo: "MC",
    pattern: /^5[1-5]|^2[2-7]/,
  },
  amex: {
    name: "Amex",
    gradient: "from-gray-600 to-gray-800",
    logo: "AMEX",
    pattern: /^3[47]/,
  },
  discover: {
    name: "Discover",
    gradient: "from-orange-500 to-amber-600",
    logo: "DISC",
    pattern: /^6(?:011|5)/,
  },
  unknown: {
    name: "Card",
    gradient: "from-slate-500 to-slate-700",
    logo: "CARD",
    pattern: null,
  },
};

function detectBrand(number) {
  const n = number.replace(/\s/g, "");
  for (const [key, val] of Object.entries(BRANDS)) {
    if (val.pattern && val.pattern.test(n)) return key;
  }
  return "unknown";
}

function formatCardNumber(value) {
  const v = value.replace(/\D/g, "").slice(0, 16);
  return v.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function luhnCheck(number) {
  const n = number.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(n)) return false;
  let sum = 0,
    alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = parseInt(n[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

const INVOICE_STATUS = {
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-600" },
  sent: { label: "Unpaid", bg: "bg-amber-100", text: "text-amber-700" },
  paid: { label: "Paid", bg: "bg-emerald-100", text: "text-emerald-700" },
  overdue: { label: "Overdue", bg: "bg-red-100", text: "text-red-700" },
  cancelled: {
    label: "Cancelled",
    bg: "bg-slate-100",
    text: "text-slate-500",
  },
};

function CardVisual({ card, small = false }) {
  const brand = BRANDS[card.brand] || BRANDS.unknown;
  return (
    <div
      className={`bg-gradient-to-br ${brand.gradient} rounded-2xl text-white relative overflow-hidden ${
        small ? "p-4" : "p-6"
      }`}
    >

      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {card.isDefault && (
              <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Default
              </span>
            )}
          </div>
          <span className="text-lg font-black tracking-wider opacity-80">
            {brand.logo}
          </span>
        </div>

        <p
          className={`font-mono tracking-[0.2em] ${small ? "text-sm" : "text-lg"} mb-4`}
        >
          •••• •••• •••• {card.lastFour}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
              Cardholder
            </p>
            <p className={`font-semibold ${small ? "text-xs" : "text-sm"}`}>
              {card.cardholderName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
              Expires
            </p>
            <p className={`font-semibold ${small ? "text-xs" : "text-sm"}`}>
              {String(card.expiryMonth).padStart(2, "0")}/
              {String(card.expiryYear).slice(-2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [paySuccess, setPaySuccess] = useState(null);
  const [showAmounts, setShowAmounts] = useState(true);

  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardholderName: "",
    expiry: "",
    cvv: "",
    setDefault: false,
  });
  const [cardErrors, setCardErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cardsRes, invoicesRes] = await Promise.all([
        fetch(`${API}/payments/cards`, { headers }),
        fetch(`${API}/billing/my-invoices`, { headers }),
      ]);
      const [cardsData, invoicesData] = await Promise.all([
        cardsRes.json(),
        invoicesRes.json(),
      ]);
      if (cardsData.success) setCards(cardsData.data);
      if (invoicesData.success) setInvoices(invoicesData.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const unpaidInvoices = useMemo(
    () => invoices.filter((i) => ["sent", "overdue"].includes(i.status)),
    [invoices],
  );
  const paidInvoices = useMemo(
    () => invoices.filter((i) => i.status === "paid"),
    [invoices],
  );
  const totalPaid = useMemo(
    () => paidInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0),
    [paidInvoices],
  );
  const totalPending = useMemo(
    () => unpaidInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0),
    [unpaidInvoices],
  );

  const detectedBrand = useMemo(
    () => detectBrand(cardForm.cardNumber),
    [cardForm.cardNumber],
  );

  const parseExpiry = (val) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2);
    if (clean.length === 2 && val.length > cardForm.expiry.length)
      return clean + "/";
    return clean;
  };
  const parsedMonth = parseInt((cardForm.expiry || "").split("/")[0], 10) || 0;
  const parsedYear = (() => {
    const y = (cardForm.expiry || "").split("/")[1] || "";
    if (!y) return 0;
    return parseInt(y.length <= 2 ? "20" + y : y, 10) || 0;
  })();

  const cardNumClean = cardForm.cardNumber.replace(/\s/g, "");
  const isCardNumValid = cardNumClean.length >= 13 && luhnCheck(cardNumClean);
  const isNameValid = cardForm.cardholderName.trim().length >= 2;
  const isExpiryValid = (() => {
    if (!parsedMonth || !parsedYear) return false;
    if (parsedMonth < 1 || parsedMonth > 12) return false;
    const exp = new Date(parsedYear, parsedMonth, 0);
    return exp >= new Date();
  })();
  const isCvvValid = /^\d{3,4}$/.test(cardForm.cvv);
  const formProgress = [
    isCardNumValid,
    isNameValid,
    isExpiryValid,
    isCvvValid,
  ].filter(Boolean).length;

  const validateCard = () => {
    const errs = {};
    if (!cardNumClean) errs.cardNumber = "Required";
    else if (!isCardNumValid) errs.cardNumber = "Invalid card number";

    if (!cardForm.cardholderName.trim()) errs.cardholderName = "Required";

    if (!parsedMonth || parsedMonth < 1 || parsedMonth > 12)
      errs.expiry = "Invalid expiry";
    else if (parsedYear < new Date().getFullYear()) errs.expiry = "Expired";
    else {
      const exp = new Date(parsedYear, parsedMonth, 0);
      if (exp < new Date()) errs.expiry = "Card expired";
    }

    if (!cardForm.cvv) errs.cvv = "Required";
    else if (!isCvvValid) errs.cvv = "Invalid";

    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddCard = async () => {
    if (!validateCard()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/payments/cards`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber: cardForm.cardNumber.replace(/\s/g, ""),
          cardholderName: cardForm.cardholderName,
          expiryMonth: parsedMonth,
          expiryYear: parsedYear,
          cvv: cardForm.cvv,
          setDefault: cardForm.setDefault,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddCard(false);
        setCardForm({
          cardNumber: "",
          cardholderName: "",
          expiry: "",
          cvv: "",
          setDefault: false,
        });
        setCardErrors({});
        fetchData();
      } else {
        setCardErrors({ general: data.message });
      }
    } catch (err) {
      setCardErrors({ general: "Failed to save card" });
    } finally {
      setSaving(false);
    }
  };

  const setDefaultCard = async (id) => {
    try {
      const res = await fetch(`${API}/payments/cards/${id}/default`, {
        method: "PUT",
        headers,
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCard = async (id) => {
    if (!window.confirm("Remove this card?")) return;
    try {
      const res = await fetch(`${API}/payments/cards/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePay = async () => {
    if (!selectedCardId) return;
    setPaying(true);
    try {
      const res = await fetch(`${API}/payments/pay/${showPayModal._id}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: selectedCardId }),
      });
      const data = await res.json();
      if (data.success) {
        setPaySuccess(data.data.transaction);
        setShowPayModal(null);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-14 h-14">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-600 border-t-transparent animate-spin" />
            <CreditCard className="absolute inset-0 m-auto w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-sm text-slate-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Payments & Cards
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your payment methods and pay invoices securely
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAmounts(!showAmounts)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition"
              >
                {showAmounts ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="w-4 h-4" /> Add Card
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/60 rounded-2xl px-5 py-3.5">
          <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-800">
              Secure Payments
            </p>
            <p className="text-[11px] text-emerald-600">
              Your card details are encrypted and stored securely. We never
              store your full card number or CVV.
            </p>
          </div>
          <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {showAmounts ? `$${totalPaid.toFixed(2)}` : "•••••"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Total Paid</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {showAmounts ? `$${totalPending.toFixed(2)}` : "•••••"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Pending</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{cards.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Saved Cards</p>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" /> Your Cards
          </h2>
          {cards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-10 text-center">
              <CreditCard className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 mb-1">
                No cards saved
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Add a card to make quick payments
              </p>
              <button
                onClick={() => setShowAddCard(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" /> Add Your First Card
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div key={card._id} className="group">
                  <CardVisual card={card} />
                  <div className="flex items-center justify-between mt-2 px-1">
                    {card.isDefault ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600">
                        <BadgeCheck className="w-3 h-3" /> Default
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefaultCard(card._id)}
                        className="text-[10px] font-semibold text-slate-400 hover:text-indigo-600 transition"
                      >
                        Set as default
                      </button>
                    )}
                    <button
                      onClick={() => deleteCard(card._id)}
                      className="text-[10px] font-semibold text-slate-300 hover:text-red-500 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowAddCard(true)}
                className="flex flex-col items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
              >
                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Add new card</span>
              </button>
            </div>
          )}
        </section>

        {unpaidInvoices.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Invoices to Pay
              <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                {unpaidInvoices.length} pending
              </span>
            </h2>
            <div className="space-y-3">
              {unpaidInvoices.map((inv) => {
                const is = INVOICE_STATUS[inv.status] || INVOICE_STATUS.sent;
                return (
                  <div
                    key={inv._id}
                    className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-all flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800">
                        {inv.invoiceNumber || "Invoice"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {inv.bookingId?.serviceId?.name || "Service"} •{" "}
                        {new Date(inv.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-800">
                        {showAmounts
                          ? `$${inv.totalAmount?.toFixed(2)}`
                          : "•••"}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${is.bg} ${is.text}`}
                      >
                        {is.label}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowPayModal(inv);
                        const def = cards.find((c) => c.isDefault);
                        setSelectedCardId(def?._id || cards[0]?._id || "");
                      }}
                      disabled={cards.length === 0}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Zap className="w-4 h-4" /> Pay Now
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Payment
            History
          </h2>
          {paidInvoices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-10 text-center">
              <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No payments yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden divide-y divide-slate-100">
              {paidInvoices.map((inv) => (
                <div
                  key={inv._id}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-700 truncate">
                      {inv.invoiceNumber || "Invoice"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {inv.bookingId?.serviceId?.name || "Service"} •{" "}
                      {inv.paidAt
                        ? new Date(inv.paidAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Paid
                    </span>
                    <span className="font-bold text-sm text-slate-800 tabular-nums">
                      {showAmounts ? `$${inv.totalAmount?.toFixed(2)}` : "•••"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showAddCard && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddCard(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-[420px] w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${(BRANDS[detectedBrand] || BRANDS.unknown).gradient} flex items-center justify-center`}
                >
                  <span className="text-[8px] font-black text-white tracking-wider">
                    {(BRANDS[detectedBrand] || BRANDS.unknown).logo}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Card</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 w-5 rounded-full transition-all duration-300 ${formProgress > i ? "bg-indigo-500" : "bg-slate-200"}`}
                      />
                    ))}
                    <span className="text-[9px] text-slate-400 ml-1">
                      {formProgress}/4
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddCard(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              {cardErrors.general && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{" "}
                  {cardErrors.general}
                </div>
              )}

              <div>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={(e) =>
                      setCardForm({
                        ...cardForm,
                        cardNumber: formatCardNumber(e.target.value),
                      })
                    }
                    placeholder="Card number"
                    maxLength={19}
                    autoFocus
                    className={`w-full pl-10 pr-20 py-2.5 border rounded-xl text-sm font-mono tracking-wider focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${cardErrors.cardNumber ? "border-red-300 bg-red-50/50" : "border-slate-200"}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {detectedBrand !== "unknown" && (
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r ${BRANDS[detectedBrand].gradient} text-white`}
                      >
                        {BRANDS[detectedBrand].logo}
                      </span>
                    )}
                    {isCardNumValid && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>
                {cardErrors.cardNumber && (
                  <p className="text-[11px] text-red-500 mt-0.5 pl-1">
                    {cardErrors.cardNumber}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={cardForm.cardholderName}
                    onChange={(e) =>
                      setCardForm({
                        ...cardForm,
                        cardholderName: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Cardholder name"
                    className={`w-full px-4 pr-10 py-2.5 border rounded-xl text-sm uppercase tracking-wide focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${cardErrors.cardholderName ? "border-red-300 bg-red-50/50" : "border-slate-200"}`}
                  />
                  {isNameValid && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>
                {cardErrors.cardholderName && (
                  <p className="text-[11px] text-red-500 mt-0.5 pl-1">
                    {cardErrors.cardholderName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={(e) =>
                        setCardForm({
                          ...cardForm,
                          expiry: parseExpiry(e.target.value),
                        })
                      }
                      placeholder="MM / YY"
                      maxLength={5}
                      className={`w-full px-4 pr-9 py-2.5 border rounded-xl text-sm font-mono text-center tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${cardErrors.expiry ? "border-red-300 bg-red-50/50" : "border-slate-200"}`}
                    />
                    {isExpiryValid && (
                      <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  {cardErrors.expiry && (
                    <p className="text-[11px] text-red-500 mt-0.5 pl-1">
                      {cardErrors.expiry}
                    </p>
                  )}
                </div>
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      value={cardForm.cvv}
                      onChange={(e) =>
                        setCardForm({
                          ...cardForm,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        })
                      }
                      placeholder="CVV"
                      maxLength={4}
                      className={`w-full px-4 pr-9 py-2.5 border rounded-xl text-sm text-center tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${cardErrors.cvv ? "border-red-300 bg-red-50/50" : "border-slate-200"}`}
                    />
                    {isCvvValid ? (
                      <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    ) : (
                      <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                    )}
                  </div>
                  {cardErrors.cvv && (
                    <p className="text-[11px] text-red-500 mt-0.5 pl-1">
                      {cardErrors.cvv}
                    </p>
                  )}
                </div>
              </div>

              {cardNumClean.length > 0 && cardNumClean.length < 13 && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <p className="text-[10px] text-blue-600">
                    {detectedBrand !== "unknown"
                      ? `${BRANDS[detectedBrand].name} detected — `
                      : ""}
                    Enter {16 - cardNumClean.length} more digits
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={cardForm.setDefault}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, setDefault: e.target.checked })
                    }
                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500">Default</span>
                </label>
                <button
                  onClick={handleAddCard}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/25"
                >
                  {saving ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {saving
                    ? "Saving..."
                    : formProgress === 4
                      ? "Save Card ✓"
                      : "Save Card"}
                </button>
              </div>

              <p className="text-[9px] text-slate-400 text-center flex items-center justify-center gap-1">
                <Lock className="w-2.5 h-2.5" /> 256-bit SSL • Card number never
                stored
              </p>
            </div>
          </div>
        </div>
      )}

      {showPayModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPayModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Confirm Payment
                </h3>
                <p className="text-xs text-slate-400">
                  {showPayModal.invoiceNumber}
                </p>
              </div>
              <button
                onClick={() => setShowPayModal(null)}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              <div className="bg-slate-50 rounded-2xl p-5 text-center">
                <p className="text-xs text-slate-500 mb-1">Amount to Pay</p>
                <p className="text-3xl font-black text-slate-900">
                  ${showPayModal.totalAmount?.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {showPayModal.bookingId?.serviceId?.name || "Service charges"}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                  Pay with
                </label>
                <div className="space-y-2">
                  {cards
                    .filter((c) => !c.isExpired)
                    .map((card) => {
                      const brand = BRANDS[card.brand] || BRANDS.unknown;
                      return (
                        <button
                          key={card._id}
                          type="button"
                          onClick={() => setSelectedCardId(card._id)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                            selectedCardId === card._id
                              ? "border-indigo-500 bg-indigo-50/50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`w-10 h-7 bg-gradient-to-br ${brand.gradient} rounded-lg flex items-center justify-center`}
                          >
                            <span className="text-[8px] font-black text-white tracking-wider">
                              {brand.logo}
                            </span>
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-slate-800">
                              •••• {card.lastFour}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Expires{" "}
                              {String(card.expiryMonth).padStart(2, "0")}/
                              {String(card.expiryYear).slice(-2)}
                            </p>
                          </div>
                          {selectedCardId === card._id && (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                          )}
                          {card.isDefault && (
                            <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${showPayModal.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>
                    Tax ({((showPayModal.taxRate || 0) * 100).toFixed(0)}%)
                  </span>
                  <span>${showPayModal.taxAmount?.toFixed(2)}</span>
                </div>
                {showPayModal.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-${showPayModal.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total</span>
                  <span>${showPayModal.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={paying || !selectedCardId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg shadow-emerald-600/25"
              >
                {paying ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}{" "}
                {paying
                  ? "Processing..."
                  : `Pay $${showPayModal.totalAmount?.toFixed(2)}`}
              </button>

              <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Secured by 256-bit encryption
              </p>
            </div>
          </div>
        </div>
      )}

      {paySuccess && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPaySuccess(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-8 pb-6 px-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">
                Payment Successful!
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Your payment has been processed securely.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-slate-900">
                    ${paySuccess.amount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Card</span>
                  <span className="font-semibold text-slate-700">
                    {(paySuccess.cardBrand || "").toUpperCase()} ••••{" "}
                    {paySuccess.cardLast4}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono text-xs text-slate-600">
                    {paySuccess.id?.slice(0, 16)}...
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-700">
                    {new Date(paySuccess.timestamp).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPaySuccess(null)}
                className="w-full py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
