import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Image } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from '@/api/supabaseClient';
import { useProfileMedia } from "@/hooks/useProfileMedia";
import { compressMedia } from "@/lib/compressMedia";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200";
const DEFAULT_BANNER = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800";
const bioMax = 160;
const API = 'http://localhost:3000/api';

async function apiPost(endpoint, body, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `Erreur ${res.status}`);
    return json;
  } finally {
    clearTimeout(timer);
  }
}

async function uploadToBackend(file) {
  const compressed = await compressMedia(file);
  const toBase64 = (f) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });
  const content = await toBase64(compressed);
  const json = await apiPost('/upload', { name: compressed.name, type: compressed.type, content }, 30000);
  return json.file_url;
}

export default function ModifierProfilClient() {
  const navigate = useNavigate();
  const { user, profile, refreshUser } = useAuth();
  const { avatarUrl, coverUrl, uploadingAvatar, uploadingCover, selectAvatar, selectCover } = useProfileMedia(user);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const pendingAvatarRef = useRef(null);
  const pendingCoverRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    bio: "",
  });

  useEffect(() => {
    const loadForm = async () => {
      if (!user?.id) return;
      // Fetch fresh profile data directly from Supabase
      const { data } = await supabase.from('profiles').select('full_name, username, bio').eq('id', user.id).maybeSingle();
      if (data) {
        setForm({
          fullName: data.full_name || "",
          username: data.username || "",
          bio: data.bio || "",
        });
      }
    };
    loadForm();
  }, [user?.id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      pendingAvatarRef.current = file;
      selectAvatar(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      pendingCoverRef.current = file;
      selectCover(file);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setError("Vous devez être connecté");
        setSaving(false);
        return;
      }

      const profileData = {};
      if (form.fullName) profileData.full_name = form.fullName;
      if (form.username) profileData.username = form.username;
      if (form.bio !== undefined) profileData.bio = form.bio;

      // Upload avatar
      if (pendingAvatarRef.current) {
        try {
          const url = await uploadToBackend(pendingAvatarRef.current);
          if (url) profileData.avatar_url = url;
        } catch (e) {
          console.error('Avatar upload error:', e);
          setError("Erreur upload avatar: " + e.message);
          setSaving(false);
          return;
        }
        pendingAvatarRef.current = null;
      }

      // Upload cover
      if (pendingCoverRef.current) {
        try {
          const url = await uploadToBackend(pendingCoverRef.current);
          if (url) profileData.cover_url = url;
        } catch (e) {
          console.error('Cover upload error:', e);
          setError("Erreur upload bannière: " + e.message);
          setSaving(false);
          return;
        }
        pendingCoverRef.current = null;
      }

      // Update profiles table
      if (Object.keys(profileData).length > 0) {
        await apiPost('/crud/update', { table: 'profiles', id: authUser.id, data: profileData });
      }

      setSaving(false);
      setSaved(true);
      if (refreshUser) await refreshUser();
      setTimeout(() => {
        window.location.replace('/profil?' + Date.now());
      }, 300);
    } catch (error) {
      console.error("Error saving:", error);
      setError("Erreur: " + error.message);
      setSaving(false);
    }
  };

  return (
    <div className="font-display min-h-full bg-[#f5f5f5]">
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        <h1 className="text-[20px] font-black text-gray-900">Modifier le profil</h1>
      </div>

      <div className="pb-32">
        <div className="bg-white mb-3">
          <div className="flex flex-col items-center pt-6 pb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-primary shadow-lg">
                <img src={avatarUrl || DEFAULT_AVATAR} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full border-2 border-white flex items-center justify-center shadow active:scale-95">
                {uploadingAvatar ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              </button>
            </div>
            <button onClick={() => avatarInputRef.current?.click()} className="mt-2 text-[12px] font-black text-primary uppercase tracking-widest">
              Changer la photo
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div onClick={() => bannerInputRef.current?.click()}
            className="relative mx-4 mb-4 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 cursor-pointer active:scale-[0.99] transition-all">
            <img src={coverUrl || DEFAULT_BANNER} alt="bannière" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              {uploadingCover
                ? <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                : <><Image className="w-5 h-5 text-gray-500" /><span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Modifier la bannière</span></>}
            </div>
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
        </div>

        {error && (
          <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-[13px] text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white px-5 py-5 space-y-5 mb-3">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom complet</p>
            <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Utilisateur BeautyBook" className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-gray-800 outline-none" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom d'utilisateur</p>
            <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3.5 cursor-text" onClick={() => document.getElementById('username-input')?.focus()}>
              <span className="text-[15px] text-gray-400 font-medium mr-1 select-none">@</span>
              <input id="username-input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="elena_beauté" className="flex-1 bg-transparent text-[15px] font-medium text-gray-800 outline-none" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Biographie</p>
            <textarea value={form.bio} onChange={e => e.target.value.length <= bioMax && setForm(f => ({ ...f, bio: e.target.value }))}
              rows={4} placeholder="Parlez de vous..." className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-gray-800 outline-none resize-none" />
            <p className="text-right text-[11px] text-gray-400 font-medium mt-1">{form.bio.length} / {bioMax}</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 z-[99]" style={{ paddingTop: "12px", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
        <button onClick={save} disabled={saving}
          className="w-full bg-primary text-white font-black text-[15px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all">
          {saved ? "✓ Enregistré !" : saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
