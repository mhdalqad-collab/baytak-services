import { useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, MessageCircle, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { omanLocations } from "../data/mockData";

const clientTemplate = {
  role: "customer",
  name: "",
  phone: "",
  email: "",
  password: "",
  deliveryChannel: "sms"
};

const providerTemplate = {
  role: "provider",
  name: "",
  businessName: "",
  phone: "",
  email: "",
  password: "",
  deliveryChannel: "sms",
  providerType: "Company",
  baseLocation: "Muscat",
  priceLevel: "Balanced",
  specialties: ["AC maintenance"],
  documents: "Commercial registration, technician IDs, insurance"
};

const loginTemplate = {
  identifier: "",
  password: ""
};

function StepItem({ done, active, label, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${done ? "bg-emerald-500 text-white" : active ? "bg-lagoon text-white" : "bg-mist text-ink/45"}`}>
        {done ? <CheckCircle2 size={16} /> : label}
      </span>
      <span className={`text-sm font-bold ${active ? "text-ink" : "text-ink/54"}`}>{text}</span>
    </div>
  );
}

export default function AuthPage({ onSignIn, onRegister, onVerifyOtp, onResendOtp, categories = [] }) {
  const [mode, setMode] = useState("signin");
  const [role, setRole] = useState("customer");
  const [clientForm, setClientForm] = useState(clientTemplate);
  const [providerForm, setProviderForm] = useState(providerTemplate);
  const [pendingOtp, setPendingOtp] = useState(null);
  const [otp, setOtp] = useState("");
  const [loginForm, setLoginForm] = useState(loginTemplate);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isProvider = role === "provider";
  const form = isProvider ? providerForm : clientForm;
  const setForm = isProvider ? setProviderForm : setClientForm;

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    if (nextMode === "signin") setPendingOtp(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleSpecialty(category) {
    setProviderForm((current) => {
      const exists = current.specialties.includes(category);
      return {
        ...current,
        specialties: exists ? current.specialties.filter((item) => item !== category) : [...current.specialties, category]
      };
    });
  }

  async function submitLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await onSignIn(loginForm);
    setBusy(false);
    if (result?.error) setError(result.error);
  }

  async function submitRegistration(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await onRegister({
      ...form,
      role,
      name: form.name.trim(),
      businessName: isProvider ? form.businessName.trim() : undefined
    });
    setBusy(false);

    if (result?.requiresOtp) {
      setPendingOtp(result);
      setOtp("");
      return;
    }
    if (result?.error) setError(result.error);
  }

  async function submitOtp(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await onVerifyOtp({ registrationId: pendingOtp.registrationId, otp });
    setBusy(false);
    if (result?.error) setError(result.error);
  }

  async function resendOtp() {
    setBusy(true);
    setError("");
    const result = await onResendOtp({ registrationId: pendingOtp.registrationId, deliveryChannel: pendingOtp.deliveryChannel });
    setBusy(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setPendingOtp(result);
      setOtp("");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
      <aside className="surface-card rounded-xl p-6 shadow-card lg:sticky lg:top-24 lg:self-start">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-lagoon text-white">
          <ShieldCheck size={24} />
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-lagoon">Secure account access</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">Sign in or create a verified account.</h1>
        <p className="mt-3 text-sm font-bold leading-7 text-ink/62">
          Clients verify a mobile number before requesting service. Providers verify their number and remain pending until an admin approves the business profile.
        </p>

        <div className="mt-6 grid gap-3">
          <StepItem done={mode === "signin"} active={mode === "register" && !pendingOtp} label="1" text={mode === "signin" ? "Sign in with password" : "Enter account details"} />
          <StepItem done={Boolean(pendingOtp)} active={Boolean(pendingOtp)} label="2" text="Verify OTP code" />
          <StepItem done={false} active={isProvider && Boolean(pendingOtp)} label="3" text={isProvider ? "Wait for admin approval" : "Account opens after OTP"} />
        </div>

        <div className="mt-6 rounded-lg bg-mist p-4 text-sm font-bold leading-6 text-ink/62">
          Use the phone number or email connected to your account. New providers need admin approval before receiving jobs.
        </div>
      </aside>

      <section className="glass-card rounded-xl p-5 shadow-card sm:p-6">
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-mist p-1">
          <button type="button" className={`rounded-lg px-4 py-3 text-sm font-black ${mode === "signin" ? "bg-white text-lagoon shadow-sm" : "text-ink/60"}`} onClick={() => switchMode("signin")}>
            Sign in
          </button>
          <button type="button" className={`rounded-lg px-4 py-3 text-sm font-black ${mode === "register" ? "bg-white text-lagoon shadow-sm" : "text-ink/60"}`} onClick={() => switchMode("register")}>
            Register
          </button>
        </div>

        {mode === "signin" ? (
          <form onSubmit={submitLogin} className="grid gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-lagoon">Welcome back</p>
              <h2 className="mt-1 text-2xl font-black">Enter your username and password</h2>
            </div>

            <label className="grid gap-2 text-sm font-extrabold">
              Phone number or email
              <input
                className="input-field"
                value={loginForm.identifier}
                onChange={(event) => setLoginForm((current) => ({ ...current, identifier: event.target.value }))}
                placeholder="+968 9000 1001 or name@example.com"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-extrabold">
              Password
              <input
                className="input-field"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
                required
              />
            </label>

            {error && <p className="rounded-lg bg-red-100 p-4 text-sm font-black text-red-700">{error}</p>}

            <button className="btn-primary w-full" disabled={busy}>
              Sign in
              <ArrowRight size={17} />
            </button>
          </form>
        ) : pendingOtp ? (
          <form onSubmit={submitOtp} className="grid gap-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-mist text-lagoon">
              {pendingOtp.deliveryChannel === "whatsapp" ? <MessageCircle size={24} /> : <Smartphone size={24} />}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-lagoon">Phone verification</p>
              <h2 className="mt-1 text-2xl font-black">Enter the OTP code</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-ink/62">
                We sent a one-time code by {pendingOtp.deliveryChannel?.toUpperCase()} to {pendingOtp.maskedPhone}. The account will not be created until this code is verified.
              </p>
            </div>

            <label className="grid gap-2 text-sm font-extrabold">
              6-digit OTP
              <input
                className="input-field text-center text-2xl font-black tracking-[0.35em]"
                inputMode="numeric"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
              />
            </label>

            {error && <p className="rounded-lg bg-red-100 p-4 text-sm font-black text-red-700">{error}</p>}

            <div className="grid gap-3 sm:grid-cols-3">
              <button className="btn-primary sm:col-span-1" disabled={busy || otp.length !== 6}>
                Verify
              </button>
              <button type="button" className="btn-secondary" onClick={resendOtp} disabled={busy}>
                Resend
              </button>
              <button type="button" className="btn-secondary" onClick={() => setPendingOtp(null)}>
                Edit details
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitRegistration} className="grid gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-lagoon">New account</p>
              <h2 className="mt-1 text-2xl font-black">Choose account type</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className={`rounded-xl border p-4 text-start transition ${role === "customer" ? "border-lagoon bg-lagoon text-white" : "border-ink/10 bg-white/55 text-ink"}`}
                onClick={() => {
                  setRole("customer");
                  setError("");
                }}
              >
                <UserRound size={22} />
                <h3 className="mt-3 text-lg font-black">Client</h3>
                <p className="mt-1 text-sm font-bold opacity-75">Request service after OTP verification.</p>
              </button>
              <button
                type="button"
                className={`rounded-xl border p-4 text-start transition ${role === "provider" ? "border-lagoon bg-lagoon text-white" : "border-ink/10 bg-white/55 text-ink"}`}
                onClick={() => {
                  setRole("provider");
                  setError("");
                }}
              >
                <BriefcaseBusiness size={22} />
                <h3 className="mt-3 text-lg font-black">Service provider</h3>
                <p className="mt-1 text-sm font-bold opacity-75">Verify phone, then wait for admin approval.</p>
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-extrabold">
                Full name
                <input className="input-field" value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Your legal name" required />
              </label>
              <label className="grid gap-2 text-sm font-extrabold">
                Mobile number
                <input className="input-field" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+968..." required />
              </label>
              <label className="grid gap-2 text-sm font-extrabold">
                Email
                <input className="input-field" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="name@example.com" />
              </label>
              <label className="grid gap-2 text-sm font-extrabold">
                Password
                <input className="input-field" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="Create password" required />
              </label>
            </div>

            <div>
              <p className="text-sm font-extrabold">OTP delivery method</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  ["sms", "SMS", Smartphone],
                  ["whatsapp", "WhatsApp", MessageCircle]
                ].map(([value, label, Icon]) => (
                  <button
                    type="button"
                    key={value}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black ${form.deliveryChannel === value ? "bg-lagoon text-white" : "theme-chip"}`}
                    onClick={() => updateField("deliveryChannel", value)}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isProvider && (
              <div className="grid gap-5 rounded-xl border border-ink/10 bg-white/48 p-4">
                <label className="grid gap-2 text-sm font-extrabold">
                  Business name
                  <input className="input-field" value={providerForm.businessName} onChange={(event) => updateField("businessName", event.target.value)} placeholder="Company or technician name" required />
                </label>

                <div className="grid gap-5 sm:grid-cols-3">
                  <label className="grid gap-2 text-sm font-extrabold">
                    Provider type
                    <select className="input-field" value={providerForm.providerType} onChange={(event) => updateField("providerType", event.target.value)}>
                      <option>Company</option>
                      <option>Technician</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-extrabold">
                    Main location
                    <select className="input-field" value={providerForm.baseLocation} onChange={(event) => updateField("baseLocation", event.target.value)}>
                      {omanLocations.map((location) => (
                        <option key={location}>{location}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-extrabold">
                    Price level
                    <select className="input-field" value={providerForm.priceLevel} onChange={(event) => updateField("priceLevel", event.target.value)}>
                      <option>Value</option>
                      <option>Balanced</option>
                      <option>Premium</option>
                    </select>
                  </label>
                </div>

                <div>
                  <p className="text-sm font-extrabold">Service categories</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        type="button"
                        key={category}
                        className={`rounded-lg px-3 py-2 text-xs font-extrabold ${providerForm.specialties.includes(category) ? "bg-lagoon text-white" : "theme-chip"}`}
                        onClick={() => toggleSpecialty(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="grid gap-2 text-sm font-extrabold">
                  Documents and licenses
                  <textarea className="input-field min-h-24 resize-none" value={providerForm.documents} onChange={(event) => updateField("documents", event.target.value)} />
                </label>
              </div>
            )}

            {error && <p className="rounded-lg bg-red-100 p-4 text-sm font-black text-red-700">{error}</p>}

            <button className="btn-primary w-full" disabled={busy}>
              Send OTP
              <ArrowRight size={17} />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
