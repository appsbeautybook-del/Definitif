import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MORNING = ["09:00", "10:15", "11:30"];
const AFTERNOON = ["14:00", "15:15", "16:30", "17:45", "19:00"];

export default function StepTimeSlots({ selectedDate, selectedTime, price, onSelectTime, onNext, onBack }) {
  const handleSelect = (time) => {
    onSelectTime(time);
  };

  const handleNext = () => {
    if (!selectedTime) return;
    onNext();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Étape 3 sur 4</p>
          <p className="text-[17px] font-serif italic text-gray-900">Date & Heure</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-6">
        {selectedDate && (
          <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-6">
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        )}

        {/* Morning */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[18px] font-black text-gray-900">Matinée</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Créneaux disponibles</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {MORNING.map(time => {
              const isSel = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => handleSelect(time)}
                  className="px-6 py-3 rounded-2xl border-2 text-[15px] font-black transition-all active:scale-95"
                  style={{
                    borderColor: isSel ? "#E8732A" : "#e5e7eb",
                    background: isSel ? "#E8732A" : "white",
                    color: isSel ? "white" : "#111827",
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Afternoon */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[18px] font-black text-gray-900">Après-midi</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Créneaux disponibles</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {AFTERNOON.map(time => {
              const isSel = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => handleSelect(time)}
                  className="px-6 py-3 rounded-2xl border-2 text-[15px] font-black transition-all active:scale-95"
                  style={{
                    borderColor: isSel ? "#E8732A" : "#e5e7eb",
                    background: isSel ? "#E8732A" : "white",
                    color: isSel ? "white" : "#111827",
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-5 pb-8 pt-4">
        <div className="rounded-3xl overflow-hidden" style={{ background: "#111" }}>
          <div className="px-5 pt-4 pb-1 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Votre rendez-vous</p>
              <p className="text-[16px] font-black text-white">
                {selectedTime && selectedDate
                  ? `${selectedTime}  ${format(selectedDate, "EEEE d MMMM", { locale: fr })}`
                  : selectedDate
                  ? format(selectedDate, "EEEE d MMMM", { locale: fr })
                  : "Choisissez un horaire"}
              </p>
            </div>
            <span className="text-[18px] font-black text-white">{price}€</span>
          </div>
          <div className="px-5 pb-5 pt-3">
            <button
              onClick={handleNext}
              disabled={!selectedTime}
              className="w-full py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-40"
              style={{ background: "#E8732A" }}
            >
              Confirmer ce créneau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}