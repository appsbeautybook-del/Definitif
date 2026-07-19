import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Camera, RotateCcw } from "lucide-react";
import { entities, uploadFile } from '@/api/entities';
import { useAuth } from "@/lib/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { supabase } from '@/api/supabaseClient';

const SPLASH_IMG = "https://media.base44.com/images/public/6a0ba7bd3d55dddeb85a8366/39cb4873a_generated_image.png";
const LOGO_IMG = "https://media.base44.com/images/public/6a0ba7bd3d55dddeb85a8366/47f6dcd4b_generated_image.png";

const INTERESTS = ["COIFFURE", "MAQUILLAGE", "SOINS", "ONGLES", "MASSAGE", "BARBIER", "ÉPILATION"];

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step, total }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
          style={{ background: i < step ? "#E8732A" : "#e5e7eb" }} />
      ))}
    </div>
  );
}

function StepLabel({ step, total }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-2 h-2 rounded-full bg-primary" />
      <span className="text-[11px] font-black text-primary uppercase tracking-widest">
        Étape {step} / {total}
      </span>
    </div>
  );
}

// ── STEP 0 — Splash ───────────────────────────────────────────────────────────
function StepSplash({ onNext, onDiscover }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Full background image */}
      <div className="absolute inset-0">
        <img src={SPLASH_IMG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,20,20,0.3) 0%, rgba(15,15,15,0.92) 55%, rgba(10,10,10,0.98) 100%)" }} />
      </div>

      {/* Logo top-center — sans fond, intégré dans l'image */}
      <div className="relative z-10 flex justify-center pt-14">
        <div className="flex flex-col items-center gap-3">
          {/* Logo SVG inline — neutre, sans fond */}
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="34" stroke="#E8732A" strokeWidth="2.5" fill="none" opacity="0.3"/>
            <path d="M22 20h16c5.523 0 10 4.477 10 10s-4.477 10-10 10H22V20z" fill="#E8732A" opacity="0.85"/>
            <path d="M22 40h18c5.523 0 10 4.477 10 10s-4.477 10-10 10H22V40z" fill="#E8732A"/>
            <circle cx="52" cy="24" r="4" fill="white" opacity="0.9"/>
          </svg>
          <span className="text-white text-[15px] font-black uppercase tracking-[0.25em]" style={{ textShadow: "0 2px 12px rgba(232,115,42,0.8)" }}>BeautyBook</span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-12">
        <h1 className="text-[56px] font-black leading-none text-white uppercase tracking-tight mb-1">
          REVEAL<br />YOUR<br />
          <span style={{ color: "#E8732A" }}>BEAUTY.</span>
        </h1>
        <p className="text-[15px] text-white/60 font-medium mt-4 mb-8 leading-relaxed max-w-[300px]">
          Rejoignez la première communauté dédiée à l'excellence esthétique.
        </p>
        <button
          onClick={onNext}
          className="w-full py-4 rounded-full font-black text-[14px] uppercase tracking-widest text-white active:scale-95 transition-all shadow-lg"
          style={{ background: "#E8732A", boxShadow: "0 0 40px rgba(232,115,42,0.5)" }}
        >
          Commencer l'aventure
        </button>
      </div>
    </div>
  );
}

