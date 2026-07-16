import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Shield, CreditCard, AlertTriangle, ChevronRight } from "lucide-react";
import { useThemeBg } from "@/hooks/useTheme";

const SECTIONS = [
  {
    icon: FileText, color: "bg-blue-50", iconColor: "text-blue-500",
    title: "Conditions Générales d'Utilisation",
    date: "Mise à jour : 1er janvier 2025",
    content: `BeautyBook est une plateforme de mise en relation entre professionnels de la beauté et clients. En utilisant notre application, vous acceptez les présentes conditions.\n\nL'utilisation de BeautyBook est réservée aux personnes majeures ou avec accord parental. Vous êtes responsable de la confidentialité de votre compte. BeautyBook se réserve le droit de suspendre tout compte en cas de comportement inapproprié.`
  },
  {
    icon: Shield, color: "bg-green-50", iconColor: "text-green-500",
    title: "Politique de Confidentialité",
    date: "Mise à jour : 1er janvier 2025",
    content: `Nous collectons uniquement les données nécessaires au bon fonctionnement du service : nom, email, historique de réservations. Vos données ne sont jamais vendues à des tiers.\n\nConformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez privacy@beautybook.fr pour exercer ces droits.`
  },
  {
    icon: CreditCard, color: "bg-orange-50", iconColor: "text-primary",
    title: "Conditions de Paiement",
    date: "Mise à jour : 15 mars 2025",
    content: `Les paiements sont effectués directement en salon sauf indication contraire. BeautyBook ne stocke pas vos informations de carte bancaire complètes.\n\nEn cas d'annulation tardive (moins de 24h), des frais peuvent être prélevés selon la politique du professionnel. BeautyBook n'est pas responsable des litiges entre clients et professionnels.`
  },
  {
    icon: AlertTriangle, color: "bg-red-50", iconColor: "text-red-400",
    title: "Politique d'Annulation",
    date: "Mise à jour : 1er janvier 2025",
    content: `Vous pouvez annuler gratuitement jusqu'à 24h avant votre rendez-vous. Entre 24h et 2h avant, une pénalité de 30% peut s'appliquer. Moins de 2h avant ou non-présentation : 100% des frais peuvent être facturés.`
  },
];

export default function Conditions() {
  const navigate = useNavigate();
  const themeBg = useThemeBg();

  return (
    <div className="font-display min-h-screen" style={{ background: themeBg }}>
      <div className="bg-white px-5 pt-12 pb-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        <h1 className="text-[20px] font-black text-gray-900">Conditions & Légal</h1>
      </div>

      <div className="px-4 pb-20 pt-5 space-y-4">

        <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
          <p className="text-[12px] text-primary font-bold leading-relaxed">
            En utilisant BeautyBook, vous acceptez l'ensemble de nos conditions d'utilisation et politique de confidentialité.
          </p>
        </div>

        {SECTIONS.map(({ icon: Icon, color, iconColor, title, date, content }, i) => (
          <div key={i} className="bg-white rounded-3xl overflow-hidden">
            <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-50">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-black text-gray-900">{title}</p>
                <p className="text-[10px] text-gray-400 font-medium">{date}</p>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="text-[12px] text-gray-500 leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          </div>
        ))}

        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-400 font-medium">BeautyBook SAS — contact@beautybook.fr</p>
          <p className="text-[10px] text-gray-300 font-medium mt-0.5">12 Avenue Montaigne, 75008 Paris</p>
        </div>
      </div>
    </div>
  );
}