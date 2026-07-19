import { useState, useEffect } from "react";
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, LogOut, Plus, BarChart2 } from 'lucide-react';

export default function VendeurDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    supabase.from('Service').select('*').eq('pro_email', user.email).order('created_at', { ascending: false })
      .then(({ data }) => setServices(data || []))
      .finally(() => setLoading(false));
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black text-gray-900">Espace Vendeur</h1>
        <button onClick={signOut} className="text-gray-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Mes Services</h2>
            <span className="text-sm text-gray-400">{services.length}</span>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Aucun service</div>
          ) : (
            <div className="space-y-2">
              {services.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{s.name || s.title}</p>
                    <p className="text-xs text-gray-400">{s.price}€</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