// ── STEP 1 — Inscription ──────────────────────────────────────────────────────
function StepSignup({ onNext, onBack }) {
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", phone: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mode, setMode] = useState("email");
  const [error, setError] = useState("");

  const inputClass = "w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-medium text-gray-800 outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-gray-400";
  const labelClass = "text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block";

  // Robustesse du mot de passe
  const pwdChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };
  const pwdScore = Object.values(pwdChecks).filter(Boolean).length;
  const pwdStrong = pwdScore >= 3;

  const [touched, setTouched] = useState(false);
  const isValid = form.prenom && form.nom &&
    (mode === "email" ? form.email : form.phone) &&
    pwdStrong && form.password === form.confirm;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    const contact = mode === "email" ? form.email : `+33${form.phone.replace(/\s/g, "")}`;
    sessionStorage.setItem("bb_signup_data", JSON.stringify({
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      phone: contact,
      mode,
    }));
    onNext();
  };

  const handleSocialLogin = async (provider) => {
    if (form.email || form.prenom || form.nom) {
      const contact = mode === "email" ? form.email : `+33${form.phone.replace(/\s/g, "")}`;
      sessionStorage.setItem("bb_signup_data", JSON.stringify({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        phone: contact,
        mode,
      }));
    }
    sessionStorage.setItem("bb_social_signup", "1");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    });
    if (error) {
      console.error(`[${provider} Auth] Error:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-10 pb-8">
      <ProgressBar step={1} total={5} />
      <StepLabel step={1} total={5} />

      <h2 className="text-[34px] font-black text-gray-900 leading-tight mb-1">Faisons<br />connaissance</h2>
      <p className="text-[13px] text-gray-400 font-medium mb-6">Parlez-nous un peu de vous pour commencer l'aventure.</p>

      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Prénom</label>
            <input className={inputClass} placeholder="Sophie" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Nom</label>
            <input className={inputClass} placeholder="Martin" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
          </div>
        </div>

        {/* Toggle email / phone */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          <button onClick={() => setMode("email")} className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${mode === "email" ? "bg-white shadow text-gray-900" : "text-gray-400"}`}>
            ✉️ Email
          </button>
          <button onClick={() => setMode("phone")} className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${mode === "phone" ? "bg-white shadow text-gray-900" : "text-gray-400"}`}>
            📱 Téléphone
          </button>
        </div>

        {mode === "email" ? (
          <div>
            <label className={labelClass}>Adresse e-mail</label>
            <input className={inputClass} type="email" placeholder="sophie.martin@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Numéro de téléphone</label>
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary/40">
              <span className="text-[16px]">🇫🇷</span>
              <span className="text-[14px] font-black text-gray-500">+33</span>
              <div className="w-px h-4 bg-gray-300" />
              <input type="tel" placeholder="6 12 34 56 78" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="flex-1 bg-transparent text-[14px] font-medium text-gray-800 outline-none placeholder:text-gray-400" />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Mot de passe</label>
          <div className="relative">
            <input className={inputClass + " pr-12"} type={showPwd ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <button onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{ background: i <= pwdScore ? (pwdScore <= 1 ? "#ef4444" : pwdScore === 2 ? "#f97316" : pwdScore === 3 ? "#eab308" : "#22c55e") : "#e5e7eb" }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {[
                  { check: pwdChecks.length, label: "8 car. min" },
                  { check: pwdChecks.upper, label: "Majuscule" },
                  { check: pwdChecks.number, label: "Chiffre" },
                  { check: pwdChecks.special, label: "Caractère spécial" },
                ].map(({ check, label }) => (
                  <span key={label} className={`text-[10px] font-bold ${check ? "text-green-500" : "text-gray-400"}`}>
                    {check ? "✓" : "○"} {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Confirmer le mot de passe</label>
          <div className="relative">
            <input className={inputClass + " pr-12"} type={showConfirm ? "text" : "password"} placeholder="••••••••" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
            <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {touched && !isValid && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <p className="text-[12px] text-red-500 font-bold">
              {!form.prenom || !form.nom ? "Prénom et nom sont obligatoires." :
               !(mode === "email" ? form.email : form.phone) ? `Votre ${mode === "email" ? "email" : "téléphone"} est obligatoire.` :
               !pwdStrong ? "Votre mot de passe n'est pas assez fort." :
               form.password !== form.confirm ? "Les mots de passe ne correspondent pas." : ""}
            </p>
          </div>
        )}
        {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
      </div>

      <div className="mt-6 space-y-4">
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-full font-black text-[14px] uppercase tracking-widest text-white transition-all active:scale-95"
          style={{ background: isValid ? "#E8732A" : "#d1d5db" }}
        >
          Suivant
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ou continuer avec</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleSocialLogin('google')}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-3.5 active:scale-95 transition-all shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="text-[12px] font-black text-gray-700">Google</span>
          </button>

          <button
            onClick={() => handleSocialLogin('apple')}
            className="flex-1 flex items-center justify-center gap-2 bg-black rounded-2xl py-3.5 active:scale-95 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <span className="text-[12px] font-black text-white">Apple</span>
          </button>
        </div>

        <p className="text-center text-[12px] text-gray-400 font-medium">
          Déjà un compte ?{" "}
          <Link to="/connexion" className="font-black" style={{ color: "#E8732A" }}>
            Se connecter
          </Link>
        </p>
        <button onClick={onBack} className="w-full text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Retour</button>
      </div>
    </div>
  );
}

// ── STEP 1.5 — Vérification du code ──────────────────────────────────────────
function StepVerification({ onNext, onBack }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [clipboardToast, setClipboardToast] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const [otpCode, setOtpCode] = useState(null);
  const inputs = useRef([]);
  const timerRef = useRef(null);

  const [data, setData] = useState(() => JSON.parse(sessionStorage.getItem("bb_signup_data") || "{}"));
  const contact = data.mode === "email" ? data.email : data.phone;
  const maskedContact = data.mode === "email"
    ? contact?.replace(/(.{2}).+(@.+)/, "$1***$2")
    : contact?.replace(/.(?=.{4})/g, "*");

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Lire le presse-papier automatiquement à l'arrivée
  useEffect(() => {
    const tryReadClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          const digits = text.replace(/\D/g, "").slice(0, 6);
          if (digits.length === 6) {
            const arr = digits.split("");
            setCode(arr);
            setClipboardToast(true);
            setTimeout(() => setClipboardToast(false), 2500);
            // Auto-verify
            handleCodeComplete(arr);
          }
        }
      } catch (_) {
        // Permission refusée ou non supporté — silencieux
      }
    };
    // Délai léger pour laisser le composant se monter
    setTimeout(tryReadClipboard, 600);
  }, []);

  // Envoyer le code automatiquement à l'arrivée sur cette étape
  useEffect(() => {
    const sendCode = async () => {
      let currentData = JSON.parse(sessionStorage.getItem("bb_signup_data") || "{}");
      const isSocial = sessionStorage.getItem("bb_social_signup_processed") === "1";

      // Pour OAuth social : TOUJOURS l'email du compte Google sélectionné, pas celui du formulaire
      if (isSocial) {
        let user = null;
        for (let i = 0; i < 8; i++) {
          user = await supabase.auth.getUser().then(({ data }) => data?.user).catch(() => null);
          if (user?.email) break;
          await new Promise(r => setTimeout(r, 750));
        }
        if (user?.email) {
          currentData = { ...currentData, email: user.email, mode: "email" };
          sessionStorage.setItem("bb_signup_data", JSON.stringify(currentData));
          setData(currentData);
        }
      } else if (!currentData.email) {
        let user = null;
        for (let i = 0; i < 8; i++) {
          user = await supabase.auth.getUser().then(({ data }) => data?.user).catch(() => null);
          if (user?.email) break;
          await new Promise(r => setTimeout(r, 750));
        }
        if (user?.email) {
          currentData = { ...currentData, email: user.email, mode: "email" };
          sessionStorage.setItem("bb_signup_data", JSON.stringify(currentData));
          setData(currentData);
        }
      }

      const contact = currentData.mode === "email" ? currentData.email : currentData.phone;
      if (!contact) return;

      try {
        const res = await apiClient.callFunction("sendVerificationCode", {
          mode: currentData.mode || "email",
          email: currentData.email,
          phone: currentData.phone,
        });
        if (!res.data?.success) {
          console.error('[StepVerification] Send code failed:', res.data);
        }
        if (res.data?.code) {
          setOtpCode(res.data.code);
        }
      } catch (e) {
        console.error('[StepVerification] Send code error:', e);
      }
    };

    sendCode();
  }, []);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const fullCode = code.join("");

  const handleVerify = async () => {
    if (fullCode.length < 6 || loading) return;
    setLoading(true);
    setError("");
    const currentData = JSON.parse(sessionStorage.getItem("bb_signup_data") || "{}");
    const key = currentData.mode === "email" ? currentData.email : currentData.phone;
    if (!key) { setError("Contact introuvable. Recommencez depuis le début."); setLoading(false); return; }
    const res = await apiClient.callFunction("verifyCode", { key, code: fullCode });
    if (res.data?.success) {
      onNext();
    } else {
      setError(res.data?.error || "Code incorrect ou expiré.");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    setError("");
    const currentData = JSON.parse(sessionStorage.getItem("bb_signup_data") || "{}");
    await apiClient.callFunction("sendVerificationCode", { mode: currentData.mode || "email", email: currentData.email, phone: currentData.phone });
    setResending(false);
    setResendTimer(45);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Auto-verify when all 6 digits are filled
  const handleCodeComplete = async (newCode) => {
    if (newCode.join("").length === 6) {
      setLoading(true);
      setError("");
      const currentData = JSON.parse(sessionStorage.getItem("bb_signup_data") || "{}");
      const key = currentData.mode === "email" ? currentData.email : currentData.phone;
      if (!key) { setError("Contact introuvable. Recommencez depuis le début."); setLoading(false); return; }
      const res = await apiClient.callFunction("verifyCode", { key, code: newCode.join("") });
      if (res.data?.success) {
        onNext();
      } else {
        setError(res.data?.error || "Code incorrect ou expiré.");
        setCode(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      }
      setLoading(false);
    }
  };

  const handleChangeAuto = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    handleCodeComplete(next);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-10 pb-8">
      <ProgressBar step={2} total={5} />
      <StepLabel step={2} total={5} />

      <h2 className="text-[34px] font-black text-gray-900 leading-tight mb-1">Vérifiez<br />votre {data.mode === "email" ? "email" : "numéro"}</h2>
      <p className="text-[13px] text-gray-400 font-medium mb-8">
        Nous avons envoyé un code à 6 chiffres à{" "}
        <span className="font-black text-gray-700">{maskedContact}</span>
      </p>

      <div className="flex-1 flex flex-col items-center gap-6 pt-4">
        {/* Toast presse-papier */}
        {clipboardToast && (
          <div className="bg-green-500 text-white text-[12px] font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg">
            <span>📋</span> Code collé depuis le presse-papier !
          </div>
        )}

        {/* Code input */}
        <div className="flex gap-3" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={e => handleChangeAuto(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-[24px] font-black bg-gray-100 rounded-2xl outline-none transition-all"
              style={{
                border: digit ? "2px solid #E8732A" : "2px solid transparent",
                color: "#E8732A"
              }}
            />
          ))}
        </div>

        {otpCode && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 w-full text-center">
            <p className="text-[11px] text-orange-600 font-bold mb-1">Code de vérification :</p>
            <p className="text-[28px] font-black text-[#E8732A] tracking-[6px]">{otpCode}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 w-full text-center">
            <p className="text-[13px] text-red-500 font-bold">{error}</p>
          </div>
        )}

        {/* Resend */}
        <button
          onClick={handleResend}
          disabled={resendTimer > 0 || resending}
          className={`flex items-center gap-2 text-[12px] font-black active:scale-95 transition-all ${resendTimer > 0 ? 'text-gray-400 opacity-50' : 'text-[#E8732A]'}`}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
          {resendTimer > 0
            ? `Renvoyer le code dans ${resendTimer}s`
            : resending ? "Envoi en cours..." : "Renvoyer le code"
          }
        </button>
      </div>

      <div className="space-y-3 mt-6">
        <button
          onClick={handleVerify}
          disabled={fullCode.length < 6 || loading}
          className="w-full py-4 rounded-full font-black text-[14px] uppercase tracking-widest text-white transition-all active:scale-95"
          style={{ background: fullCode.length === 6 && !loading ? "#E8732A" : "#d1d5db" }}
        >
          {loading ? "Vérification..." : "Confirmer"}
        </button>
        <button onClick={onBack} className="w-full text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Retour</button>
      </div>
    </div>
  );
}

// ── STEP 2 — Profil Beauté ────────────────────────────────────────────────────
function StepBeautyProfile({ onNext, onBack }) {
  const [gender, setGender] = useState(null);
  const [interests, setInterests] = useState([]);

  const toggleInterest = (item) => {
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const pillBase = "px-5 py-3 rounded-full text-[12px] font-black border-2 transition-all active:scale-95 uppercase tracking-widest";

  const isValid = !!gender && interests.length >= 1;

  const handleContinue = () => {
    if (!isValid) return;
    const existing = JSON.parse(sessionStorage.getItem("bb_signup_data") || "{}");
    sessionStorage.setItem("bb_signup_data", JSON.stringify({ ...existing, gender, interests }));
    onNext();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-10 pb-8">
      <ProgressBar step={3} total={5} />
      <StepLabel step={3} total={5} />

      <h2 className="text-[34px] font-black text-gray-900 leading-tight mb-1">Votre Profil<br />Beauté</h2>
      <p className="text-[13px] text-gray-400 font-medium mb-6">Ces détails nous aident à personnaliser votre feed.</p>

      <div className="flex-1 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vous êtes ?</p>
            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">* Obligatoire</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {["FEMME", "HOMME", "AUTRE"].map(g => (
              <button key={g} onClick={() => setGender(g)} className={pillBase}
                style={{ borderColor: gender === g ? "#E8732A" : "#e5e7eb", background: gender === g ? "#E8732A" : "white", color: gender === g ? "white" : "#374151" }}>
                {g}
              </button>
            ))}
          </div>
          {!gender && <p className="text-[11px] text-orange-400 font-medium mt-2">Veuillez sélectionner une option</p>}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vos intérêts</p>
            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">* Au moins 1</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {INTERESTS.map(item => (
              <button key={item} onClick={() => toggleInterest(item)} className={pillBase}
                style={{ borderColor: interests.includes(item) ? "#E8732A" : "#e5e7eb", background: interests.includes(item) ? "#E8732A" : "white", color: interests.includes(item) ? "white" : "#374151" }}>
                {item}
              </button>
            ))}
          </div>
          {interests.length === 0 && <p className="text-[11px] text-orange-400 font-medium mt-2">Sélectionnez au moins un intérêt</p>}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full py-4 rounded-full font-black text-[14px] uppercase tracking-widest text-white active:scale-95 transition-all"
          style={{ background: isValid ? "#E8732A" : "#d1d5db" }}
        >
          Continuer
        </button>
        <button onClick={onBack} className="w-full text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Retour</button>
      </div>
    </div>
  );
}

// ── STEP 3 — Photo de profil + Bannière ──────────────────────────────────────
function StepPhoto({ onNext, onBack }) {
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [banner, setBanner] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const photoRef = useRef(null);
  const bannerRef = useRef(null);

  const handlePhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (file) { setPhotoFile(file); setPhoto(URL.createObjectURL(file)); }
  };

  const handleBannerFile = (e) => {
    const file = e.target.files?.[0];
    if (file) { setBannerFile(file); setBanner(URL.createObjectURL(file)); }
  };

  const canFinish = true;

  const handleFinish = async () => {
    setLoading(true);
    try {
      const data = JSON.parse(sessionStorage.getItem("bb_signup_data") || "{}");
      const user = await supabase.auth.getUser().then(({ data }) => data?.user).catch(() => null);
      if (user) {
        const updates = {
          gender: data.gender || null,
          beauty_interests: data.interests || [],
        };
        if (photoFile) {
          const { file_url } = await uploadFile({ file: photoFile });
          updates.avatar_url = file_url;
        }
        if (bannerFile) {
          const { file_url } = await uploadFile({ file: bannerFile });
          updates.cover_url = file_url;
        }
        await supabase.auth.getUser().then(async ({ data }) => { if (data?.user) await entities.User.update(data.user.id, updates); });
      }
    } catch (e) {
      // silently continue
    } finally {
      setLoading(false);
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-10 pb-8">
      <ProgressBar step={4} total={5} />
      <StepLabel step={4} total={5} />

      <h2 className="text-[34px] font-black text-gray-900 leading-tight mb-1">Personnalisez<br />votre profil</h2>
      <p className="text-[13px] text-gray-400 font-medium mb-6">Ajoutez une photo et une bannière pour vous identifier.</p>

      <div className="flex-1 space-y-6">
        {/* Bannière — optionnelle */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bannière de profil</p>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Optionnelle</span>
          </div>
          <div
            onClick={() => bannerRef.current?.click()}
            className="relative w-full h-32 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-all border-2 border-dashed"
            style={{ borderColor: banner ? "#E8732A" : "#e5e7eb", background: "#f9fafb" }}
          >
            {banner ? (
              <img src={banner} alt="Bannière" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <Camera className="w-8 h-8 text-gray-300" strokeWidth={1} />
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Ajouter une bannière</span>
              </div>
            )}
            {banner && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-[11px] font-black uppercase">Changer</span>
              </div>
            )}
          </div>
          <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerFile} className="hidden" />

        </div>

        {/* Photo de profil — obligatoire */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Photo de profil</p>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Optionnelle</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                onClick={() => photoRef.current?.click()}
                className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed cursor-pointer"
                style={{ borderColor: photo ? "#E8732A" : "#e5e7eb", background: "#f9fafb" }}>
                {photo ? (
                  <img src={photo} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-300" strokeWidth={1} />
                )}
              </div>
              <button onClick={() => photoRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                style={{ background: "#E8732A" }}>
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
            </div>
            <div>
              <p className="text-[13px] font-black text-gray-800">Photo de profil</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Visible par la communauté</p>

            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <button onClick={handleFinish} disabled={loading}
          className="w-full py-4 rounded-full font-black text-[14px] uppercase tracking-widest text-white active:scale-95 transition-all"
          style={{ background: !loading ? "#E8732A" : "#d1d5db" }}>
          {loading ? "Enregistrement..." : "Terminer mon profil"}
        </button>
        <button onClick={onBack} className="w-full text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Retour</button>
      </div>
    </div>
  );
}

// ── STEP 4 — Success ──────────────────────────────────────────────────────────
function StepSuccess({ onDone }) {
  const data = JSON.parse(sessionStorage.getItem("bb_signup_data") || "{}");
  const prenom = data.prenom || "";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between px-6 py-16">
      <div className="absolute inset-0">
        <img src="https://media.base44.com/images/public/6a0ba7bd3d55dddeb85a8366/db68ade46_generated_image.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,10,5,0.35) 0%, rgba(10,5,0,0.65) 55%, rgba(5,0,0,0.92) 100%)" }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        {/* Logo B avec cercle rose pâle */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-2xl overflow-hidden"
          style={{ background: "white", border: "3px solid #f2c4a8" }}>
          <img src={LOGO_IMG} alt="BeautyBook" className="w-16 h-16 object-contain" />
        </div>
        <h2 className="text-[48px] font-black text-white leading-tight mb-2">
          Merveilleux{prenom ? `,\n${prenom}` : ""}<br />!
        </h2>
        <p className="text-[15px] text-white/70 font-medium leading-relaxed max-w-[260px]">
          Votre profil est prêt. Bienvenue dans la communauté BeautyBook.
        </p>
      </div>

      <div className="relative z-10 w-full">
        <button onClick={onDone}
          className="w-full py-4 rounded-full font-black text-[14px] uppercase tracking-widest text-white active:scale-95 transition-all shadow-lg"
          style={{ background: "#E8732A", boxShadow: "0 0 40px rgba(232,115,42,0.5)" }}>
          Découvrir BeautyBook
        </button>
      </div>
    </div>
  );
}

// ── Main Onboarding ───────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  // Si retour après login social, démarrer à l'étape 2
  const [step, setStep] = useState(() => {
    if (sessionStorage.getItem("bb_social_signup") === "1") {
      sessionStorage.removeItem("bb_social_signup");
      sessionStorage.setItem("bb_social_signup_processed", "1");
      return 2;
    }
    // Si on vient de "Créer un compte" depuis la page connexion, démarrer à l'étape 1
    if (sessionStorage.getItem("bb_from_login") === "1") {
      sessionStorage.removeItem("bb_from_login");
      return 1;
    }
    return 0;
  });

  const done = () => {
    localStorage.setItem("bb_onboarded", "1");
    sessionStorage.removeItem("bb_signup_data");
    sessionStorage.removeItem("bb_social_signup_processed");
    window.location.href = "/";
  };

  return (
    <div className="font-display relative">
      {step === 0 && <StepSplash onNext={() => setStep(1)} onDiscover={done} />}
      {step === 1 && <StepSignup onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <StepVerification onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <StepBeautyProfile onNext={() => setStep(4)} onBack={() => setStep(2)} />}
      {step === 4 && <StepPhoto onNext={() => setStep(5)} onBack={() => setStep(3)} />}
      {step === 5 && <StepSuccess onDone={done} />}
    </div>
  );
}