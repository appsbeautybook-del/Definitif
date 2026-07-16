import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Store, Loader2, User, Phone } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { supabase } from "@/api/supabaseClient";

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary transition-colors";

export default function VendeurSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (sessionStorage.getItem("bb_vendeur_email")) {
      navigate("/vendeur/dashboard");
    }
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // 1. Register through the secure backend
      const { data: resData } = await apiClient.callFunction("vendeurRegister", { email, password, prenom, nom, phone });
      const res = resData || {};
      
      if (res.success) {
        // 2. Automatically log them in right after via the backend API
        const { data: loginData } = await apiClient.callFunction("vendeurLogin", { email, password });
        const loginRes = loginData || {};
        
        if (loginRes.success && loginRes.session) {
          // Sync session locally
          await supabase.auth.setSession({
            access_token: loginRes.session.access_token,
            refresh_token: loginRes.session.refresh_token,
          });

          sessionStorage.setItem("bb_vendeur_email", email);
          navigate("/vendeur/dashboard");
        } else {
          // If login fails right after registration, send them to login page
          navigate("/vendeur/login");
        }
      } else {
        setError(res.error || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      setError(err.message || "Impossible de s'inscrire.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-6 font-display py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[28px] font-black text-gray-900">Créer une boutique</h1>
          <p className="text-gray-400 text-[14px] mt-1">Rejoignez BeautyBook en tant que vendeur</p>
        </div>
        
        <form onSubmit={handleSignup} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-4">
          {error && <p className="text-red-500 text-[12px] font-medium p-3 bg-red-50 rounded-xl">{error}</p>}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1">Prénom</label>
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Jean" className={inputCls} required />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1">Nom</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" className={inputCls} required />
            </div>
          </div>
          
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1">Téléphone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="06 12 34 56 78" className={inputCls} required />
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1">Email pro</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="boutique@beautybook.fr" className={inputCls} required />
          </div>
          
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} required minLength={6} />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl text-[14px] font-black shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-4">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Création..." : "Ouvrir ma boutique"}
          </button>
          
          <div className="mt-6 text-center text-[12px] text-gray-500">
            Vous avez déjà un compte ?{" "}
            <Link to="/vendeur/login" className="text-primary font-black underline">Se connecter</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
