import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, ArrowLeft } from "lucide-react";

export default function DevenirProConfirmation() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center font-display">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <Clock className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-[28px] font-black text-gray-900 mb-3">Demande envoyée !</h1>
      <p className="text-[14px] text-gray-500 font-medium leading-relaxed max-w-xs mb-2">
        Votre dossier est en cours de vérification par notre équipe.
      </p>
      <p className="text-[13px] text-gray-400 font-medium leading-relaxed max-w-xs mb-8">
        Vous recevrez une notification dès que votre compte professionnel sera approuvé. Délai moyen : <span className="font-black text-primary">24–48h</span>.
      </p>
      <div className="w-full max-w-xs space-y-3">
        <button onClick={() => navigate("/")} className="w-full bg-primary text-white font-black py-4 rounded-2xl text-[14px] uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 transition-all">
          Retour à l'accueil
        </button>
        <button onClick={() => navigate("/profil")} className="w-full bg-gray-100 text-gray-600 font-black py-4 rounded-2xl text-[14px] active:scale-95 transition-all">
          Mon profil
        </button>
      </div>
    </div>
  );
}