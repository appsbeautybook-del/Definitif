import { useState, useEffect, useRef } from "react";
import { uploadFile } from '@/api/entities';
import { adminApi } from '@/lib/adminApiClient';
import { Upload, Loader2, Save, Plus, X, Image, Info } from "lucide-react";

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary";

// Format recommandé pour la bannière boutique : 16:5 (env 800×250px)
const BANNER_RATIO = "16:5";
const BANNER_WIDTH = 800;
const BANNER_HEIGHT = 250;

// Prévisualisation de la bannière telle qu'elle apparaît dans la boutique
function BannerPreview({ banner }) {
  if (!banner.image && !banner.title) return null;
  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ aspectRatio: "16/5", background: "linear-gradient(135deg, #E8732A, #f59540)" }}>
      {banner.image && (
        <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Overlay sombre pour lisibilité */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.15) 100%)" }} />
      <div className="absolute inset-0 flex items-center justify-between px-5">
        <div>
          {banner.label && (
            <p className="text-white/80 text-[9px] font-black uppercase tracking-widest mb-0.5">✦ {banner.label}</p>
          )}
          {banner.title && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-white text-[22px] font-black leading-none drop-shadow-sm">{banner.title}</span>
            </div>
          )}
          {banner.subtitle && (
            <p className="text-white/80 text-[10px] font-bold mt-0.5">{banner.subtitle}</p>
          )}
        </div>
        {banner.cta && (
          <div className="shrink-0 bg-white rounded-full px-4 py-2 text-gray-900 text-[11px] font-black uppercase tracking-widest shadow-md">
            {banner.cta}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminBoutiqueBanners() {
  const [banners, setBanners] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [saved, setSaved] = useState(false);
  const imgRefs = useRef([]);

  useEffect(() => {
    adminApi.getConfig("boutique_banners")
      .then(({ data }) => {
        const rows = data.results || [];
        if (rows[0]?.value?.banners?.length > 0) {
          setBanners(rows[0].value.banners);
        } else {
          setBanners([{ title: "", subtitle: "", label: "", cta: "EN PROFITER", cta_link: "/boutique", image: "", active: true }]);
        }
      })
      .catch(() => setBanners([{ title: "", subtitle: "", label: "", cta: "EN PROFITER", cta_link: "/boutique", image: "", active: true }]));
  }, []);

  const upload = async (e, idx) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(idx);
    const { file_url } = await uploadFile({ file });
    setBanners(l => l.map((b, i) => i === idx ? { ...b, image: file_url } : b));
    setUploading(null); e.target.value = "";
  };

  const add = () => setBanners(l => [...l, { title: "", subtitle: "", label: "", cta: "EN PROFITER", cta_link: "/boutique", image: "", active: true }]);
  const remove = (idx) => setBanners(l => l.filter((_, i) => i !== idx));
  const update = (idx, field, val) => setBanners(l => l.map((b, i) => i === idx ? { ...b, [field]: val } : b));

  const save = async () => {
    setSaving(true);
    const { data } = await adminApi.getConfig("boutique_banners").catch(() => ({ data: { results: [] } }));
    const rows = data.results || [];
    const payload = { banners };
    if (rows[0]?.id) {
      await adminApi.updateConfig(rows[0].id, { value: payload });
    } else {
      await adminApi.createConfig({ key: "boutique_banners", value: payload });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Info taille */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-700 text-[12px] font-black">Taille recommandée pour les bannières Boutique</p>
          <p className="text-blue-600 text-[11px] mt-0.5">
            <strong>{BANNER_WIDTH} × {BANNER_HEIGHT} px</strong> — Ratio {BANNER_RATIO} (format horizontal panoramique).<br />
            L'image sera automatiquement recadrée pour remplir la bannière. Préférez des images larges.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-black text-gray-900">🛍 Bannières de la Boutique</h3>
        <div className="flex items-center gap-2">
          {saved && <span className="text-green-600 text-[12px] font-black animate-pulse">✓ Sauvegardé !</span>}
          <button onClick={add} className="flex items-center gap-1.5 text-primary text-[12px] font-black border border-primary/30 rounded-xl px-3 py-2 hover:bg-primary/5">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
      </div>

      {banners.map((banner, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-[12px] font-black text-gray-500">Bannière {idx + 1}</span>
            <div className="flex items-center gap-3">
              {/* Toggle active */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => update(idx, "active", !banner.active)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${banner.active ? "bg-primary" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${banner.active ? "left-4" : "left-0.5"}`} />
                </div>
                <span className={`text-[11px] font-black ${banner.active ? "text-primary" : "text-gray-400"}`}>
                  {banner.active ? "Active" : "Inactive"}
                </span>
              </label>
              {banners.length > 1 && (
                <button onClick={() => remove(idx)} className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-red-500" />
                </button>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Upload image */}
            <input ref={el => imgRefs.current[idx] = el} type="file" accept="image/*" className="hidden" onChange={e => upload(e, idx)} />
            
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Image de fond <span className="text-gray-400 normal-case font-medium">({BANNER_WIDTH}×{BANNER_HEIGHT}px recommandé)</span></p>
              {banner.image ? (
                <div className="space-y-2">
                  {/* Prévisualisation réelle */}
                  <BannerPreview banner={banner} />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex-1">
                      <Image className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-green-700 text-[12px] font-bold flex-1">✓ Image définie — aperçu ci-dessus</span>
                    </div>
                    <button onClick={() => imgRefs.current[idx]?.click()} className="text-primary text-[11px] font-black px-3 py-2 border border-primary/30 rounded-xl hover:bg-primary/5">
                      Changer
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => imgRefs.current[idx]?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl py-6 text-gray-400 hover:border-primary hover:text-primary transition-all">
                  {uploading === idx ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  <div className="text-center">
                    <p className="text-[13px] font-black">{uploading === idx ? "Upload en cours..." : "Cliquer pour uploader"}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Taille idéale : {BANNER_WIDTH}×{BANNER_HEIGHT}px (ratio {BANNER_RATIO})</p>
                  </div>
                </button>
              )}
            </div>

            {/* Textes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Étiquette (au-dessus du titre)</label>
                <input value={banner.label || ""} onChange={e => update(idx, "label", e.target.value)} placeholder="Ex: COLLECTION ÉTÉ 2024" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Titre principal</label>
                <input value={banner.title || ""} onChange={e => update(idx, "title", e.target.value)} placeholder="Ex: -40% sur tout" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Sous-titre</label>
              <input value={banner.subtitle || ""} onChange={e => update(idx, "subtitle", e.target.value)} placeholder="Ex: Membres Gold uniquement" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Texte du bouton</label>
                <input value={banner.cta || ""} onChange={e => update(idx, "cta", e.target.value)} placeholder="EN PROFITER" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Lien du bouton</label>
                <input value={banner.cta_link || ""} onChange={e => update(idx, "cta_link", e.target.value)} placeholder="/boutique" className={inputCls} />
              </div>
            </div>

            {/* Prévisualisation si pas encore d'image */}
            {!banner.image && (banner.title || banner.label) && (
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Aperçu (sans image)</p>
                <BannerPreview banner={banner} />
              </div>
            )}
          </div>
        </div>
      ))}

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-[13px] font-black disabled:opacity-60 shadow-md shadow-primary/20 active:scale-95 transition-all">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</> : <><Save className="w-4 h-4" /> Sauvegarder les bannières</>}
      </button>
    </div>
  );
}