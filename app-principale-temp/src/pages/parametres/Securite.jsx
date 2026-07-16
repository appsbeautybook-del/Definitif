import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Key, Smartphone, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useThemeBg } from "@/hooks/useTheme";

export default function Securite() {
  const navigate = useNavigate();
  const themeBg = useThemeBg();
  const [faceId, setFaceId] = useState(() => localStorage.getItem("bb_faceid") === "1");
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [pwdSaved, setPwdSaved] = useState(false);

  const toggleFaceId = () => {
    const val = !faceId;
    setFaceId(val);
    localStorage.setItem("bb_faceid", val ? "1" : "0");
  };

  const handleSavePwd = () => {
    if (!pwd.current || !pwd.next || pwd.next !== pwd.confirm) return;
    setPwdSaved(true);
    setShowChangePwd(false);
    setPwd({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwdSaved(false), 3000);
  };

  const inputClass = "w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-medium text-gray-800 outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-gray-400 pr-12";

  return (
    <div className="font-display min-h-screen" style={{ background: themeBg }}>
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        <h1 className="text-[20px] font-black text-gray-900">Sécurité</h1>
      </div>

      <div className="px-4 pb-20 pt-6 space-y-5">

        {pwdSaved && (
          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-[13px] font-bold text-green-600">Mot de passe mis à jour avec succès !</p>
          </div>
        )}

        {/* Accès au compte */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Accès au compte</p>
          <div className="bg-white rounded-3xl overflow-hidden">
            {/* Mot de passe */}
            <div className="px-4 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-black text-gray-900">Mot de passe</p>
                  <p className="text-[11px] text-gray-400 font-medium">Modifié il y a 3 mois</p>
                </div>
                <button
                  onClick={() => setShowChangePwd(!showChangePwd)}
                  className="text-[13px] font-black active:scale-95 transition-all"
                  style={{ color: "#E8732A" }}
                >
                  {showChangePwd ? "ANNULER" : "MODIFIER"}
                </button>
              </div>

              {showChangePwd && (
                <div className="mt-4 space-y-3">
                  {[
                    { key: "current", label: "Mot de passe actuel", placeholder: "••••••••" },
                    { key: "next", label: "Nouveau mot de passe", placeholder: "••••••••" },
                    { key: "confirm", label: "Confirmer le nouveau", placeholder: "••••••••" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                      <div className="relative">
                        <input
                          className={inputClass}
                          type={showPwd[key] ? "text" : "password"}
                          placeholder={placeholder}
                          value={pwd[key]}
                          onChange={e => setPwd(p => ({ ...p, [key]: e.target.value }))}
                        />
                        <button
                          onClick={() => setShowPwd(s => ({ ...s, [key]: !s[key] }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPwd[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwd.next && pwd.confirm && pwd.next !== pwd.confirm && (
                    <p className="text-[11px] text-red-400 font-bold">Les mots de passe ne correspondent pas.</p>
                  )}
                  <button
                    onClick={handleSavePwd}
                    disabled={!pwd.current || !pwd.next || pwd.next !== pwd.confirm}
                    className="w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-40"
                    style={{ background: "#E8732A" }}
                  >
                    Enregistrer
                  </button>
                </div>
              )}
            </div>

            {/* Face ID */}
            <div className="px-4 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-[20px]">🔐</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-black text-gray-900">Face ID / Touch ID</p>
                <p className="text-[11px] text-gray-400 font-medium">{faceId ? "Activé" : "Désactivé"}</p>
              </div>
              <div
                onClick={toggleFaceId}
                className="w-12 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 cursor-pointer"
                style={{ background: faceId ? "#E8732A" : "#d1d5db" }}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${faceId ? "translate-x-6" : "translate-x-0"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Appareils connectés */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Appareils connectés</p>
          <div className="bg-white rounded-3xl overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-black text-gray-900">iPhone 15 Pro (Cet appareil)</p>
                <p className="text-[11px] font-black" style={{ color: "#22c55e" }}>EN LIGNE</p>
              </div>
            </div>
            <button className="w-full px-4 py-4 text-center">
              <p className="text-[13px] font-black text-red-400 uppercase tracking-widest">Se déconnecter de tous les appareils</p>
            </button>
          </div>
        </div>

        {/* Sessions récentes */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Sessions récentes</p>
          <div className="bg-white rounded-3xl overflow-hidden divide-y divide-gray-50">
            {[
              { device: "iPhone 15 Pro", location: "Paris, France", date: "Aujourd'hui 19:08", current: true },
              { device: "MacBook Pro", location: "Paris, France", date: "Hier 14:22", current: false },
              { device: "iPad Air", location: "Lyon, France", date: "22 mai 09:15", current: false },
            ].map((s, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${s.current ? "bg-green-400" : "bg-gray-300"}`} />
                <div className="flex-1">
                  <p className="text-[13px] font-black text-gray-900">{s.device}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{s.location} · {s.date}</p>
                </div>
                {!s.current && (
                  <button className="text-[11px] font-black text-red-400">Révoquer</button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}