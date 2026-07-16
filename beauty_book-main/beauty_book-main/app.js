let currentUserRole = 'client'; // 'client', 'professional', 'administrator'

const SCREENS = {
    accueil: `
        <div class="flex flex-col space-y-10 pb-28 overflow-y-auto hide-scrollbar">
            <!-- 1. Hero Banner -->
            <div class="px-5 pt-4">
                <div class="relative h-52 w-full rounded-[2rem] overflow-hidden shadow-xl">
                    <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop" class="w-full h-full object-cover object-center">
                    <div class="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent flex flex-col justify-center px-7 space-y-2">
                        <h2 class="text-white text-2xl font-black leading-snug">Éclat d'été :<br>-20% sur les<br>forfaits</h2>
                        <p class="text-white/85 text-[10px] font-bold">Réservez avant le 30 juillet</p>
                        <button class="mt-2 bg-white text-gray-900 px-7 py-3 rounded-full text-[10px] font-black w-fit uppercase tracking-wider active:scale-95 transition-all shadow-lg">En profiter</button>
                    </div>
                    <!-- Carousel Indicators -->
                    <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 item-center">
                        <div class="w-6 h-1 bg-white rounded-full"></div>
                        <div class="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                        <div class="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- 2. Services Tendance -->
            <section class="space-y-4">
                <div class="px-5 flex items-center justify-between">
                    <h3 class="text-[17px] font-black text-gray-900">Services Tendance</h3>
                    <button class="text-primary text-[11px] font-black uppercase tracking-widest" onclick="navigateTo('services')">VOIR TOUT</button>
                </div>
                <div class="flex gap-4 overflow-x-auto px-5 hide-scrollbar">
                    <div class="min-w-[190px] bg-white rounded-[2.5rem] border border-gray-100 p-3 shadow-md active:scale-95 transition-transform cursor-pointer" onclick="navigateTo('service_detail')">
                        <div class="relative h-48 w-full rounded-[2rem] overflow-hidden mb-3">
                            <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1935&auto=format&fit=crop" class="w-full h-full object-cover">
                            <span class="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-lg">
                                <span class="material-symbols-outlined text-[10px]">bolt</span> POPULAIRE
                            </span>
                        </div>
                        <div class="px-2 pb-1">
                            <h4 class="font-black text-[13px] text-gray-900">Lifting de cils</h4>
                            <p class="text-[11px] text-gray-400 mt-1 font-bold">À partir de 45€</p>
                        </div>
                    </div>
                    <div class="min-w-[190px] bg-white rounded-[2.5rem] border border-gray-100 p-3 shadow-md active:scale-95 transition-transform cursor-pointer">
                        <div class="relative h-48 w-full rounded-[2rem] overflow-hidden mb-3">
                            <img src="https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=2070&auto=format&fit=crop" class="w-full h-full object-cover">
                            <span class="absolute top-3 left-3 px-3 py-1 bg-orange-50 text-primary text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 border border-orange-200 shadow-sm">
                                <span class="material-symbols-outlined text-[10px]">star</span> TOP VENTES
                            </span>
                        </div>
                        <div class="px-2 pb-1">
                            <h4 class="font-black text-[13px] text-gray-900">Manucure Russe</h4>
                            <p class="text-[11px] text-gray-400 mt-1 font-bold">À partir de 35€</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 3. Salon du Mois -->
            <section class="space-y-4">
                <div class="px-5 flex items-center justify-between">
                    <h3 class="text-[17px] font-black text-gray-900">Salon du Mois</h3>
                    <div class="flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                        <span class="material-symbols-outlined text-[10px]">workspace_premium</span> À L'HONNEUR
                    </div>
                </div>
                <div class="px-5">
                    <div class="relative h-64 w-full rounded-[2.5rem] overflow-hidden shadow-2xl group active:scale-[0.98] transition-all cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop" class="w-full h-full object-cover">
                        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-7">
                            <h4 class="text-white text-2xl font-black">L'Atelier de Beauté</h4>
                            <p class="text-white/70 text-[11px] font-bold mt-1">Paris 8ème • ★ 4.9 (120 avis)</p>
                            <div class="flex gap-2 mt-4">
                                <span class="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20">Luxueux</span>
                                <span class="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20">Éco-responsable</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. Produits Tendance -->
            <section class="space-y-4">
                <div class="px-5 flex items-center justify-between">
                    <h3 class="text-[17px] font-black text-gray-900">Produits Tendance</h3>
                    <button class="text-primary text-[11px] font-black uppercase tracking-widest" onclick="navigateTo('boutique')">LA BOUTIQUE</button>
                </div>
                <div class="flex gap-4 overflow-x-auto px-5 hide-scrollbar">
                    <div class="min-w-[140px] space-y-3">
                        <div class="relative h-40 w-full rounded-[1.8rem] overflow-hidden shadow-sm">
                            <img src="https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=1964&auto=format&fit=crop" class="w-full h-full object-cover">
                            <button class="absolute bottom-3 right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                <span class="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                        <div class="px-1">
                            <h4 class="font-bold text-[11px] text-gray-900 leading-tight">Sérum Vitamine C</h4>
                            <p class="text-orange-500 font-black text-[11px] mt-0.5">24.90€</p>
                        </div>
                    </div>
                    <div class="min-w-[140px] space-y-3">
                        <div class="relative h-40 w-full rounded-[1.8rem] overflow-hidden shadow-sm">
                            <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop" class="w-full h-full object-cover">
                            <button class="absolute bottom-3 right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                <span class="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                        <div class="px-1">
                            <h4 class="font-bold text-[11px] text-gray-900 leading-tight">Huile Barbe Bio</h4>
                            <p class="text-orange-500 font-black text-[11px] mt-0.5">18.50€</p>
                        </div>
                    </div>
                    <div class="min-w-[140px] space-y-3">
                        <div class="relative h-40 w-full rounded-[1.8rem] overflow-hidden shadow-sm">
                            <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1935&auto=format&fit=crop" class="w-full h-full object-cover">
                            <button class="absolute bottom-3 right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                <span class="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                        <div class="px-1">
                            <h4 class="font-bold text-[11px] text-gray-900 leading-tight">Masque Argile Bio</h4>
                            <p class="text-orange-500 font-black text-[11px] mt-0.5">29.00€</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. Offres Spéciales -->
            <section class="px-5">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-[17px] font-black text-gray-900">Offres Spéciales</h3>
                    <button class="text-primary text-[11px] font-black uppercase tracking-widest">TOUT VOIR</button>
                </div>
                <div class="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 overflow-hidden cursor-pointer active:scale-[0.98] transition-all" onclick="navigateTo('explorer')">
                    <div class="relative h-56 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop" class="w-full h-full object-cover">
                        <div class="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg border border-white/50">
                            <span class="material-symbols-outlined text-[16px] text-primary">star</span>
                            <span class="text-[13px] font-black text-gray-900">4.9</span>
                        </div>
                    </div>
                    <div class="p-6 flex items-center justify-between gap-4">
                        <div class="space-y-1.5 flex-1">
                            <h4 class="text-[17px] font-black text-gray-900 tracking-tight leading-tight">Glow Studio Centre-Ville</h4>
                            <p class="text-[11px] text-gray-400 font-bold uppercase tracking-wider">5 soins esthétiques & bien-être premium</p>
                            <div class="flex items-center gap-1.5 mt-2">
                                <span class="material-symbols-outlined text-[18px] text-primary">location_on</span>
                                <span class="text-[11px] text-gray-500 font-bold">3.8 km • Paris</span>
                            </div>
                        </div>
                        <button class="bg-primary text-white font-black py-4 px-7 rounded-3xl shadow-[0_10px_20px_rgba(244,140,37,0.25)] text-[11px] uppercase tracking-[0.2em] shrink-0">Réserver</button>
                    </div>
                </div>
            </section>

            </section>

            <!-- 5. Expertise du Mois -->
            <section class="space-y-4">
                <div class="px-5 flex items-center justify-between">
                    <h3 class="text-[17px] font-black text-gray-900">Expertise du Mois</h3>
                    <div class="flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                        <span class="material-symbols-outlined text-[10px]">person_check</span> INDÉPENDANT
                    </div>
                </div>
                <div class="px-5">
                    <div class="bg-white rounded-[2.5rem] p-6 shadow-md border border-gray-100 flex items-center gap-5 active:scale-[0.98] transition-all cursor-pointer">
                        <div class="relative w-20 h-20 shrink-0">
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200" class="w-full h-full rounded-full object-cover border-2 border-primary p-0.5">
                            <div class="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-black text-lg text-gray-900 leading-tight">Mélanie V.</h4>
                            <p class="text-[11px] text-primary font-black uppercase tracking-widest mt-1">Spécialiste Coloriste</p>
                            <p class="text-[11px] text-gray-400 font-medium mt-1 leading-relaxed">Expertise en balayage signature et soins profonds à domicile.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 6. Catégories Populaires -->
            <section class="px-5">
                <h3 class="text-[17px] font-black text-gray-900 mb-6">Catégories Populaires</h3>
                <div class="flex justify-between items-center">
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 rounded-full bg-orange-50 text-primary flex items-center justify-center shadow-sm cursor-pointer border border-orange-100/50 active:bg-primary active:text-white transition-all">
                            <span class="material-symbols-outlined text-xl font-black">content_cut</span>
                        </div>
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cheveux</span>
                    </div>
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center shadow-sm cursor-pointer border border-pink-100/50 active:bg-pink-500 active:text-white transition-all">
                            <span class="material-symbols-outlined text-xl font-black">brush</span>
                        </div>
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ongles</span>
                    </div>
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shadow-sm cursor-pointer border border-purple-100/50 active:bg-purple-500 active:text-white transition-all">
                            <span class="material-symbols-outlined text-xl font-black">face_retouching_natural</span>
                        </div>
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maquillage</span>
                    </div>
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm cursor-pointer border border-emerald-100/50 active:bg-emerald-500 active:text-white transition-all">
                            <span class="material-symbols-outlined text-xl font-black">spa</span>
                        </div>
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spa</span>
                    </div>
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm cursor-pointer border border-blue-100/50 active:bg-blue-500 active:text-white transition-all">
                            <span class="material-symbols-outlined text-xl font-black">medication</span>
                        </div>
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Massage</span>
                    </div>
                </div>
            </section>

            <!-- 6. Partenaires Certifiés -->
            <section class="bg-gray-50/50 py-10">
                <div class="px-5 flex items-center justify-between mb-8">
                    <h3 class="text-[17px] font-black text-gray-900">Partenaires Certifiés</h3>
                    <button class="text-primary text-[11px] font-black uppercase tracking-widest">Voir tout</button>
                </div>
                <div class="flex gap-5 overflow-x-auto hide-scrollbar px-5">
                    <div class="min-w-[200px] bg-white rounded-[2.5rem] border border-gray-100 p-8 text-center space-y-5 shadow-sm">
                        <div class="w-28 h-28 mx-auto relative">
                             <div class="absolute inset-0 rounded-full border-[3px] border-primary border-dashed animate-spin-slow"></div>
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200" class="w-full h-full object-cover rounded-full p-1.5">
                        </div>
                        <div>
                            <h4 class="font-black text-[15px] text-gray-900">Sarah Jenkins</h4>
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">MAÎTRE COIFFEUSE</p>
                        </div>
                        <div class="flex items-center justify-center gap-1.5 text-[12px] font-black text-gray-800">
                            <span class="material-symbols-outlined text-[16px] text-primary">star</span>
                            5.0 <span class="text-gray-300 font-bold ml-1 text-[11px]">(142)</span>
                        </div>
                        <button class="w-full py-3.5 bg-orange-50 text-[11px] font-black text-primary rounded-2xl hover:bg-primary hover:text-white transition-all uppercase tracking-widest">Portfolio</button>
                    </div>
                    <div class="min-w-[200px] bg-white rounded-[2.5rem] border border-gray-100 p-8 text-center space-y-5 shadow-sm">
                        <div class="w-28 h-28 mx-auto relative">
                             <div class="absolute inset-0 rounded-full border-[3px] border-primary"></div>
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" class="w-full h-full object-cover rounded-full p-1.5">
                        </div>
                        <div>
                            <h4 class="font-black text-[15px] text-gray-900">Marcus Thorne</h4>
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">BARBER EXPERT</p>
                        </div>
                        <div class="flex items-center justify-center gap-1.5 text-[12px] font-black text-gray-800">
                            <span class="material-symbols-outlined text-[16px] text-primary">star</span>
                            4.8 <span class="text-gray-300 font-bold ml-1 text-[11px]">(98)</span>
                        </div>
                        <button class="w-full py-3.5 bg-orange-50 text-[11px] font-black text-primary rounded-2xl hover:bg-primary hover:text-white transition-all uppercase tracking-widest">Portfolio</button>
                    </div>
                </div>
            </section>

            <!-- 7. Tutoriels Live -->
            <section class="px-5 mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-[17px] font-black text-gray-900 flex items-center gap-2">Tutoriels Live <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></h3>
                    <button class="text-primary text-[11px] font-black uppercase tracking-widest" onclick="navigateTo('live')">Explorer</button>
                </div>
                <div class="flex gap-4 overflow-x-auto hide-scrollbar">
                    <div class="min-w-[260px] space-y-4 cursor-pointer group" onclick="navigateTo('social')">
                        <div class="relative h-80 rounded-[2.5rem] overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071&auto=format&fit=crop" class="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-1000">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <span class="absolute top-5 left-5 bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg">
                                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE
                            </span>
                        </div>
                        <div class="px-2">
                            <h4 class="font-black text-[14px] text-gray-900 leading-tight">Masterclass Contouring</h4>
                            <p class="text-[11px] text-gray-400 mt-1 font-bold">par <span class="text-orange-500">Elena Rossi</span></p>
                        </div>
                    </div>
                    <div class="min-w-[260px] space-y-4 cursor-pointer group">
                        <div class="relative h-80 rounded-[2.5rem] overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <span class="absolute top-5 left-5 bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg">
                                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE
                            </span>
                        </div>
                        <div class="px-2">
                            <h4 class="font-black text-[14px] text-gray-900 leading-tight">Démo HydraFacial 101</h4>
                            <p class="text-[11px] text-gray-400 mt-1 font-bold">par <span class="text-orange-500">SkinCare Hebdo</span></p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 8. Espaces Salon à Louer -->
            <section class="px-5 mb-10">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-[17px] font-black text-gray-900">Espaces Salon à Louer</h3>
                    <button class="text-primary text-[11px] font-black uppercase tracking-widest" onclick="navigateTo('real_estate')">Publier</button>
                </div>
                <div class="bg-white rounded-[2.2rem] p-5 border border-gray-100 shadow-xl shadow-gray-100 flex gap-5 cursor-pointer active:scale-[0.98] transition-all" onclick="navigateTo('real_estate')">
                    <div class="relative w-28 h-28 overflow-hidden rounded-2xl shadow-md shrink-0">
                        <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 flex flex-col justify-center space-y-2">
                        <div class="flex justify-between items-start gap-2">
                            <h4 class="font-black text-[15px] text-gray-900 leading-tight">Fauteuil Luxe - Paris 8e</h4>
                            <span class="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-green-100 shrink-0">Disponible</span>
                        </div>
                        <p class="text-[11px] text-gray-400 font-bold italic">Accès complet services, parking inclus</p>
                        <p class="text-[18px] font-black text-gray-900 italic">800€<span class="text-[11px] font-bold text-gray-400 tracking-tight">/mois</span></p>
                    </div>
                </div>
            </section>

        </div>
    `,
    services: `
        <div class="flex flex-col h-full bg-white animate-in fade-in duration-500">
            <!-- Top Navigation Tabs -->
            <div class="px-5 pt-4 pb-0 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-30">
                <div class="flex gap-1" id="services-tabs">
                    <button onclick="switchServicesTab('styles')" class="tab-btn flex-1 pb-3 border-b-2 border-primary text-[10px] font-black text-primary uppercase tracking-widest" data-tab="styles">Styles</button>
                    <button onclick="switchServicesTab('services_grid')" class="tab-btn flex-1 pb-3 border-b-2 border-transparent text-[10px] font-black text-gray-400 uppercase tracking-widest" data-tab="services_grid">Services</button>
                    <button onclick="switchServicesTab('salons')" class="tab-btn flex-1 pb-3 border-b-2 border-transparent text-[10px] font-black text-gray-400 uppercase tracking-widest" data-tab="salons">Salons</button>
                    <button onclick="switchServicesTab('independants')" class="tab-btn flex-1 pb-3 border-b-2 border-transparent text-[10px] font-black text-gray-400 uppercase tracking-widest" data-tab="independants">Pro</button>
                </div>
            </div>
            <!-- Content Area -->
            <div id="services-tab-content" class="flex-1 overflow-hidden">
                <div class="h-full w-full bg-black snap-y snap-mandatory overflow-y-auto">
                    <div class="relative snap-start flex-shrink-0" style="height:100%"><img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071&auto=format&fit=crop" class="w-full h-full object-cover absolute inset-0"><div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div><div class="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-50"><div class="flex flex-col items-center gap-1"><button class="w-12 h-12 flex items-center justify-center text-white active:scale-90 transition-transform" onclick="this.querySelector('span').style.color='#f48c25'"><span class="material-symbols-outlined text-[30px]" style="font-variation-settings:'FILL' 1">favorite</span></button><span class="text-[10px] font-bold text-white">1.2k</span></div><div class="flex flex-col items-center gap-1"><button onclick="openComments()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]" style="font-variation-settings:'FILL' 1">mode_comment</span></button><span class="text-[10px] font-bold text-white">84</span></div><button onclick="openShare()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">share</span></button><button class="w-14 h-14 bg-primary rounded-2xl flex flex-col items-center justify-center border-2 border-white/20 shadow-xl mt-2 active:scale-90 transition-transform" onclick="navigateTo('ai_camera')"><span class="material-symbols-outlined text-white text-xl">auto_fix_high</span><span class="text-[7px] font-black text-white uppercase tracking-widest mt-0.5">ESSAI IA</span></button></div><div class="absolute left-5 right-20 bottom-10 z-50 space-y-3"><div class="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100" class="w-10 h-10 rounded-full border-2 border-primary object-cover"><div><h4 class="text-white font-black text-sm">Sarah Jenkins <span class="text-white/40 font-normal text-xs">• 2h</span></h4><p class="text-white/60 text-[10px] uppercase tracking-wider">@sarahstyles</p></div></div><p class="text-white text-sm font-medium leading-relaxed">Balayage Cuivré pour l'été ✨ Tons naturels et fondus</p><div class="flex gap-2"><span class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10">Coloration</span><span class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10">Balayage</span></div></div></div>
                    <div class="relative snap-start flex-shrink-0" style="height:100%"><img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop" class="w-full h-full object-cover absolute inset-0"><div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div><div class="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-50"><div class="flex flex-col items-center gap-1"><button class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">favorite</span></button><span class="text-[10px] font-bold text-white">3.4k</span></div><div class="flex flex-col items-center gap-1"><button onclick="openComments()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]" style="font-variation-settings:'FILL' 1">mode_comment</span></button><span class="text-[10px] font-bold text-white">212</span></div><button onclick="openShare()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">share</span></button><button class="w-14 h-14 bg-primary rounded-2xl flex flex-col items-center justify-center border-2 border-white/20 shadow-xl mt-2 active:scale-90" onclick="navigateTo('ai_camera')"><span class="material-symbols-outlined text-white text-xl">auto_fix_high</span><span class="text-[7px] font-black text-white uppercase tracking-widest mt-0.5">ESSAI IA</span></button></div><div class="absolute left-5 right-20 bottom-10 z-50 space-y-3"><div class="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=100" class="w-10 h-10 rounded-full border-2 border-primary object-cover"><div><h4 class="text-white font-black text-sm">Elena Rossi <span class="text-white/40 font-normal text-xs">• 5h</span></h4></div></div><p class="text-white text-sm font-medium">Tutoriel Contouring : débutant → pro en 10 min 💄</p><div class="flex gap-2"><span class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10">Maquillage</span><span class="px-3 py-1 bg-primary/60 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-primary/30">Tendance</span></div></div></div>
                    <div class="relative snap-start flex-shrink-0" style="height:100%"><img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1976&auto=format&fit=crop" class="w-full h-full object-cover absolute inset-0"><div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div><div class="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-50"><div class="flex flex-col items-center gap-1"><button class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">favorite</span></button><span class="text-[10px] font-bold text-white">876</span></div><div class="flex flex-col items-center gap-1"><button onclick="openComments()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]" style="font-variation-settings:'FILL' 1">mode_comment</span></button><span class="text-[10px] font-bold text-white">41</span></div><button onclick="openShare()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">share</span></button></div><div class="absolute left-5 right-20 bottom-10 z-50 space-y-3"><div class="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=100" class="w-10 h-10 rounded-full border-2 border-orange-400 object-cover"><div><h4 class="text-white font-black text-sm">Marie Dumont <span class="text-white/40 font-normal text-xs">• 1j</span></h4></div></div><p class="text-white text-sm font-medium">Routine soin peau grasse en 5 étapes 🌿 #skincare #beauté</p></div></div>
                </div>
            </div>
        </div>
    `,
    ai_assistant: `
        <div class="flex flex-col h-full bg-[#F5F6F8] animate-in fade-in duration-500">
            <!-- Header -->
            <div class="bg-white px-5 pt-8 pb-4 flex items-center gap-4 border-b border-gray-100 shadow-sm shrink-0">
                <div class="relative">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-orange-200">
                        <span class="material-symbols-outlined text-white text-2xl">smart_toy</span>
                    </div>
                    <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></span>
                </div>
                <div class="flex-1">
                    <h2 class="font-black text-[15px] text-gray-900">BeautyAI</h2>
                    <p class="text-[10px] text-green-500 font-bold uppercase tracking-widest">En ligne • Répond en < 1s</p>
                </div>
                <button class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <span class="material-symbols-outlined text-gray-400">more_horiz</span>
                </button>
            </div>

            <!-- Chat Messages -->
            <div class="flex-1 overflow-y-auto hide-scrollbar px-4 py-6 space-y-5" id="ai-chat-messages">
                <!-- Date separator -->
                <div class="flex justify-center"><span class="text-[9px] text-gray-400 font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100">Aujourd'hui</span></div>

                <!-- AI Message 1 -->
                <div class="flex gap-3 items-end">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
                    </div>
                    <div class="max-w-[80%] space-y-1">
                        <div class="bg-white rounded-[1.5rem] rounded-bl-md px-5 py-4 shadow-sm border border-gray-100">
                            <p class="text-[13px] text-gray-800 font-medium leading-relaxed">Bonjour Sophie ! ✨ Je suis votre assistante beauté IA.</p>
                            <p class="text-[13px] text-gray-800 font-medium leading-relaxed mt-2">Je peux vous aider à :</p>
                            <ul class="mt-2 space-y-1.5">
                                <li class="text-[12px] text-gray-600 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></span>Trouver le coiffeur parfait près de vous</li>
                                <li class="text-[12px] text-gray-600 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></span>Analyser votre type de peau ou de cheveux</li>
                                <li class="text-[12px] text-gray-600 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></span>Réserver un rendez-vous automatiquement</li>
                                <li class="text-[12px] text-gray-600 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></span>Recommander des produits adaptés</li>
                            </ul>
                        </div>
                        <p class="text-[9px] text-gray-400 font-bold px-2">14:32</p>
                    </div>
                </div>

                <!-- User Message -->
                <div class="flex gap-3 items-end flex-row-reverse">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100" class="w-8 h-8 rounded-xl object-cover shrink-0">
                    <div class="max-w-[75%] space-y-1">
                        <div class="bg-primary rounded-[1.5rem] rounded-br-md px-5 py-4 shadow-sm shadow-orange-200">
                            <p class="text-[13px] text-white font-medium leading-relaxed">Je cherche un coiffeur spécialisé en colorations naturelles à Paris 11ème</p>
                        </div>
                        <p class="text-[9px] text-gray-400 font-bold px-2 text-right">14:33</p>
                    </div>
                </div>

                <!-- AI Response with action cards -->
                <div class="flex gap-3 items-end">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
                    </div>
                    <div class="max-w-[85%] space-y-3">
                        <div class="bg-white rounded-[1.5rem] rounded-bl-md px-5 py-4 shadow-sm border border-gray-100">
                            <p class="text-[13px] text-gray-800 font-medium leading-relaxed">J'ai trouvé <span class="font-black text-primary">3 coiffeurs</span> parfaits pour vous dans le 11ème ! 🌿</p>
                        </div>
                        <!-- Result Cards -->
                        <div class="space-y-3">
                            <div class="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex gap-4 cursor-pointer active:scale-[0.98] transition-all" onclick="navigateTo('service_detail')">
                                <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=100" class="w-16 h-16 rounded-xl object-cover shrink-0">
                                <div class="flex-1">
                                    <div class="flex justify-between items-start">
                                        <h4 class="font-black text-[13px] text-gray-900">L'Atelier Naturel</h4>
                                        <div class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-[12px]">star</span><span class="text-[11px] font-black">4.9</span></div>
                                    </div>
                                    <p class="text-[10px] text-gray-500 font-medium mt-0.5">0.8 km • Paris 11ème</p>
                                    <div class="flex gap-2 mt-1.5">
                                        <span class="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black rounded-full border border-green-100">Bio Certifié</span>
                                        <span class="px-2 py-0.5 bg-orange-50 text-primary text-[8px] font-black rounded-full border border-orange-100">Dès 65€</span>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex gap-4 cursor-pointer active:scale-[0.98] transition-all">
                                <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=100" class="w-16 h-16 rounded-xl object-cover shrink-0">
                                <div class="flex-1">
                                    <div class="flex justify-between items-start">
                                        <h4 class="font-black text-[13px] text-gray-900">Studio Lumière</h4>
                                        <div class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-[12px]">star</span><span class="text-[11px] font-black">4.7</span></div>
                                    </div>
                                    <p class="text-[10px] text-gray-500 font-medium mt-0.5">1.2 km • Paris 11ème</p>
                                    <div class="flex gap-2 mt-1.5">
                                        <span class="px-2 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-black rounded-full border border-purple-100">Coloration Végétale</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onclick="navigateTo('explorer')" class="w-full py-3 bg-orange-50 text-primary font-black text-[11px] rounded-2xl border border-orange-100 uppercase tracking-widest active:scale-95 transition-all">Voir tous les résultats →</button>
                        <p class="text-[9px] text-gray-400 font-bold px-2">14:33</p>
                    </div>
                </div>

                <!-- Typing indicator (always visible at bottom) -->
                <div class="flex gap-3 items-end" id="typing-indicator" style="display:none!important">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
                    </div>
                    <div class="bg-white rounded-[1.5rem] rounded-bl-md px-5 py-4 shadow-sm border border-gray-100">
                        <div class="flex gap-1.5 items-center">
                            <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay:0ms"></div>
                            <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay:150ms"></div>
                            <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay:300ms"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Chips -->
            <div class="flex gap-2 overflow-x-auto hide-scrollbar px-4 pb-3 shrink-0">
                <button class="shrink-0 px-4 py-2 bg-white text-gray-700 text-[10px] font-black rounded-full border border-gray-200 shadow-sm whitespace-nowrap active:bg-orange-50 active:text-primary transition-all" onclick="sendAIMessage(this, 'Analyse mon type de peau')">✨ Analyse peau</button>
                <button class="shrink-0 px-4 py-2 bg-white text-gray-700 text-[10px] font-black rounded-full border border-gray-200 shadow-sm whitespace-nowrap active:bg-orange-50 active:text-primary transition-all" onclick="sendAIMessage(this, 'Réserve mon coiffeur habituel')">📅 Réserver RDV</button>
                <button class="shrink-0 px-4 py-2 bg-white text-gray-700 text-[10px] font-black rounded-full border border-gray-200 shadow-sm whitespace-nowrap active:bg-orange-50 active:text-primary transition-all" onclick="sendAIMessage(this, 'Recommande des produits pour cheveux secs')">💧 Cheveux secs</button>
                <button class="shrink-0 px-4 py-2 bg-white text-gray-700 text-[10px] font-black rounded-full border border-gray-200 shadow-sm whitespace-nowrap active:bg-orange-50 active:text-primary transition-all" onclick="sendAIMessage(this, 'Quelles tendances beauté en ce moment ?')">🔥 Tendances</button>
            </div>

            <!-- Input Bar -->
            <div class="bg-white px-4 pt-3 pb-8 border-t border-gray-100 shrink-0">
                <div class="flex items-center gap-3">
                    <button class="w-10 h-10 bg-orange-50 text-primary rounded-xl flex items-center justify-center border border-orange-100">
                        <span class="material-symbols-outlined text-xl">photo_camera</span>
                    </button>
                    <div class="flex-1 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex items-center px-4 py-2.5 gap-3">
                        <input type="text" id="ai-input" placeholder="Posez votre question beauté..." class="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-gray-800 placeholder-gray-400" onkeydown="if(event.key==='Enter'){sendAIMessage(null, this.value);this.value=''}">
                        <button class="text-gray-400 active:text-primary transition-colors">
                            <span class="material-symbols-outlined text-[20px]">mic</span>
                        </button>
                    </div>
                    <button class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 active:scale-90 transition-transform" onclick="sendAIMessage(null, document.getElementById('ai-input')?.value || '')">
                        <span class="material-symbols-outlined text-white text-xl">send</span>
                    </button>
                </div>
            </div>
        </div>
    `,
    appointments: `
        <div class="flex flex-col h-full bg-[#F5F6F8] animate-in fade-in duration-500 overflow-y-auto hide-scrollbar pb-28">
            <!-- Header -->
            <div class="bg-white px-5 pt-8 pb-4 sticky top-0 z-30 shadow-sm border-b border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h1 class="text-[22px] font-black text-gray-900 leading-tight">Mes Rendez-vous</h1>
                        <p class="text-[11px] text-gray-400 font-bold">Février 2026</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                            <span class="material-symbols-outlined text-gray-500">tune</span>
                        </button>
                        <button onclick="navigateTo('booking_flow')" class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <span class="material-symbols-outlined text-white">add</span>
                        </button>
                    </div>
                </div>
                <!-- Calendar Strip -->
                <div class="flex gap-2 overflow-x-auto hide-scrollbar">
                    <div class="flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-xl">
                        <span class="text-[9px] font-black text-gray-400 uppercase">Lun</span>
                        <span class="text-[14px] font-black text-gray-400">23</span>
                    </div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-xl bg-primary shadow-lg shadow-orange-200">
                        <span class="text-[9px] font-black text-white/70 uppercase">Mar</span>
                        <span class="text-[14px] font-black text-white">24</span>
                        <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-xl">
                        <span class="text-[9px] font-black text-gray-400 uppercase">Mer</span>
                        <span class="text-[14px] font-black text-gray-700">25</span>
                        <div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    </div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-xl">
                        <span class="text-[9px] font-black text-gray-400 uppercase">Jeu</span>
                        <span class="text-[14px] font-black text-gray-400">26</span>
                    </div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-xl">
                        <span class="text-[9px] font-black text-gray-400 uppercase">Ven</span>
                        <span class="text-[14px] font-black text-gray-700">27</span>
                        <div class="w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
                    </div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-xl">
                        <span class="text-[9px] font-black text-gray-400 uppercase">Sam</span>
                        <span class="text-[14px] font-black text-gray-400">28</span>
                    </div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-xl">
                        <span class="text-[9px] font-black text-gray-400 uppercase">Dim</span>
                        <span class="text-[14px] font-black text-gray-300">1</span>
                    </div>
                </div>
            </div>

                </div>
            </div>

            <div id="appointments-container" class="px-5 py-6 space-y-8">
                <!-- Content injected dynamically by getAppointmentsContent() -->
            </div>
        </div>
    `,
    profile: `
        <div id="profile-container" class="flex flex-col h-full bg-[#F5F6F8] animate-in fade-in duration-500 overflow-y-auto hide-scrollbar pb-28">
            <!-- Content injected by getProfileContent() -->
        </div>
    `,
    social: `
        <div class="h-full bg-black relative overflow-hidden animate-in fade-in duration-700">
            <!-- Top Tabs -->
            <div class="absolute top-0 left-0 right-0 z-50 flex justify-between px-6 pt-6 pb-4 bg-gradient-to-b from-black/60 to-transparent">
                <button class="text-[11px] font-black text-white uppercase tracking-widest border-b-2 border-primary pb-1">Styles</button>
                <button class="text-[11px] font-black text-white/40 uppercase tracking-widest border-b-2 border-transparent pb-1 hover:text-white transition-colors" onclick="navigateTo('services')">Services</button>
                <button class="text-[11px] font-black text-white/40 uppercase tracking-widest border-b-2 border-transparent pb-1 hover:text-white transition-colors">Salons</button>
                <button class="text-[11px] font-black text-white/40 uppercase tracking-widest border-b-2 border-transparent pb-1 hover:text-white transition-colors">Indépendants</button>
            </div>

            <!-- Immersive Feed Container -->
            <div class="h-full w-full overflow-y-auto hide-scrollbar snap-y snap-mandatory bg-black">
                <!-- Feed Item 1 -->
                <div class="relative h-full w-full snap-start flex-shrink-0">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    <!-- Side Actions -->
                    <div class="absolute right-4 bottom-12 flex flex-col items-center gap-8 z-50">
                        <div class="flex flex-col items-center gap-1 group">
                            <button class="w-12 h-12 flex items-center justify-center text-white group-active:scale-95 transition-transform">
                                <span class="material-symbols-outlined text-[32px] fill-current">favorite</span>
                            </button>
                            <span class="text-[10px] font-bold text-white uppercase tracking-widest">1.2k</span>
                        </div>
                        <div class="flex flex-col items-center gap-1 group">
                            <button onclick="openComments()" class="w-12 h-12 flex items-center justify-center text-white group-active:scale-95 transition-transform">
                                <span class="material-symbols-outlined text-[32px] fill-current">mode_comment</span>
                            </button>
                            <span class="text-[10px] font-bold text-white uppercase tracking-widest">84</span>
                        </div>
                        <div class="flex flex-col items-center gap-1 group">
                            <button onclick="openShare()" class="w-12 h-12 flex items-center justify-center text-white group-active:scale-95 transition-transform">
                                <span class="material-symbols-outlined text-[32px] fill-current">share</span>
                            </button>
                            <span class="text-[10px] font-bold text-white uppercase tracking-widest">Partager</span>
                        </div>
                        <!-- ESSAI IA Button -->
                        <button class="w-16 h-16 bg-primary rounded-2xl flex flex-col items-center justify-center border-2 border-white/20 shadow-2xl shadow-primary/40 active:scale-95 transition-transform mt-4">
                            <span class="material-symbols-outlined text-white text-2xl">auto_fix_high</span>
                            <span class="text-[8px] font-black text-white uppercase tracking-widest mt-0.5">ESSAI IA</span>
                        </button>
                    </div>

                    <!-- Bottom Info -->
                    <div class="absolute left-6 right-20 bottom-10 z-50 space-y-4">
                        <div class="flex items-center gap-3" onclick="navigateTo('profile')">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-12 h-12 rounded-full border-2 border-primary p-0.5 shadow-lg">
                            <div>
                                <h4 class="text-white font-black text-sm">Sarah Jenkins <span class="text-white/40 font-bold ml-2">â€¢ 2h</span></h4>
                                <p class="text-white/60 text-[10px] font-bold uppercase tracking-widest">@sarahstyles</p>
                            </div>
                        </div>
                        <p class="text-white text-sm font-medium leading-relaxed">
                            Transformation Balayage Cuivré pour la saison d'été. Tons naturels et...
                        </p>
                        <div class="flex gap-2">
                            <span class="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">Coloration</span>
                            <span class="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">Balayage</span>
                        </div>
                    </div>
                </div>

                <!-- Feed Item 2 -->
                <div class="relative h-full w-full snap-start flex-shrink-0">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <!-- Side Actions (Duplicate) -->
                    <div class="absolute right-4 bottom-12 flex flex-col items-center gap-8 z-50">
                        <button class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[32px] fill-current text-white/40">favorite</span></button>
                        <button onclick="openComments()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[32px] fill-current">mode_comment</span></button>
                        <button onclick="openShare()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[32px] fill-current">share</span></button>
                        <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-2xl"><span class="material-symbols-outlined text-white text-2xl">auto_fix_high</span></div>
                    </div>
                </div>
            </div>
        </div>
    `,
    boutique: `
        <div class="flex flex-col h-full bg-[#F5F6F8] animate-in fade-in duration-500 overflow-y-auto hide-scrollbar pb-24">
            <!-- Header Boutique (Compact & Ergonomique) -->
            <div class="px-5 pt-8 pb-4 space-y-4 bg-white sticky top-0 z-40 border-b border-gray-100/50">
                <div class="flex items-center gap-3">
                    <!-- Search Bar with Integrated AI Filter -->
                    <div class="relative flex-1 group">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                        <input type="text" placeholder="Rechercher sur la boutique..." 
                            class="w-full bg-[#F5F6F8] border-none rounded-2xl py-3.5 pl-11 pr-12 text-[13px] focus:ring-2 focus:ring-primary/20 outline-none placeholder-gray-400 font-medium transition-all">
                        
                        <!-- Mini AI Filter integrated in Search Bar -->
                        <button class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gradient-to-br from-orange-400 to-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-100 active:scale-90 transition-all group/ai">
                            <span class="material-symbols-outlined text-[18px] font-black animate-pulse">auto_awesome</span>
                        </button>
                    </div>

                    <!-- Scanner Button -->
                    <button class="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 active:bg-gray-100 transition-colors">
                        <span class="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                    </button>
                </div>

                <!-- Horizontal Categories -->
                <div class="flex gap-4 overflow-x-auto hide-scrollbar py-2 -mx-5 px-5">
                    <button onclick="toggleSubCategories('soins')" class="flex flex-col items-center gap-2 shrink-0 group">
                        <div id="cat-soins" class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-active:scale-95 transition-all overflow-hidden ring-2 ring-transparent">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover">
                        </div>
                        <span class="text-[9px] font-black text-gray-900 uppercase tracking-widest">Soins</span>
                    </button>
                    <button onclick="toggleSubCategories('makeup')" class="flex flex-col items-center gap-2 shrink-0 group">
                        <div id="cat-makeup" class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-active:scale-95 transition-all overflow-hidden ring-2 ring-transparent">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover">
                        </div>
                        <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Make-up</span>
                    </button>
                    <button onclick="toggleSubCategories('hair')" class="flex flex-col items-center gap-2 shrink-0 group">
                        <div id="cat-hair" class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-active:scale-95 transition-all overflow-hidden ring-2 ring-transparent">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover">
                        </div>
                        <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cheveux</span>
                    </button>
                    <button onclick="toggleSubCategories('parfum')" class="flex flex-col items-center gap-2 shrink-0 group">
                        <div id="cat-parfum" class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-active:scale-95 transition-all overflow-hidden ring-2 ring-transparent">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover">
                        </div>
                        <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Parfums</span>
                    </button>
                    <button class="flex flex-col items-center gap-2 shrink-0 group" onclick="navigateTo('boutique_categories')">
                        <div class="w-14 h-14 rounded-full bg-[#F5F6F8] border border-gray-100 flex items-center justify-center shadow-sm group-active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-gray-400">grid_view</span>
                        </div>
                        <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tout</span>
                    </button>
                </div>

                <!-- Expanded Sub-categories (Static Container managed by JS) -->
                <div id="sub-categories-bar" class="hidden animate-in slide-in-from-top duration-300">
                    <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                        <!-- Sub-category chips will be injected here -->
                    </div>
                </div>
            </div>

            <div class="p-5 space-y-8">
                <!-- Promo Slider Banner [NEW] -->
                <div class="relative w-full h-44 rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-orange-100/20">
                    <div class="absolute inset-0 bg-gradient-to-br from-orange-400 to-primary"></div>
                    <!-- Image content -->
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60">
                    
                    <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                        <span class="bg-white/20 backdrop-blur-md self-start px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 border border-white/30">Exclusivité BeautyBook</span>
                        <h2 class="text-[24px] font-black leading-tight tracking-tight mb-1">Pack Éclat Vitaminé<br><span class="text-orange-200">Edition Limitée</span></h2>
                        <div class="flex items-center gap-4">
                            <p class="text-[32px] font-black">-55%</p>
                            <button class="bg-white text-primary px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">J'en profite</button>
                        </div>
                    </div>

                    <!-- Slider Dots -->
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        <div class="w-4 h-1.5 bg-white rounded-full"></div>
                        <div class="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                        <div class="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    </div>
                </div>

                <!-- Red Flash Sale Banner (Small) -->
                <div class="relative h-20 rounded-[1.8rem] overflow-hidden group cursor-pointer border border-red-50">
                    <div class="absolute inset-0 bg-[#FFF5F5]"></div>
                    <div class="absolute inset-0 flex items-center justify-between px-6">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white">
                                <span class="material-symbols-outlined animate-pulse">bolt</span>
                            </div>
                            <div>
                                <h4 class="text-[12px] font-black text-gray-900 tracking-tight uppercase">Ventes Flash de 12h</h4>
                                <p class="text-[10px] text-red-500 font-bold uppercase tracking-widest">Termine dans 01:24:10</p>
                            </div>
                        </div>
                        <span class="material-symbols-outlined text-gray-300">chevron_right</span>
                    </div>
                </div>

                <!-- Quick Actions Icons -->
                <div class="grid grid-cols-4 gap-4 px-2">
                    <div class="flex flex-col items-center gap-2">
                        <div class="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-primary shadow-sm border border-gray-50"><span class="material-symbols-outlined">local_shipping</span></div>
                        <span class="text-[9px] font-black text-gray-500 uppercase text-center leading-tight">Livraison<br>Rapide</span>
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <div class="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-primary shadow-sm border border-gray-50"><span class="material-symbols-outlined">sell</span></div>
                        <span class="text-[9px] font-black text-gray-500 uppercase text-center leading-tight">Meilleurs<br>Prix</span>
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <div class="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-primary shadow-sm border border-gray-50"><span class="material-symbols-outlined">assignment_return</span></div>
                        <span class="text-[9px] font-black text-gray-500 uppercase text-center leading-tight">Retours<br>Gratuits</span>
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <div class="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-primary shadow-sm border border-gray-50"><span class="material-symbols-outlined">stars</span></div>
                        <span class="text-[9px] font-black text-gray-500 uppercase text-center leading-tight">Top<br>Marques</span>
                    </div>
                </div>

                <!-- Product Grid Header -->
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-[20px] font-black fill-current">bolt</span>
                    <h3 class="text-[17px] font-black text-gray-900 tracking-tight">Recommandations pour vous</h3>
                </div>

                <!-- The Grid (6 items exactly as image) -->
                <div class="grid grid-cols-2 gap-4 pb-12">
                    <!-- Item 1 -->
                    <div class="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group flex flex-col">
                        <div class="relative aspect-square overflow-hidden m-2 rounded-[1.5rem]">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <span class="absolute top-2.5 left-2.5 bg-black py-1 px-2 rounded-lg text-[9px] font-black text-white uppercase tracking-widest leading-none">-60%</span>
                            <button class="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors">
                                <span class="material-symbols-outlined text-[18px]">favorite</span>
                            </button>
                        </div>
                        <div class="px-4 pb-4 flex flex-col flex-1">
                            <h4 class="text-[11px] font-bold text-gray-900 leading-tight h-8 line-clamp-2">Crème Visage Hydratante Bio Vitamine C - Éclat</h4>
                            <div class="flex items-center gap-2 mt-2">
                                <p class="text-[15px] font-black text-gray-900">18,00€</p>
                                <p class="text-[10px] text-gray-300 line-through">45,00€</p>
                            </div>
                            <div class="flex items-center justify-between mt-1 mb-3">
                                <p class="text-[9px] font-bold text-gray-400">2.4k vendus <span class="text-xs ml-1">â˜…</span> <span class="text-black">4.8</span></p>
                            </div>
                            <button onclick="navigateTo('boutique_panier')" class="w-full py-2.5 border border-orange-200 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-orange-50 transition-colors">Ajouter</button>
                        </div>
                    </div>

                    <!-- Item 2 -->
                    <div class="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group flex flex-col">
                        <div class="relative aspect-square overflow-hidden m-2 rounded-[1.5rem]">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <span class="absolute top-2.5 left-2.5 bg-[#F14B32] py-1 px-2 rounded-lg text-[9px] font-black text-white uppercase tracking-widest leading-none">Vente Flash</span>
                        </div>
                        <div class="px-4 pb-4 flex flex-col flex-1">
                            <h4 class="text-[11px] font-bold text-gray-900 leading-tight h-8 line-clamp-2">Essence De Rose Parfum Luxe 50ml - Fragran...</h4>
                            <div class="flex items-center gap-2 mt-2">
                                <p class="text-[15px] font-black text-gray-900">39,99€</p>
                                <p class="text-[10px] text-gray-300 line-through">120€</p>
                            </div>
                            <div class="mt-1 mb-3">
                                <span class="text-[#F14B32] text-[9px] font-black uppercase tracking-widest">Bientôt épuisé</span>
                            </div>
                            <button onclick="navigateTo('boutique_paiement')" class="w-full py-2.5 bg-primary rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all">Acheter</button>
                        </div>
                    </div>

                    <!-- Item 3 -->
                    <div class="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group flex flex-col">
                        <div class="relative aspect-square overflow-hidden m-2 rounded-[1.5rem]">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZjWafTEdQoLLAVZQdcv2YMRATOoGrBEndpLY4ac0hkWQ916zh_1Reqo_aETnJWUUkJOzANZZVDC8QHtJLpBLjuZM3VW9vaITmODnV3G_-o8HbwWogV01tqwnSkBydX5QS1CFeIzoI36BNh_S49j_xAzUN9whIGFOotJ4dylXLH2_PYlCJD6xinW0Jx0GX14uXdYYdRo6GsHPr5PwmSW8aTzhFDSwf681XmGHIwJJTwwFie62YEewFF4TtYqptd4JmLzTchgR2Cv8" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        </div>
                        <div class="px-4 pb-4 flex flex-col flex-1">
                            <h4 class="text-[11px] font-bold text-gray-900 leading-tight h-8 line-clamp-2">Palette Ombres à Paupières Pro Matte - 12 Nuanc...</h4>
                            <div class="flex items-center gap-2 mt-2">
                                <p class="text-[15px] font-black text-gray-900">12,50€</p>
                                <p class="text-[10px] text-gray-300 line-through">32,00€</p>
                            </div>
                            <p class="text-[9px] font-bold text-gray-400 mt-1 mb-3">10k+ vendus</p>
                            <button onclick="navigateTo('boutique_panier')" class="w-full py-2.5 border border-orange-200 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-orange-50 transition-colors">Ajouter</button>
                        </div>
                    </div>

                    <!-- Item 4 -->
                    <div class="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group flex flex-col">
                        <div class="relative aspect-square overflow-hidden m-2 rounded-[1.5rem]">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <span class="absolute top-2.5 left-2.5 bg-orange-500 py-1 px-2 rounded-lg text-[9px] font-black text-white uppercase tracking-widest leading-none">Nouveau</span>
                        </div>
                        <div class="px-4 pb-4 flex flex-col flex-1">
                            <h4 class="text-[11px] font-bold text-gray-900 leading-tight h-8 line-clamp-2">Huile Revitalisante Barbe & Soin Conditionneur...</h4>
                            <div class="flex items-center gap-2 mt-2">
                                <p class="text-[15px] font-black text-gray-900">8,99€</p>
                                <p class="text-[10px] text-gray-300 line-through">24,50€</p>
                            </div>
                            <p class="text-[9px] font-bold text-green-500 mt-1 mb-3">Livraison Gratuite</p>
                            <button onclick="navigateTo('boutique_panier')" class="w-full py-2.5 border border-orange-200 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-orange-50 transition-colors">Ajouter</button>
                        </div>
                    </div>

                    <!-- Item 5 -->
                    <div class="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group flex flex-col">
                        <div class="relative aspect-square overflow-hidden m-2 rounded-[1.5rem]">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZjWafTEdQoLLAVZQdcv2YMRATOoGrBEndpLY4ac0hkWQ916zh_1Reqo_aETnJWUUkJOzANZZVDC8QHtJLpBLjuZM3VW9vaITmODnV3G_-o8HbwWogV01tqwnSkBydX5QS1CFeIzoI36BNh_S49j_xAzUN9whIGFOotJ4dylXLH2_PYlCJD6xinW0Jx0GX14uXdYYdRo6GsHPr5PwmSW8aTzhFDSwf681XmGHIwJJTwwFie62YEewFF4TtYqptd4JmLzTchgR2Cv8" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <span class="absolute top-2.5 left-2.5 bg-neutral-800 py-1 px-2 rounded-lg text-[9px] font-black text-white uppercase tracking-widest leading-none">-50%</span>
                        </div>
                        <div class="px-4 pb-4 flex flex-col flex-1">
                            <h4 class="text-[11px] font-bold text-gray-900 leading-tight h-8 line-clamp-2">Rouge à Lèvres Mat Longue Tenue - Teinte Rouge...</h4>
                            <div class="flex items-center gap-2 mt-2">
                                <p class="text-[15px] font-black text-gray-900">9,50€</p>
                                <p class="text-[10px] text-gray-300 line-through">19,00€</p>
                            </div>
                            <p class="text-[9px] font-bold text-gray-400 mt-1 mb-3">500+ vendus</p>
                            <button onclick="navigateTo('boutique_paiement')" class="w-full py-2.5 bg-primary rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all">Acheter</button>
                        </div>
                    </div>

                    <!-- Item 6 -->
                    <div class="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group flex flex-col">
                        <div class="relative aspect-square overflow-hidden m-2 rounded-[1.5rem]">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        </div>
                        <div class="px-4 pb-4 flex flex-col flex-1">
                            <h4 class="text-[11px] font-bold text-gray-900 leading-tight h-8 line-clamp-2">Sérum Éclat Or 24k - Soin Anti-Ã‚ge Régénérant</h4>
                            <div class="flex items-center gap-2 mt-2">
                                <p class="text-[15px] font-black text-gray-900">24,00€</p>
                            </div>
                            <div class="mt-1 mb-3">
                                <span class="bg-orange-50 text-primary text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Top Vente</span>
                            </div>
                            <button onclick="navigateTo('boutique_panier')" class="w-full py-2.5 border border-orange-200 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-orange-50 transition-colors">Ajouter</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    live: `
        <div class="relative h-full w-full bg-black overflow-hidden animate-in fade-in duration-700">
            <!-- Fullscreen Content (Simulated Video/Image) -->
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZjWafTEdQoLLAVZQdcv2YMRATOoGrBEndpLY4ac0hkWQ916zh_1Reqo_aETnJWUUkJOzANZZVDC8QHtJLpBLjuZM3VW9vaITmODnV3G_-o8HbwWogV01tqwnSkBydX5QS1CFeIzoI36BNh_S49j_xAzUN9whIGFOotJ4dylXLH2_PYlCJD6xinW0Jx0GX14uXdYYdRo6GsHPr5PwmSW8aTzhFDSwf681XmGHIwJJTwwFie62YEewFF4TtYqptd4JmLzTchgR2Cv8" class="absolute inset-0 w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>

            <!-- Top Header Overlay -->
            <div class="absolute top-10 left-0 right-0 px-6 flex items-center justify-between z-50">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqQFemHqkn3T2UClwQ5Y-BMnbC7FRmGHd0XpQmtpwMfJFwDKhHnWxAZYK9cv2BsZppZ22uor9C-m9achGPOV2oVpcvaIrx0HqYnf2Z-CYUcyPXRj2ZBeMxGSARiF_y8BIrNudiMt1EaL7JlCjSEMR1ZJaeY6L0ISnWeiAO_7PDIn118TT5z-GYFYuVMz4VgDcV8eTy5aUX4-Pp32RdG319kTArFLhgYUsLYF5BsXI-RsJTSi_rtb3V5yrbvI2OAlnL_Tb7nSOQuw4" class="w-12 h-12 rounded-full border-2 border-[#f48c25]">
                    </div>
                    <div>
                        <p class="text-[14px] font-bold text-white leading-none">Sarah Jenkins</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="bg-[#f48c25] px-2 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-tight">EN DIRECT</span>
                            <span class="text-[11px] font-bold text-white/90 flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">visibility</span> 1.2k
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button class="bg-[#f48c25] px-6 py-2.5 rounded-full text-[13px] font-bold text-white shadow-lg">Suivre</button>
                    <button onclick="navigateTo('accueil')" class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                        <span class="material-symbols-outlined text-white">close</span>
                    </button>
                </div>
            </div>

            <!-- Chat Overlay -->
            <div class="absolute bottom-[200px] left-6 right-16 space-y-3 z-40">
                <div class="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 animate-in slide-in-from-left duration-500">
                    <p class="text-[12px] font-black text-[#f48c25] mb-1">Emily Davis</p>
                    <p class="text-[13px] font-medium text-white leading-snug">L'éclat de ta peau est incroyable ! âœ¨</p>
                </div>
                <div class="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 animate-in slide-in-from-left duration-500 delay-200">
                    <p class="text-[12px] font-black text-[#f48c25] mb-1">Sarah M.</p>
                    <p class="text-[13px] font-medium text-white leading-snug">C'est quel pinceau ? J'en ai besoin d'un pour l'estompage !</p>
                </div>
                <div class="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 animate-in slide-in-from-left duration-500 delay-300">
                    <p class="text-[12px] font-black text-[#f48c25] mb-1">Jessica L.</p>
                    <p class="text-[13px] font-medium text-white leading-snug">En direct de Londres ! J'adore tes conseils !</p>
                </div>
            </div>

            <!-- Right Side Hearts -->
            <div class="absolute right-6 bottom-[240px] flex flex-col gap-4 opacity-70 z-40">
                <span class="material-symbols-outlined text-[#f48c25] fill-current text-2xl animate-bounce">heart_filled</span>
                <span class="material-symbols-outlined text-[#f48c25] fill-current text-xl">heart_filled</span>
                <span class="material-symbols-outlined text-[#f48c25] fill-current text-lg opacity-50">heart_filled</span>
            </div>

            <!-- Bottom Slider & Interaction -->
            <div class="absolute bottom-6 left-0 right-0 px-6 space-y-6 z-50">
                <!-- Product Card -->
                <div class="flex gap-4 overflow-x-auto hide-scrollbar">
                    <div class="bg-black/40 backdrop-blur-2xl p-3 rounded-[1.5rem] border border-white/10 flex items-center gap-4 min-w-[280px]">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-16 h-16 rounded-xl object-cover">
                        <div class="flex-1">
                            <p class="text-[13px] font-bold text-white leading-tight">Sérum Éclat Hydratant</p>
                            <p class="text-[#f48c25] font-black text-[15px] mt-1">34,00 €</p>
                            <button id="productActionBtn" class="mt-2 w-full py-2 bg-[#f48c25] text-white text-[11px] font-bold rounded-lg shadow-lg">Acheter</button>
                        </div>
                    </div>
                </div>

                <!-- Footer Input -->
                <div class="flex items-center gap-3">
                    <div class="flex-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 px-6 py-4">
                        <input type="text" placeholder="Dire quelque chose..." class="bg-transparent border-none focus:ring-0 text-[14px] font-medium w-full text-white placeholder-white/50 outline-none">
                    </div>
                    <button class="w-14 h-14 bg-[#f48c25] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                        <span class="material-symbols-outlined fill-current text-[28px]">favorite</span>
                    </button>
                    <button class="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/10">
                        <span class="material-symbols-outlined text-[26px]">share</span>
                    </button>
                </div>
            </div>
        </div>
    `,
    real_estate: `
        <div class="flex flex-col h-full bg-[#F9FAFB] animate-in slide-in-from-bottom duration-500 overflow-hidden">
            <!-- Header -->
            <div class="px-6 pt-10 pb-6 space-y-4 bg-white shadow-sm z-30 shrink-0">
                <div class="flex items-center justify-between">
                    <button onclick="navigateTo('accueil')" class="text-gray-400 hover:text-gray-900 transition-colors"><span class="material-symbols-outlined">arrow_back</span></button>
                    <h2 class="text-[13px] font-black uppercase tracking-[0.3em]">Immobilier Pro</h2>
                    <button class="text-primary"><span class="material-symbols-outlined">add_circle</span></button>
                </div>
                
                <!-- Filter Tabs -->
                <div class="flex gap-4 overflow-x-auto hide-scrollbar shrink-0">
                    <button class="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">Locations</button>
                    <button class="px-5 py-2.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-100">Ventes</button>
                    <button class="px-5 py-2.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-100">Partage</button>
                </div>
            </div>

            <!-- Ads List -->
            <div class="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6 pb-24">
                <!-- Ad 1 -->
                <div class="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group cursor-pointer active:scale-[0.98] transition-all">
                    <div class="relative h-48 overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCysFjJwiUgnubPuD4hQk3BPi4Nfq7YXy_M1v0772a747gjGYo1BSnufYe83ZVt6zGQBgFJjpnzV3BYIgvjxp2Xp-WHNaHdIIX_ftD86vUH7MGQ8WmrBirrB67LauNwV-R9hfFNiCH-y4sqB9ocBFLH3EkML198B9pjXXyWAGIz2FEtzrIRAq6-MuTHoaQjE_Ccq5ANAUF2zdF4QO-ZLH7RH8_NCJrU1xM9WMKKAb4yLju82mIWd_EaC0Umk0jdszDvAHkfTKVrEDY" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                        <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                            <span class="text-[12px] font-black text-primary uppercase tracking-widest">Premium</span>
                        </div>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-black text-lg text-gray-900 leading-tight">Poste de coiffure équipé</h4>
                                <p class="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Paris 8ème â€¢ Triangle d'Or</p>
                            </div>
                            <div class="text-right">
                                <p class="text-primary font-black text-xl">650 €</p>
                                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">/mois</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-6 border-t border-gray-50 pt-4">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] text-gray-300">aspect_ratio</span>
                                <span class="text-[11px] font-bold text-gray-600">15mÂ²</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] text-gray-300">chair_alt</span>
                                <span class="text-[11px] font-bold text-gray-600">Équipé</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] text-gray-300">bolt</span>
                                <span class="text-[11px] font-bold text-gray-600">Inclus</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ad 2 -->
                <div class="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group cursor-pointer active:scale-[0.98] transition-all">
                    <div class="relative h-48 overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-black text-lg text-gray-900 leading-tight">Cabine de soins esthétiques</h4>
                                <p class="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Paris 11ème â€¢ Bastille</p>
                            </div>
                            <div class="text-right">
                                <p class="text-primary font-black text-xl">800 €</p>
                                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">/mois</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-6 border-t border-gray-50 pt-4">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] text-gray-300">aspect_ratio</span>
                                <span class="text-[11px] font-bold text-gray-600">12mÂ²</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] text-gray-300">spa</span>
                                <span class="text-[11px] font-bold text-gray-600">Table incluse</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] text-gray-300">wifi</span>
                                <span class="text-[11px] font-bold text-gray-600">Wifi incluse</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    explorer: `
        <div class="h-full bg-white flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <!-- Search Header -->
            <div class="px-6 pt-10 pb-4 space-y-4 sticky top-0 bg-white/90 backdrop-blur-md z-30">
                <div class="flex items-center justify-between">
                    <button onclick="navigateTo('accueil')" class="text-gray-400 hover:text-gray-900 transition-colors"><span class="material-symbols-outlined">arrow_back</span></button>
                    <h2 class="text-[13px] font-black uppercase tracking-[0.3em]">Explorer</h2>
                    <button class="text-primary"><span class="material-symbols-outlined">tune</span></button>
                </div>
                <div class="relative bg-gray-50 rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 shadow-sm">
                     <span class="material-symbols-outlined text-gray-400">search</span>
                     <input type="text" placeholder="Coiffure, Soins, Salons..." class="bg-transparent border-none focus:ring-0 text-sm font-medium flex-1 outline-none">
                </div>
            </div>

            <!-- Categories -->
            <div class="px-6 py-2">
                <div class="flex gap-3 overflow-x-auto hide-scrollbar">
                    <button class="px-5 py-2.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">Tout</button>
                    <button class="px-5 py-2.5 bg-gray-50 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-full border border-gray-100 hover:bg-gray-100 transition-colors">Salons</button>
                    <button class="px-5 py-2.5 bg-gray-50 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-full border border-gray-100 hover:bg-gray-100 transition-colors">Soins</button>
                    <button class="px-5 py-2.5 bg-gray-50 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-full border border-gray-100 hover:bg-gray-100 transition-colors">Spa</button>
                    <button class="px-5 py-2.5 bg-gray-50 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-full border border-gray-100 hover:bg-gray-100 transition-colors">Barbier</button>
                </div>
            </div>

            <!-- Search Results / Map Switch -->
            <div class="flex-1 overflow-y-auto hide-scrollbar px-6 pt-6 space-y-8 pb-24">
                <!-- Map Preview Card -->
                <div class="relative h-48 rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer active:scale-[0.98] transition-all">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqOGc1nJ9d6qET-QonMa5svq3LFFzKxnnquxqpBnioxekgj7sFpOhF4MJc0XjUTstELHvzWdPQKo-oiSafxVaRqnDH6PAoyuq8o0z03kSuhycnkPn7nZusMtqrCRVFkpfGoipshjU_8PMCkE_xr0HLUp_1aKc_7Enj2QOssgaO0DGV0Hyy-5nifbPWtnrgW9LXojDWpvVVFGiZHGMjznLPrRyJeWAOZJQETSUHHlEsmIJEPS7rPhLPzUxql9V118qETWcZ_1TFJHI" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <div class="absolute bottom-6 left-1/2 -translate-x-1/2">
                        <button class="px-6 py-3 bg-white text-gray-900 rounded-full shadow-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                            <span class="material-symbols-outlined text-[18px] text-primary">map</span>
                            Voir sur la carte
                        </button>
                    </div>
                </div>

                <!-- Trending Salons -->
                <div class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-black text-gray-900 tracking-tight">Populaires à proximité</h3>
                        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">12 Résultats</span>
                    </div>

                    <div class="space-y-4">
                        <!-- Result 1 -->
                        <div class="bg-gray-50/50 rounded-[2.5rem] p-4 flex gap-5 border border-gray-100 group cursor-pointer active:scale-[0.98] transition-all" onclick="navigateTo('service_detail')">
                            <div class="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 shadow-sm">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1 space-y-2 py-1">
                                <div class="flex justify-between items-start">
                                    <h4 class="font-black text-gray-900 text-base leading-tight">L'Atelier de Beauté</h4>
                                    <div class="flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[14px] text-primary fill-current">star</span>
                                        <span class="text-[11px] font-black">4.8</span>
                                    </div>
                                </div>
                                <p class="text-[11px] text-gray-500 font-medium">Paris 11ème â€¢ 0.8km</p>
                                <div class="flex gap-2">
                                    <span class="px-3 py-1 bg-white rounded-full text-[9px] font-black text-primary uppercase border border-primary/20 tracking-tighter">Coloration</span>
                                    <span class="px-3 py-1 bg-white rounded-full text-[9px] font-black text-gray-400 uppercase border border-gray-100 tracking-tighter">Soin Bio</span>
                                </div>
                            </div>
                        </div>

                        <!-- Result 2 -->
                        <div class="bg-gray-50/50 rounded-[2.5rem] p-4 flex gap-5 border border-gray-100 group cursor-pointer active:scale-[0.98] transition-all">
                            <div class="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 shadow-sm">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1 space-y-2 py-1">
                                <div class="flex justify-between items-start">
                                    <h4 class="font-black text-gray-900 text-base leading-tight">Studio Lumière</h4>
                                    <div class="flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[14px] text-primary fill-current">star</span>
                                        <span class="text-[11px] font-black">4.9</span>
                                    </div>
                                </div>
                                <p class="text-[11px] text-gray-500 font-medium">Paris 8ème â€¢ 1.2km</p>
                                <div class="flex gap-2">
                                    <span class="px-3 py-1 bg-white rounded-full text-[9px] font-black text-primary uppercase border border-primary/20 tracking-tighter">Spa</span>
                                    <span class="px-3 py-1 bg-white rounded-full text-[9px] font-black text-gray-400 uppercase border border-gray-100 tracking-tighter">Massage</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    loyalty: `
        <div class="p-6 space-y-6 animate-in zoom-in duration-500 text-center">
            <h1 class="text-2xl font-bold">Votre Fidélité</h1>
            <div class="bg-gradient-to-tr from-primary to-orange-400 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div class="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <p class="text-sm opacity-90 uppercase tracking-widest font-bold">Points Totaux</p>
                <p class="text-5xl font-black mt-2">1,250</p>
                <p class="text-xs mt-4 opacity-80">Niveau: Gold Member</p>
            </div>
            <div class="space-y-4 text-left">
                <h3 class="font-bold text-gray-900">Vos récompenses disponibles</h3>
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                         <div class="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-primary">
                             <span class="material-symbols-outlined">redeem</span>
                         </div>
                         <div>
                             <p class="font-bold text-sm">Coupon -10€</p>
                             <p class="text-[10px] text-gray-400">Valable sur tout le salon</p>
                         </div>
                    </div>
                    <button class="bg-primary text-white text-[10px] font-bold px-4 py-2 rounded-full">Utiliser</button>
                </div>
            </div>
        </div>
    `,
    service_detail: `
        <div class="flex flex-col h-full bg-white animate-in slide-in-from-right duration-500">
            <div class="relative h-2/5">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtm64YCOFcF-lPnCLcSxH92-Hi1FuVO9DED_2MvuoycFtK7cI16CMd1mgTuSbH87YKt-x_GdTtOea9JOnBL6Y6I3-XZT3LoiGdqIOho6sDv46OH4ZDQldXs3Bo_CNeqTgKTk0317RSnBYaQreAZDRcw-G2d5XAilCepJ6_yDMCEwhRqOs-oTDc0X3UbUdvVsIsJsXyF3FrW3LaYSl-_yv5G9uRxcOfzCoKSvNudhPPjv3kOM7SjoX-bPPqq-JjYkzFDN3kWQXX5G4" class="w-full h-full object-cover">
                <button class="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg" onclick="navigateTo('boutique')">
                    <span class="material-symbols-outlined text-gray-900">arrow_back</span>
                </button>
            </div>
            <div class="flex-1 p-6 space-y-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Sérum Visage Éclat</h1>
                        <p class="text-xs text-primary font-bold uppercase mt-1">Soin de la peau â€¢ Premium</p>
                    </div>
                    <p class="text-2xl font-bold text-primary">45,00 €</p>
                </div>
                <p class="text-gray-500 text-sm leading-relaxed">
                    Un traitement luxueux formulé pour revitaliser votre peau et lui redonner son éclat naturel. 
                    Utilisé par nos experts en salon, ce sérum contient de la vitamine C pure et des extraits de ginseng.
                </p>
                <div class="pt-6">
                    <button class="w-full bg-primary text-white font-bold py-4 rounded-3xl shadow-xl shadow-orange-200 active:scale-95 transition-transform">Ajouter au panier</button>
                </div>
            </div>
        </div>
    `,
    style_detail: `
        <div class="flex flex-col h-full bg-[#F9FAFB] animate-in slide-in-from-right duration-500 overflow-y-auto hide-scrollbar">
            <div class="relative h-[45vh] w-full shrink-0">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <button onclick="navigateTo('social')" class="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <div class="absolute bottom-8 left-8 space-y-2">
                    <span class="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Style Tendance</span>
                    <h1 class="text-3xl font-black text-white leading-tight">Sunset Ombre Hair</h1>
                    <div class="flex items-center gap-2 text-white/80 text-xs font-bold">
                        <span class="material-symbols-outlined text-[16px]">schedule</span>
                        3.5 - 4 Heures
                    </div>
                </div>
            </div>

            <div class="px-6 py-8 space-y-10">
                <div class="bg-orange-50 rounded-[2.5rem] p-6 border border-orange-100/50 space-y-6">
                    <div class="flex items-start gap-4">
                        <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <span class="material-symbols-outlined text-primary text-3xl">face_6</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-gray-900 text-lg">Filtre AI & Recommandations</h3>
                            <p class="text-[13px] text-gray-500 font-medium">Découvrez si ce style correspond à la forme de votre visage.</p>
                        </div>
                    </div>
                    <button onclick="navigateTo('ai_camera')" class="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        <span class="material-symbols-outlined">auto_fix_high</span>
                        Essayer le Filtre AI
                    </button>
                </div>

                <div class="space-y-4">
                    <h3 class="text-xl font-black text-gray-900">Détails du Style</h3>
                    <p class="text-gray-500 text-sm leading-[1.8] font-medium">
                        Le Sunset Ombre imite les teintes chaudes et radieuses d'un crépuscule d'été...
                    </p>
                </div>

                <div class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-black text-gray-900">Qui propose ce style ?</h3>
                        <button class="text-primary text-[11px] font-black uppercase tracking-widest">Voir tout</button>
                    </div>
                    <div class="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-16 h-16 rounded-2xl object-cover shadow-sm">
                        <div class="flex-1">
                            <h4 class="font-black text-[15px] text-gray-900">Lumière Studio</h4>
                            <p class="text-primary font-black text-sm">Dès 240 €</p>
                        </div>
                    </div>
                </div>
                </button>
            </div>
        </div>
    `,
    style_detail: `
        <div class="h-full bg-white animate-in fade-in duration-500 overflow-y-auto hide-scrollbar">
            <!-- Header Image -->
            <div class="relative h-[60vh] w-full">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
                
                <button onclick="navigateTo('services')" class="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
            </div>

            <!-- Content Area -->
            <div class="px-8 -mt-12 relative z-10 pb-24">
                <div class="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 space-y-8">
                    <!-- Title & Categories -->
                    <div class="space-y-4">
                        <div class="flex gap-2">
                            <span class="px-3 py-1 bg-orange-50 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-orange-100">Coloration</span>
                            <span class="px-3 py-1 bg-gray-50 text-gray-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-gray-100">Tendances 2024</span>
                        </div>
                        <h1 class="text-3xl font-black text-gray-900 leading-tight">Sunset Ombre<br>Hair Reveal</h1>
                    </div>

                    <!-- AI Feature Card (Premium) -->
                    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-6 relative overflow-hidden shadow-xl active:scale-[0.98] transition-all cursor-pointer" onclick="navigateTo('ai_camera')">
                        <div class="relative z-10 flex items-center justify-between">
                            <div class="space-y-1">
                                <span class="bg-primary px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest">Fonctionnalité IA</span>
                                <h3 class="text-white text-lg font-black italic">Essai Virtuel<span class="text-primary italic">.</span></h3>
                                <p class="text-white/60 text-[10px] font-medium">Découvrez ce look sur vous instantanément</p>
                            </div>
                            <div class="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary transition-all">
                                <span class="material-symbols-outlined text-white text-3xl">auto_fix_high</span>
                            </div>
                        </div>
                        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                    </div>

                    <!-- Creator Info -->
                    <div class="flex items-center justify-between pt-4">
                        <div class="flex items-center gap-3">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-14 h-14 rounded-full border-2 border-primary">
                            <div>
                                <h4 class="font-black text-sm text-gray-900">Sarah Jenkins</h4>
                                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Styliste Principal</p>
                            </div>
                        </div>
                        <button class="px-6 py-3 bg-gray-50 text-gray-900 font-black text-[10px] rounded-2xl border border-gray-100 uppercase tracking-widest active:scale-95 transition-all">S'abonner</button>
                    </div>

                    <!-- Detail Text -->
                    <p class="text-gray-500 text-sm leading-relaxed font-medium">
                        Un mélange sophistiqué de tons cuivrés et dorés, parfait pour illuminer le visage pendant la saison estivale. Cette technique utilise un balayage à la main levée pour un résultat naturel et fondu.
                    </p>

                    <!-- CTAs -->
                    <div class="grid grid-cols-2 gap-4 pt-4">
                        <button class="py-4 bg-primary text-white font-black text-[11px] rounded-2xl shadow-xl shadow-orange-100 uppercase tracking-widest active:scale-95 transition-all">Prendre RDV</button>
                        <button class="py-4 bg-white text-gray-900 font-black text-[11px] rounded-2xl border border-gray-100 uppercase tracking-widest active:scale-95 transition-all shadow-sm">Produits</button>
                    </div>
                </div>

                <!-- Related Styles Carousel -->
                <section class="mt-12 space-y-6">
                    <h3 class="text-lg font-black text-gray-900">Inspirations similaires</h3>
                    <div class="flex gap-4 overflow-x-auto hide-scrollbar">
                        <div class="min-w-[140px] h-56 rounded-3xl overflow-hidden shadow-sm relative active:scale-95 transition-all">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZjWafTEdQoLLAVZQdcv2YMRATOoGrBEndpLY4ac0hkWQ916zh_1Reqo_aETnJWUUkJOzANZZVDC8QHtJLpBLjuZM3VW9vaITmODnV3G_-o8HbwWogV01tqwnSkBydX5QS1CFeIzoI36BNh_S49j_xAzUN9whIGFOotJ4dylXLH2_PYlCJD6xinW0Jx0GX14uXdYYdRo6GsHPr5PwmSW8aTzhFDSwf681XmGHIwJJTwwFie62YEewFF4TtYqptd4JmLzTchgR2Cv8" class="w-full h-full object-cover">
                        </div>
                        <div class="min-w-[140px] h-56 rounded-3xl overflow-hidden shadow-sm relative active:scale-95 transition-all">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover">
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `,
    ai_camera: `
        <div class="h-full bg-black relative animate-in fade-in duration-700 overflow-hidden">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover opacity-60 backdrop-blur-[2px]">
            <button onclick="navigateTo('style_detail')" class="absolute top-6 left-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="absolute bottom-12 left-0 right-0 px-8 flex flex-col items-center gap-8">
                <div class="flex items-center gap-8 text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">
                    <button class="text-white border-b-2 border-primary pb-1">Coiffures</button>
                    <button>Couleurs</button>
                </div>
                <button onclick="navigateTo('ai_editor')" class="w-20 h-20 rounded-full border-[5px] border-white flex items-center justify-center p-1.5 active:scale-90 transition-transform">
                    <div class="w-full h-full bg-primary rounded-full"></div>
                </button>
            </div>
        </div>
    `,
    ai_editor: `
        <div class="h-full bg-[#1A1A1A] text-white flex flex-col animate-in fade-in duration-700">
            <div class="px-6 py-6 flex items-center justify-between border-b border-white/5">
                <button onclick="navigateTo('ai_camera')" class="text-white"><span class="material-symbols-outlined">close</span></button>
                <button onclick="navigateTo('ai_publish')" class="px-6 py-2 rounded-full bg-primary text-white text-[11px] font-black uppercase tracking-widest">Suivant</button>
            </div>
            <div class="flex-1 p-4 flex items-center justify-center">
                <div class="relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover">
                    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 flex items-center gap-4">
                        <span class="text-[11px] font-black uppercase tracking-widest">Transformation Magique</span>
                        <div class="flex gap-1.5">
                            <button class="w-8 h-8 rounded-lg bg-white/10 text-[10px] font-black">A</button>
                            <button class="w-8 h-8 rounded-lg bg-primary text-[10px] font-black">B</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    ai_publish: `
        <div class="h-full bg-[#F9FAFB] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto hide-scrollbar">
            <div class="px-6 pt-10 pb-6 flex items-center justify-between">
                <button onclick="navigateTo('ai_editor')" class="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm"><span class="material-symbols-outlined">arrow_back</span></button>
                <h2 class="text-xl font-black text-gray-900 leading-tight">Publication Look AI</h2>
                <div class="w-12"></div>
            </div>
            <div class="px-6 space-y-8 pb-12">
                <div class="flex gap-6">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-28 h-40 object-cover rounded-2xl shadow-lg">
                    <textarea placeholder="Description..." class="flex-1 bg-white border border-gray-100 rounded-[1.5rem] p-4 text-sm font-medium focus:ring-primary focus:border-primary shadow-sm"></textarea>
                </div>
                <button onclick="navigateTo('social')" class="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-[15px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                    Publier maintenant
                </button>
            </div>
        </div>
    `,
    boutique_succes: `
        <div class="flex flex-col h-full bg-white animate-in zoom-in duration-500 overflow-y-auto hide-scrollbar">
            <div class="flex-1 flex flex-col items-center justify-center px-10 text-center space-y-8">
                <div class="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 shadow-xl shadow-green-100 relative">
                    <span class="material-symbols-outlined text-[48px]">check_circle</span>
                    <div class="absolute -inset-4 rounded-full border-2 border-green-100 animate-ping"></div>
                </div>
                <div>
                    <h2 class="text-3xl font-black text-gray-900 tracking-tight">Commande Confirmée !</h2>
                    <p class="text-gray-500 mt-3 text-sm leading-relaxed">Merci pour votre confiance. Votre commande <span class="text-gray-900 font-bold">#BB-8291</span> est en préparation.</p>
                </div>
                
                <div class="bg-gray-50 rounded-[2rem] p-6 w-full space-y-4">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500 font-medium">Date estimée de livraison</span>
                        <span class="text-gray-900 font-black uppercase tracking-tight">28 Fév 2026</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500 font-medium">Mode de livraison</span>
                        <span class="text-gray-900 font-black uppercase tracking-tight">Standard Express</span>
                    </div>
                </div>

                <div class="w-full space-y-4">
                    <button onclick="navigateTo('accueil')" class="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">Retour à l'accueil</button>
                    <button class="w-full py-5 text-gray-400 font-black text-[11px] uppercase tracking-widest">Suivre ma commande</button>
                </div>
            </div>
        </div>
    `,
    boutique_panier: `
        <div class="flex flex-col h-full bg-[#F5F6F8] animate-in slide-in-from-right duration-500 overflow-hidden">
             <!-- Top Status Bar (Protection) -->
            <div class="bg-[#EEF9F1] px-4 py-3 flex items-center justify-between gap-2 shrink-0 border-b border-green-50">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-green-600 text-[16px] font-black">verified_user</span>
                    <span class="text-[10px] font-black text-green-700 uppercase tracking-wider">Paiement sécurisé</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-gray-900 text-[16px] font-black">local_shipping</span>
                    <span class="text-[10px] font-black text-gray-900 uppercase tracking-wider">Livraison gratuite dès 35€</span>
                </div>
            </div>

             <!-- Header -->
            <div class="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                <button onclick="navigateTo('boutique')" class="text-gray-900"><span class="material-symbols-outlined">arrow_back</span></button>
                <div class="flex items-center gap-2">
                    <h2 class="text-[15px] font-black uppercase tracking-widest text-gray-900">Mon Panier</h2>
                    <span class="text-[11px] font-bold text-gray-400">(3 articles)</span>
                </div>
                <button class="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tout supprimer</button>
            </div>

            <div class="flex-1 overflow-y-auto hide-scrollbar">
                <!-- Reservation Timer Bar -->
                <div class="px-5 mt-4">
                    <div class="bg-red-50 rounded-2xl p-4 flex items-center gap-4 border border-red-100">
                        <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                            <span class="material-symbols-outlined text-[24px] animate-pulse">timer</span>
                        </div>
                        <div class="flex-1">
                            <h4 class="text-[12px] font-black text-red-600 tracking-tight leading-none">Vite ! Vos pépites sont réservées pendant 14:30</h4>
                            <p class="text-[10px] text-red-400 font-bold mt-1">Finalisez votre commande maintenant pour ne pas les laisser filer.</p>
                        </div>
                    </div>
                </div>

                <!-- Shipping Progress -->
                <div class="px-5 mt-6 space-y-3">
                    <div class="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-[11px] font-black text-gray-900 uppercase tracking-tight">Livraison Gratuite</span>
                            <span class="text-primary text-[11px] font-black uppercase tracking-tight">Plus que 5,00€</span>
                        </div>
                        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-primary rounded-full transition-all duration-500" style="width: 85%"></div>
                        </div>
                        <p class="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-2">
                             <span class="material-symbols-outlined text-[14px] text-gray-400">info</span>
                             Commandez avant minuit, expédition prioritaire demain
                        </p>
                    </div>
                </div>

                <!-- Cadeau Gratuit Section -->
                <div class="px-5 mt-6">
                    <div class="bg-white rounded-3xl p-4 flex items-center justify-between border border-gray-100 shadow-sm overflow-hidden relative group">
                        <div class="absolute right-0 top-0 w-24 h-full bg-orange-50/50 skew-x-12 translate-x-12"></div>
                        <div class="flex items-center gap-4 relative">
                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#F14B32] shadow-sm border border-orange-50">
                                <span class="material-symbols-outlined text-[28px]">card_giftcard</span>
                            </div>
                            <div>
                                <h4 class="text-[13px] font-black text-gray-900 tracking-tight">Offre Prestige : Votre cadeau exclusif</h4>
                                <p class="text-[10px] text-gray-400 font-bold">Inclus automatiquement dans votre colis</p>
                            </div>
                        </div>
                        <span class="relative text-[10px] font-black text-white bg-primary px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-orange-100">Qualifié</span>
                    </div>
                </div>

                <!-- Select All Control -->
                <div class="px-6 mt-8 flex items-center gap-3">
                    <div class="w-5 h-5 rounded-md bg-primary flex items-center justify-center text-white">
                        <span class="material-symbols-outlined text-[14px] font-black">check</span>
                    </div>
                    <span class="text-[11px] font-black text-gray-900 uppercase tracking-widest">Tout sélectionner (3 articles)</span>
                </div>

                <!-- Items List -->
                <div class="px-5 py-6 space-y-6">
                     <!-- Item 1 -->
                     <div class="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-50 flex flex-col gap-4">
                        <div class="flex gap-4">
                            <div class="w-24 h-24 bg-gray-50 rounded-[1.8rem] overflow-hidden shrink-0 relative">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover">
                                <div class="absolute bottom-0 left-0 right-0 bg-[#F14B32] text-white text-[7px] font-black text-center py-1 uppercase tracking-widest">-60%</div>
                            </div>
                            <div class="flex-1 flex flex-col justify-between">
                                <div class="flex justify-between items-start">
                                    <h4 class="text-[12px] font-black text-gray-900 leading-tight">Crème Visage Hydratante Bio Vitamine C - Éclat Intense</h4>
                                    <button class="text-gray-300"><span class="material-symbols-outlined text-[20px]">delete</span></button>
                                </div>
                                <div class="flex gap-2">
                                    <span class="bg-green-50 text-green-600 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[10px]">leafy_green</span> Formule Bio
                                    </span>
                                    <span class="text-[10px] text-gray-400 font-bold">50ml</span>
                                </div>
                                <div class="flex items-end justify-between mt-2">
                                    <div>
                                        <p class="text-[11px] text-gray-300 line-through">45,00€</p>
                                        <p class="text-[18px] font-black text-gray-900 leading-none">18,00€</p>
                                    </div>
                                    <div class="flex items-center gap-4 bg-gray-50 rounded-full px-3.5 py-1.5 border border-gray-100">
                                        <button class="text-gray-400 text-lg font-bold">â€“</button>
                                        <span class="text-[13px] font-black text-gray-900">1</span>
                                        <button class="text-primary text-lg font-bold">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-orange-50/50 rounded-2xl p-3 border border-orange-100/50">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="material-symbols-outlined text-primary text-[14px]">favorite</span>
                                <span class="text-[10px] font-black text-primary uppercase tracking-widest">Pourquoi vous allez l'adorer</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span class="bg-white text-[9px] text-gray-600 px-3 py-1 rounded-full border border-gray-100 font-bold">Hydratation 24h</span>
                                <span class="bg-white text-[9px] text-gray-600 px-3 py-1 rounded-full border border-gray-100 font-bold">Éclat instantané</span>
                                <span class="bg-white text-[9px] text-gray-600 px-3 py-1 rounded-full border border-gray-100 font-bold">Texture légère</span>
                            </div>
                        </div>
                     </div>

                     <!-- Item 2 -->
                     <div class="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-50 flex flex-col gap-4">
                        <div class="flex gap-4">
                            <div class="w-24 h-24 bg-gray-50 rounded-[1.8rem] overflow-hidden shrink-0 relative flex items-center justify-center">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover">
                                <div class="absolute top-0 left-0 bg-yellow-400 text-white text-[7px] font-black text-center px-2 py-1 uppercase tracking-widest">Best Seller</div>
                            </div>
                            <div class="flex-1 flex flex-col justify-between">
                                <div class="flex justify-between items-start">
                                    <h4 class="text-[12px] font-black text-gray-900 leading-tight">Essence De Rose Parfum Luxe</h4>
                                    <button class="text-gray-300"><span class="material-symbols-outlined text-[20px]">delete</span></button>
                                </div>
                                <div class="flex gap-2">
                                    <span class="bg-purple-50 text-purple-600 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[10px]">auto_awesome</span> Ingrédients Naturels
                                    </span>
                                </div>
                                <div class="flex items-end justify-between mt-2">
                                    <div>
                                        <p class="text-[11px] text-gray-300 line-through">120,00€</p>
                                        <p class="text-[18px] font-black text-gray-900 leading-none">39,99€</p>
                                    </div>
                                    <div class="flex items-center gap-4 bg-gray-50 rounded-full px-3.5 py-1.5 border border-gray-100">
                                        <button class="text-gray-400 text-lg font-bold">â€“</button>
                                        <span class="text-[13px] font-black text-gray-900">1</span>
                                        <button class="text-primary text-lg font-bold">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-orange-50/50 rounded-2xl p-3 border border-orange-100/50">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="material-symbols-outlined text-primary text-[14px]">favorite</span>
                                <span class="text-[10px] font-black text-primary uppercase tracking-widest">Pourquoi vous allez l'adorer</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span class="bg-white text-[9px] text-gray-600 px-3 py-1 rounded-full border border-gray-100 font-bold">Tenue 12h</span>
                                <span class="bg-white text-[9px] text-gray-600 px-3 py-1 rounded-full border border-gray-100 font-bold">Sillage envoûtant</span>
                                <span class="bg-white text-[9px] text-gray-600 px-3 py-1 rounded-full border border-gray-100 font-bold">Sans alcool</span>
                            </div>
                        </div>
                     </div>

                     <!-- Recommendation simple line -->
                     <div class="pt-6">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="h-px bg-gray-200 flex-1"></div>
                            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">VOUS AIMEREZ AUSSI</h3>
                            <div class="h-px bg-gray-200 flex-1"></div>
                        </div>
                        <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                            <div class="min-w-[120px] bg-white rounded-3xl p-2 border border-gray-100 flex flex-col items-center">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full aspect-square object-cover rounded-2xl mb-2">
                                <p class="text-[11px] font-black text-gray-900">8,99€</p>
                            </div>
                            <div class="min-w-[120px] bg-white rounded-3xl p-2 border border-gray-100 flex flex-col items-center">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full aspect-square object-cover rounded-2xl mb-2">
                                <p class="text-[11px] font-black text-gray-900">9,50€</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            <!-- Footer Checkout Summary -->
            <div class="bg-white px-8 pt-6 pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-gray-100 sticky bottom-0 z-40 shrink-0">
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <span class="text-[10px] font-black text-green-500 uppercase tracking-widest block mb-1">Économie: -282,50€</span>
                        <div class="flex items-center gap-2">
                            <span class="text-[11px] font-bold text-gray-400">Total (4 articles)</span>
                        </div>
                    </div>
                    <p class="text-[28px] font-black text-gray-900 tracking-tighter">82.99€</p>
                </div>
                <button onclick="navigateTo('boutique_paiement')" class="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-[15px] uppercase tracking-[0.2em] shadow-xl shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-3">
                    Finaliser ma sélection <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>
        </div>
    `,

    boutique_paiement: `
        <div class="flex flex-col h-full bg-[#F5F6F8] animate-in slide-in-from-right duration-500 overflow-hidden">
            <!-- Header (Fidèle à l'image) -->
            <div class="bg-white px-5 pt-10 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                <button onclick="navigateTo('boutique_panier')" class="text-gray-900"><span class="material-symbols-outlined">arrow_back</span></button>
                <h2 class="text-[17px] font-black text-gray-900">Étape Finale : Votre Commande</h2>
                <button class="text-gray-900"><span class="material-symbols-outlined">more_horiz</span></button>
            </div>

            <div class="flex-1 overflow-y-auto hide-scrollbar pb-32">
                <!-- Stepper Progress (Image Style) -->
                <div class="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-50">
                    <div class="flex items-center gap-2">
                        <div class="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <span class="material-symbols-outlined text-[14px]">check</span>
                        </div>
                        <span class="text-[11px] font-bold text-green-500">Panier</span>
                    </div>
                    <div class="h-px bg-gray-200 w-12 mx-1"></div>
                    <div class="flex items-center gap-2">
                        <div class="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">2</div>
                        <span class="text-[11px] font-black text-orange-500">Paiement</span>
                    </div>
                    <div class="h-px bg-gray-100 w-12 mx-1"></div>
                    <div class="flex items-center gap-2">
                        <div class="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">3</div>
                        <span class="text-[11px] font-bold text-gray-300">Succès</span>
                    </div>
                </div>

                <!-- Green Info Bar -->
                <div class="bg-[#EEF9F1] px-5 py-2.5 flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-green-600 text-[16px]">verified_user</span>
                    <span class="text-[11px] font-bold text-green-700">Protection Totale : Transactions cryptées & sécurisées</span>
                </div>

                <!-- Delivery Address Section -->
                <div class="mt-4 px-4">
                    <div class="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2.5">
                                <span class="material-symbols-outlined text-orange-500 text-[24px]">location_on</span>
                                <h3 class="text-[15px] font-black text-gray-900">Où devons-nous livrer votre bonheur ?</h3>
                            </div>
                            <button class="text-[12px] font-black text-orange-500 uppercase tracking-widest">Modifier</button>
                        </div>
                        <div class="ml-8 space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="text-[14px] font-black text-gray-900">Sophie Martin</span>
                                <span class="bg-blue-50 text-blue-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Domicile</span>
                            </div>
                            <p class="text-[12px] text-gray-500 font-bold leading-relaxed">
                                12 Rue de la République<br>
                                Appt 4B, 3ème étage<br>
                                75001 Paris, France<br>
                                <span class="text-gray-400">+33 6 12 34 56 78</span>
                            </p>
                        </div>
                        <div class="h-px bg-gray-50 my-2"></div>
                        <div class="flex items-center justify-between ml-8">
                            <div class="flex items-center gap-2 text-green-600">
                                <span class="material-symbols-outlined text-[18px]">local_shipping</span>
                                <span class="text-[12px] font-black">Livraison Gratuite</span>
                            </div>
                            <span class="text-[11px] text-gray-400 font-bold tracking-tight uppercase">Livré le 24â€“26 Oct</span>
                        </div>
                    </div>
                </div>

                <!-- Mode de paiement Section -->
                <div class="mt-5 px-4">
                    <div class="bg-white rounded-2xl p-5 shadow-sm space-y-5">
                        <div class="flex items-center gap-2.5">
                            <span class="material-symbols-outlined text-orange-500 text-[24px]">payments</span>
                            <h3 class="text-[15px] font-black text-gray-900">Mode de paiement</h3>
                        </div>
                        <div class="space-y-3">
                            <!-- Card (Selected) -->
                            <div class="p-4 rounded-xl border-2 border-orange-500 bg-white flex items-center justify-between cursor-pointer">
                                <div class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-full border-4 border-orange-500 flex items-center justify-center">
                                        <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <span class="text-[13px] font-black text-gray-900 leading-none">Carte Bancaire</span>
                                            <div class="flex gap-1">
                                                <div class="w-5 h-3 bg-gray-200 rounded-sm"></div>
                                                <div class="w-5 h-3 bg-gray-100 rounded-sm"></div>
                                            </div>
                                        </div>
                                        <p class="text-[10px] text-gray-400 font-bold mt-1.5">â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 4242</p>
                                    </div>
                                </div>
                                <div class="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                                    <span class="material-symbols-outlined text-[14px]">check</span>
                                </div>
                            </div>
                            <!-- Apple Pay -->
                            <div class="p-4 rounded-xl border border-gray-100 bg-white flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                                <div class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-full border-2 border-gray-100"></div>
                                    <span class="text-[13px] font-black text-gray-900 leading-none">Apple Pay</span>
                                </div>
                                <div class="bg-black text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1">Pay</div>
                            </div>
                            <!-- PayPal -->
                            <div class="p-4 rounded-xl border border-gray-100 bg-white flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                                <div class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-full border-2 border-gray-100"></div>
                                    <div>
                                        <span class="text-[13px] font-black text-gray-900 leading-none">PayPal</span>
                                        <p class="text-[9px] text-red-500 font-bold mt-1">Paiement flexible : Option 4x sans frais disponible</p>
                                    </div>
                                </div>
                                <div class="text-[#003087] font-black italic text-[14px]">PayPal</div>
                            </div>
                        </div>
                        <div class="bg-gray-50 rounded-xl p-3.5 flex items-center gap-3">
                            <span class="material-symbols-outlined text-gray-400 text-[18px]">security</span>
                            <p class="text-[10px] text-gray-400 font-bold leading-tight">Vos informations de paiement sont sécurisées.<br>Nous ne stockons pas votre CVV.</p>
                        </div>
                    </div>
                </div>

                <!-- Articles Section -->
                <div class="mt-5 px-4">
                    <div class="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                        <div class="flex items-center gap-2.5">
                            <span class="material-symbols-outlined text-orange-500 text-[24px]">shopping_bag</span>
                            <h3 class="text-[15px] font-black text-gray-900">Articles (2)</h3>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden relative">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover">
                                <span class="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-black px-1 rounded">x1</span>
                            </div>
                            <div class="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden relative">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover">
                                <span class="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-black px-1 rounded">x1</span>
                            </div>
                            <div class="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center">
                                <span class="text-[10px] font-black text-gray-400">Voir tout</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Code Promo Section -->
                <div class="mt-5 px-4">
                    <div class="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-orange-500 text-[24px]">confirmation_number</span>
                            <span class="text-[14px] font-black text-gray-900">Code Promo</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[12px] font-bold text-gray-400">Aucun</span>
                            <span class="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                        </div>
                    </div>
                </div>

                <!-- Récapitulatif Section -->
                <div class="mt-5 px-4">
                    <div class="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 class="text-[15px] font-black text-gray-900 tracking-tight">Récapitulatif</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center text-[13px] font-bold text-gray-400">
                                <span>Sous-total (2 articles)</span>
                                <span class="text-gray-900">57,99 €</span>
                            </div>
                            <div class="flex justify-between items-center text-[13px] font-bold text-red-500">
                                <span>Remise Flash</span>
                                <span>-28,50 €</span>
                            </div>
                            <div class="flex justify-between items-center text-[13px] font-bold text-green-600">
                                <span>Livraison</span>
                                <span>Gratuite</span>
                            </div>
                        </div>
                        <div class="h-px bg-gray-50 my-1"></div>
                        <div class="flex justify-between items-end">
                            <span class="text-[15px] font-black text-gray-900 uppercase tracking-widest">Total</span>
                            <div class="text-right">
                                <div class="flex items-center justify-end gap-2 leading-none">
                                    <p class="text-2xl font-black text-orange-500 tracking-tight">29.49 €</p>
                                </div>
                                <p class="text-[10px] text-gray-300 font-bold line-through mt-0.5">165,00 €</p>
                                <p class="text-[9px] text-gray-400 font-bold mt-1">Taxes incluses si applicable</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer (Confirmer le paiement) -->
            <div class="bg-white px-8 pt-4 pb-12 shadow-[0_-15px_30px_rgba(0,0,0,0.03)] border-t border-gray-100 sticky bottom-0 z-50 shrink-0">
                <button onclick="navigateTo('boutique_succes')" class="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-black text-[15px] uppercase tracking-[0.2em] shadow-xl shadow-orange-100 active:scale-95 transition-all">
                    Valider & Payer en toute sécurité
                </button>
            </div>
        </div>
    `,

    boutique_succes: `
        <div class="flex flex-col h-full bg-white animate-in zoom-in duration-500 overflow-y-auto hide-scrollbar">
            <!-- Top Spacing -->
            <div class="pt-20 px-10 flex flex-col items-center">
                <!-- Success icon (Image 4 format) -->
                <div class="w-24 h-24 rounded-full bg-[#EEF9F1] flex items-center justify-center mb-8">
                    <div class="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-100">
                        <span class="material-symbols-outlined text-[32px] font-black">check</span>
                    </div>
                </div>

                <h2 class="text-[28px] font-black text-gray-900 mb-4 tracking-tight leading-tight">C'est officiel ! Votre commande est validée âœ¨</h2>
                <p class="text-[14px] text-gray-500 font-bold leading-relaxed mb-10 text-center px-4">
                    Préparez-vous à briller ! Nous préparons votre colis avec le plus grand soin.
                </p>

                <!-- Order Info Card (Image 4 format) -->
                <div class="w-full bg-[#F5F6F8] rounded-[2.5rem] p-8 space-y-6 mb-10 border border-gray-50/50">
                    <div class="flex justify-between items-center">
                        <span class="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">NÂ° de commande</span>
                        <span class="text-[14px] font-black text-gray-900">#BB-892039</span>
                    </div>
                    <div class="h-px bg-gray-200/60"></div>
                    <div class="flex justify-between items-center text-[12px] font-black uppercase tracking-widest text-gray-400">
                        <span>Livraison estimée</span>
                        <span class="text-[14px] font-black text-orange-500">12 - 14 Octobre</span>
                    </div>
                </div>

                <button onclick="navigateTo('boutique')" class="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-black text-[15px] uppercase tracking-[0.2em] shadow-xl shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-3">
                    Découvrir d'autres pépites
                    <span class="material-symbols-outlined font-black">arrow_forward</span>
                </button>
            </div>

            <!-- Recommendations (Image 4 format) -->
            <div class="mt-12 px-6 pb-20">
                <div class="flex items-center gap-3 mb-8">
                    <span class="material-symbols-outlined text-orange-500">thumb_up</span>
                    <h3 class="text-[18px] font-black text-gray-900 tracking-tight">Vous aimerez aussi</h3>
                </div>

                <div class="grid grid-cols-2 gap-x-4 gap-y-10">
                    <!-- Product 1 -->
                    <div class="flex flex-col gap-3 group">
                        <div class="relative aspect-[3/4] bg-gray-50 rounded-[2rem] overflow-hidden shadow-sm">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover">
                            <span class="absolute top-3 left-3 bg-[#F14B32] text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">-40%</span>
                            <button class="absolute bottom-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 shadow-sm active:scale-90 transition-all">
                                <span class="material-symbols-outlined text-[18px]">favorite</span>
                            </button>
                        </div>
                        <div class="px-2">
                            <h4 class="text-[11px] font-black text-gray-900 leading-tight mb-1">Kit Pinceaux Maquillage Pro - 12 Pièces Soft Touch</h4>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[14px] font-black text-gray-900">14,99€</span>
                                <span class="text-[10px] text-gray-300 line-through">24,99€</span>
                            </div>
                            <div class="flex items-center gap-1.5 mb-3">
                                <span class="text-[9px] text-gray-400 font-bold tracking-tight">350+ vendus</span>
                                <div class="flex items-center gap-0.5 text-yellow-500">
                                    <span class="material-symbols-outlined text-[10px] fill-current">star</span>
                                    <span class="text-[9px] font-black">4.9</span>
                                </div>
                            </div>
                            <button class="w-full py-2.5 rounded-full border border-orange-500 text-orange-500 text-[10px] font-black uppercase tracking-widest active:bg-orange-50 transition-all">Ajouter</button>
                        </div>
                    </div>

                    <!-- Product 2 -->
                    <div class="flex flex-col gap-3 group">
                        <div class="relative aspect-[3/4] bg-gray-50 rounded-[2rem] overflow-hidden shadow-sm">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover">
                            <span class="absolute top-3 left-3 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Populaire</span>
                        </div>
                        <div class="px-2">
                            <h4 class="text-[11px] font-black text-gray-900 leading-tight mb-1">Masque Capillaire Réparateur Kératine</h4>
                            <div class="flex flex-col mb-1">
                                <span class="text-[14px] font-black text-gray-900">19,50€</span>
                                <span class="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded self-start mt-1">Coup de cÅ“ur</span>
                            </div>
                            <button class="w-full py-2.5 rounded-full border border-orange-500 text-orange-500 text-[10px] font-black uppercase tracking-widest active:bg-orange-50 transition-all mt-3">Ajouter</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    boutique_categories: `
        <div class="flex flex-col h-full bg-white animate-in slide-in-from-bottom duration-500 overflow-hidden">
            <!-- Search Header -->
            <div class="px-5 pt-8 pb-4 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
                <button onclick="navigateTo('boutique')" class="text-gray-900"><span class="material-symbols-outlined">arrow_back</span></button>
                <div class="relative flex-1">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input type="text" placeholder="Rechercher des catégories..." class="w-full bg-[#F5F6F8] border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none placeholder-gray-400 font-medium">
                </div>
            </div>

            <div class="flex flex-1 overflow-hidden">
                <!-- Left Sidebar (TEMU Style) -->
                <div class="w-24 bg-[#F5F6F8] overflow-y-auto hide-scrollbar shrink-0">
                    <div class="flex flex-col">
                        <button class="py-6 px-2 text-center text-primary bg-white border-l-4 border-primary transition-all">
                            <span class="text-[10px] font-black uppercase tracking-widest leading-tight block">Pour vous</span>
                        </button>
                        <button class="py-6 px-2 text-center text-gray-500 hover:text-gray-900 transition-all">
                            <span class="text-[10px] font-black uppercase tracking-widest leading-tight block">Soins Visage</span>
                        </button>
                        <button class="py-6 px-2 text-center text-gray-500 hover:text-gray-900 transition-all">
                            <span class="text-[10px] font-black uppercase tracking-widest leading-tight block">Maquillage</span>
                        </button>
                        <button class="py-6 px-2 text-center text-gray-500 hover:text-gray-900 transition-all">
                            <span class="text-[10px] font-black uppercase tracking-widest leading-tight block">Cheveux</span>
                        </button>
                        <button class="py-6 px-2 text-center text-gray-500 hover:text-gray-900 transition-all">
                            <span class="text-[10px] font-black uppercase tracking-widest leading-tight block">Parfums</span>
                        </button>
                        <button class="py-6 px-2 text-center text-gray-500 hover:text-gray-900 transition-all">
                            <span class="text-[10px] font-black uppercase tracking-widest leading-tight block">Accessoires</span>
                        </button>
                        <button class="py-6 px-2 text-center text-gray-500 hover:text-gray-900 transition-all">
                            <span class="text-[10px] font-black uppercase tracking-widest leading-tight block">Corps & Bain</span>
                        </button>
                        <button class="py-6 px-2 text-center text-gray-500 hover:text-gray-900 transition-all">
                            <span class="text-[10px] font-black uppercase tracking-widest leading-tight block">Solaire</span>
                        </button>
                    </div>
                </div>

                <!-- Right Content (TEMU Style Grid) -->
                <div class="flex-1 bg-white overflow-y-auto hide-scrollbar p-5">
                    <div class="space-y-8">
                        <!-- Best Sellers Section -->
                        <section>
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-[14px] font-black text-gray-900 uppercase tracking-widest">Meilleures ventes</h3>
                                <span class="text-[10px] font-black text-primary uppercase tracking-widest">Voir tout</span>
                            </div>
                            <div class="grid grid-cols-3 gap-y-6 gap-x-2">
                                <div class="flex flex-col items-center gap-2 group cursor-pointer" onclick="navigateTo('boutique')">
                                    <div class="w-16 h-16 bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-50 p-1 group-active:scale-90 transition-transform">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover rounded-full">
                                    </div>
                                    <span class="text-[9px] font-bold text-gray-900 text-center leading-tight">Sérums</span>
                                </div>
                                <div class="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div class="w-16 h-16 bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-50 p-1 group-active:scale-90 transition-transform">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover rounded-full">
                                    </div>
                                    <span class="text-[9px] font-bold text-gray-900 text-center leading-tight">Rouge à lèvres</span>
                                </div>
                                <div class="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div class="w-16 h-16 bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-50 p-1 group-active:scale-90 transition-transform">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover rounded-full">
                                    </div>
                                    <span class="text-[9px] font-bold text-gray-900 text-center leading-tight">Palettes</span>
                                </div>
                            </div>
                        </section>

                        <!-- Sub-categories Grid -->
                        <section>
                            <h3 class="text-[14px] font-black text-gray-900 uppercase tracking-widest mb-6">Soins Visage</h3>
                            <div class="grid grid-cols-3 gap-y-6 gap-x-2">
                                <div class="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div class="w-16 h-16 bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-50 p-1 group-active:scale-90 transition-transform">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover rounded-full">
                                    </div>
                                    <span class="text-[9px] font-bold text-gray-900 text-center leading-tight">Nettoyants</span>
                                </div>
                                <div class="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div class="w-16 h-16 bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-50 p-1 group-active:scale-90 transition-transform">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover rounded-full">
                                    </div>
                                    <span class="text-[9px] font-bold text-gray-900 text-center leading-tight">Masques</span>
                                </div>
                                <div class="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div class="w-16 h-16 bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-100 p-1 group-active:scale-90 transition-transform">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover rounded-full">
                                    </div>
                                    <span class="text-[9px] font-bold text-gray-900 text-center leading-tight">Hydratants</span>
                                </div>
                                <div class="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div class="w-16 h-16 bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-100 p-1 group-active:scale-90 transition-transform">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover rounded-full">
                                    </div>
                                    <span class="text-[9px] font-bold text-gray-900 text-center leading-tight">Huiles</span>
                                </div>
                                <div class="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div class="w-16 h-16 bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-100 p-1 group-active:scale-90 transition-transform">
                                         <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover rounded-full">
                                    </div>
                                    <span class="text-[9px] font-bold text-gray-900 text-center leading-tight">Gommages</span>
                                </div>
                                <div class="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div class="w-16 h-16 bg-[#F5F6F8] rounded-full overflow-hidden border border-gray-100 p-1 group-active:scale-90 transition-transform">
                                         <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover rounded-full">
                                    </div>
                                    <span class="text-[9px] font-bold text-gray-900 text-center leading-tight">Accessoires</span>
                                </div>
                            </div>
                        </section>
            </div>
        </div>
    `,
};

// ═══════════════════════════════════════════════
//  NEW SCREENS — added to SCREENS object
// ═══════════════════════════════════════════════
SCREENS.loyalty = `
        <div class="flex flex-col h-full bg-[#F5F6F8] animate-in fade-in duration-500 overflow-y-auto hide-scrollbar pb-28">
        <!-- Header -->
        <div class="bg-white px-5 pt-8 pb-5 flex items-center gap-4 border-b border-gray-100 shadow-sm">
            <button onclick="navigateTo('profile')" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100"><span class="material-symbols-outlined text-gray-500">arrow_back</span></button>
            <div class="flex-1"><h2 class="font-black text-[17px] text-gray-900">Programme Fidélité</h2><p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">BeautyBook Gold ✦</p></div>
        </div>
        <div class="px-5 py-6 space-y-6">
            <!-- Gold Card -->
            <div class="relative bg-gradient-to-br from-amber-400 via-orange-400 to-primary rounded-[2rem] p-7 overflow-hidden shadow-2xl shadow-orange-200">
                <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div class="relative z-10 space-y-5">
                    <div class="flex justify-between items-center">
                        <div><p class="text-white/60 text-[10px] font-black uppercase tracking-widest">Sophie Martin</p><p class="text-white text-3xl font-black tracking-tight mt-0.5">1,250 pts</p></div>
                        <div class="bg-white/20 border border-white/30 rounded-2xl px-4 py-2 backdrop-blur-md"><p class="text-white font-black text-lg">Gold ✦</p></div>
                    </div>
                    <div>
                        <div class="flex justify-between mb-1.5"><span class="text-white/60 text-[9px] font-black uppercase tracking-widest">Vers Platinum</span><span class="text-white text-[9px] font-black">+750 pts</span></div>
                        <div class="h-2.5 bg-white/20 rounded-full overflow-hidden"><div class="h-full bg-white rounded-full" style="width:62%"></div></div>
                    </div>
                </div>
            </div>
            <!-- Level Progress -->
            <div class="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100">
                <h3 class="font-black text-[13px] text-gray-900 uppercase tracking-widest mb-4">Votre Progression</h3>
                <div class="flex justify-between items-center">
                    <div class="text-center"><div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1"><span class="text-sm">🥈</span></div><p class="text-[9px] font-black text-gray-400">Silver</p><p class="text-[8px] text-gray-300">0 pt</p></div>
                    <div class="flex-1 h-1 bg-primary mx-3"></div>
                    <div class="text-center"><div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-1 ring-2 ring-amber-400"><span class="text-lg">🥇</span></div><p class="text-[9px] font-black text-amber-500">Gold</p><p class="text-[8px] text-gray-400">1000 pts</p></div>
                    <div class="flex-1 h-1 bg-gray-100 mx-3"></div>
                    <div class="text-center"><div class="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-1"><span class="text-sm">💎</span></div><p class="text-[9px] font-black text-gray-300">Platinum</p><p class="text-[8px] text-gray-300">2000 pts</p></div>
                </div>
            </div>
            <!-- Rewards Catalog -->
            <div class="space-y-3">
                <h3 class="font-black text-[13px] text-gray-900 uppercase tracking-widest">Récompenses disponibles</h3>
                <div class="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div class="flex items-center gap-4"><div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center"><span class="material-symbols-outlined text-primary">redeem</span></div><div><p class="font-black text-[14px] text-gray-900">Coupon -10€</p><p class="text-[10px] text-gray-400 font-bold">Valable sur tous les services · 500 pts</p></div></div>
                    <button class="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg shadow-orange-100 active:scale-95 transition-all">Échanger</button>
                </div>
                <div class="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div class="flex items-center gap-4"><div class="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center"><span class="material-symbols-outlined text-purple-500">spa</span></div><div><p class="font-black text-[14px] text-gray-900">Soin Gratuit</p><p class="text-[10px] text-gray-400 font-bold">Manucure ou Soin Visage · 800 pts</p></div></div>
                    <button class="bg-gray-100 text-gray-400 text-[10px] font-black px-4 py-2 rounded-full">Bientôt</button>
                </div>
                <div class="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div class="flex items-center gap-4"><div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center"><span class="material-symbols-outlined text-green-500">card_giftcard</span></div><div><p class="font-black text-[14px] text-gray-900">Livraison Offerte</p><p class="text-[10px] text-gray-400 font-bold">Boutique complète · 200 pts</p></div></div>
                    <button class="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg shadow-orange-100 active:scale-95 transition-all">Échanger</button>
                </div>
            </div>
            <!-- Points History -->
            <div class="space-y-3">
                <h3 class="font-black text-[13px] text-gray-900 uppercase tracking-widest">Historique des Points</h3>
                <div class="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm space-y-4">
                    <div class="flex justify-between items-center"><div><p class="font-black text-[13px] text-gray-900">Coupe & Brushing</p><p class="text-[10px] text-gray-400 font-bold">24 Fév 2026</p></div><span class="font-black text-green-500 text-[14px]">+50 pts</span></div>
                    <div class="h-px bg-gray-100"></div>
                    <div class="flex justify-between items-center"><div><p class="font-black text-[13px] text-gray-900">Achat Boutique</p><p class="text-[10px] text-gray-400 font-bold">10 Fév 2026</p></div><span class="font-black text-green-500 text-[14px]">+82 pts</span></div>
                    <div class="h-px bg-gray-100"></div>
                    <div class="flex justify-between items-center"><div><p class="font-black text-[13px] text-gray-900">Coupon utilisé</p><p class="text-[10px] text-gray-400 font-bold">28 Jan 2026</p></div><span class="font-black text-red-400 text-[14px]">-500 pts</span></div>
                </div>
            </div>
            <!-- Referral -->
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-6 space-y-4">
                <div class="flex items-center gap-3"><span class="material-symbols-outlined text-primary text-2xl">group_add</span><div><h3 class="font-black text-white text-[15px]">Parrainez vos amies</h3><p class="text-white/50 text-[11px] font-medium">+200 pts pour vous & +100 pts pour elles</p></div></div>
                <div class="bg-white/10 rounded-2xl px-5 py-3.5 flex justify-between items-center border border-white/10">
                    <span class="font-black text-white tracking-[0.3em] text-[15px]">SOPHIE2026</span>
                    <button class="text-primary font-black text-[11px] uppercase tracking-widest">Copier</button>
                </div>
            </div>
        </div>
    </div >
    `;

SCREENS.notifications = `
    <div class="flex flex-col h-full bg-[#F5F6F8] animate-in fade-in duration-500 overflow-y-auto hide-scrollbar pb-28">
        <div class="bg-white px-5 pt-8 pb-4 flex items-center gap-4 border-b border-gray-100 shadow-sm sticky top-0 z-30">
            <button onclick="navigateTo('accueil')" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100"><span class="material-symbols-outlined text-gray-500">arrow_back</span></button>
            <h2 class="flex-1 font-black text-[17px] text-gray-900">Notifications</h2>
            <button class="text-[11px] font-black text-primary uppercase tracking-widest">Tout lire</button>
        </div>
        <div class="px-5 py-5 space-y-3">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aujourd'hui</p>
            <div class="bg-white rounded-[2rem] p-5 border-l-4 border-primary shadow-sm flex gap-4">
                <div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-primary text-xl">calendar_month</span></div>
                <div class="flex-1"><p class="font-black text-[13px] text-gray-900">RDV demain à 14h30</p><p class="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5">Coupe & Brushing avec Claire Dubois à L'Atelier de Beauté. N'oubliez pas !</p><p class="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Il y a 1h</p></div>
            </div>
            <div class="bg-white rounded-[2rem] p-5 border-l-4 border-green-400 shadow-sm flex gap-4">
                <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-green-500 text-xl">local_shipping</span></div>
                <div class="flex-1"><p class="font-black text-[13px] text-gray-900">Commande expédiée !</p><p class="text-[11px] text-gray-500 font-medium mt-0.5">Votre commande #BB-892039 est en route. Livraison estimée : 26 fév.</p><p class="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Il y a 3h</p></div>
            </div>
            <div class="bg-white rounded-[2rem] p-5 border-l-4 border-amber-400 shadow-sm flex gap-4">
                <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-amber-500 text-xl">stars</span></div>
                <div class="flex-1"><p class="font-black text-[13px] text-gray-900">+50 points de fidélité !</p><p class="text-[11px] text-gray-500 font-medium mt-0.5">Votre RDV du 24 fév vous a rapporté 50 pts. Niveau Gold maintenu 👑</p><p class="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Il y a 5h</p></div>
            </div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">Cette semaine</p>
            <div class="bg-white/60 rounded-[2rem] p-5 shadow-sm flex gap-4">
                <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-gray-400 text-xl">sell</span></div>
                <div class="flex-1"><p class="font-black text-[13px] text-gray-600">Flash Sale -55% ce weekend</p><p class="text-[11px] text-gray-400 font-medium mt-0.5">Pack Éclat Vitaminé edition limitée disponible jusqu'au 25 fév seulement</p><p class="text-[9px] text-gray-300 font-bold mt-2 uppercase tracking-widest">Lun 23 fév</p></div>
            </div>
            <div class="bg-white/60 rounded-[2rem] p-5 shadow-sm flex gap-4">
                <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-gray-400 text-xl">live_tv</span></div>
                <div class="flex-1"><p class="font-black text-[13px] text-gray-600">Sarah Jenkins est en LIVE !</p><p class="text-[11px] text-gray-400 font-medium mt-0.5">Tutoriel maquillage tendance printemps avec 1.2k spectateurs</p><p class="text-[9px] text-gray-300 font-bold mt-2 uppercase tracking-widest">Sam 22 fév</p></div>
            </div>
        </div>
    </div >
    `;

SCREENS.booking_flow = `
    <div class="flex flex-col h-full bg-[#F5F6F8] animate-in slide-in-from-bottom duration-500 overflow-y-auto hide-scrollbar pb-28">
        <!-- Header -->
        <div class="bg-white px-5 pt-8 pb-4 flex items-center gap-4 border-b border-gray-100 shadow-sm sticky top-0 z-30">
            <button onclick="navigateTo('appointments')" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100"><span class="material-symbols-outlined text-gray-500">close</span></button>
            <div class="flex-1"><h2 class="font-black text-[17px] text-gray-900">Nouvelle Réservation</h2></div>
        </div>
        <!--Steps Progress-->
        <div class="bg-white px-6 py-3 flex items-center gap-2 border-b border-gray-100">
            <div class="flex items-center gap-2"><div class="w-6 h-6 bg-primary rounded-full text-white flex items-center justify-center text-[11px] font-black">1</div><span class="text-[11px] font-black text-primary">Service</span></div>
            <div class="flex-1 h-px bg-gray-200 mx-1"></div>
            <div class="flex items-center gap-2"><div class="w-6 h-6 bg-gray-200 rounded-full text-gray-400 flex items-center justify-center text-[11px] font-black">2</div><span class="text-[11px] font-black text-gray-300">Date</span></div>
            <div class="flex-1 h-px bg-gray-200 mx-1"></div>
            <div class="flex items-center gap-2"><div class="w-6 h-6 bg-gray-200 rounded-full text-gray-400 flex items-center justify-center text-[11px] font-black">3</div><span class="text-[11px] font-black text-gray-300">Confirmer</span></div>
        </div>
        <div class="px-5 py-6 space-y-6">
            <!-- Salon -->
            <div class="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                <div class="relative h-32"><img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=400" class="w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div><div class="absolute bottom-4 left-5"><h3 class="font-black text-white text-[15px]">L'Atelier de Beauté</h3><p class="text-white/70 text-[10px] font-bold">Paris 11ème · 0.8 km · ★ 4.9</p></div></div>
            </div>
            <!-- Services -->
            <div class="space-y-3">
                <h3 class="font-black text-[13px] text-gray-900 uppercase tracking-widest">Choisir un Service</h3>
                <div class="space-y-3">
                    <div class="bg-white rounded-2xl p-4 border-2 border-primary shadow-sm flex justify-between items-center cursor-pointer"><div><p class="font-black text-[14px] text-gray-900">Coupe & Brushing</p><p class="text-[11px] text-gray-500 font-medium">1h · Claire Dubois</p></div><div class="text-right"><p class="font-black text-primary text-[15px]">45€</p><div class="w-5 h-5 bg-primary rounded-full flex items-center justify-center ml-auto mt-1"><span class="material-symbols-outlined text-white text-[12px]">check</span></div></div></div>
                    <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer active:bg-orange-50 transition-all"><div><p class="font-black text-[14px] text-gray-900">Coloration Végétale</p><p class="text-[11px] text-gray-500 font-medium">2h30 · Elena Rossi</p></div><div class="text-right"><p class="font-black text-gray-900 text-[15px]">95€</p><div class="w-5 h-5 border-2 border-gray-200 rounded-full ml-auto mt-1"></div></div></div>
                    <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer active:bg-orange-50 transition-all"><div><p class="font-black text-[14px] text-gray-900">Soin Kératine</p><p class="text-[11px] text-gray-500 font-medium">3h · Claire Dubois</p></div><div class="text-right"><p class="font-black text-gray-900 text-[15px]">120€</p><div class="w-5 h-5 border-2 border-gray-200 rounded-full ml-auto mt-1"></div></div></div>
                </div>
            </div>
            <!-- Date Selection -->
            <div class="space-y-3">
                <h3 class="font-black text-[13px] text-gray-900 uppercase tracking-widest">Choisir une Date</h3>
                <div class="flex gap-2 overflow-x-auto hide-scrollbar">
                    <div class="flex flex-col items-center gap-1 shrink-0 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100"><span class="text-[9px] font-black text-gray-400 uppercase">Mar</span><span class="text-[15px] font-black text-gray-300">25</span></div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-4 py-3 rounded-2xl bg-primary shadow-lg shadow-orange-200"><span class="text-[9px] font-black text-white/70 uppercase">Mer</span><span class="text-[15px] font-black text-white">26</span></div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-4 py-3 rounded-2xl bg-white border border-gray-100"><span class="text-[9px] font-black text-gray-400 uppercase">Jeu</span><span class="text-[15px] font-black text-gray-700">27</span></div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-4 py-3 rounded-2xl bg-white border border-gray-100"><span class="text-[9px] font-black text-gray-400 uppercase">Ven</span><span class="text-[15px] font-black text-gray-700">28</span></div>
                    <div class="flex flex-col items-center gap-1 shrink-0 px-4 py-3 rounded-2xl bg-white border border-gray-100"><span class="text-[9px] font-black text-gray-300 uppercase">Sam</span><span class="text-[15px] font-black text-gray-200">1</span></div>
                </div>
                <div class="grid grid-cols-4 gap-2">
                    <div class="bg-primary text-white rounded-2xl py-3 text-center cursor-pointer"><p class="text-[12px] font-black">09:00</p></div>
                    <div class="bg-white border border-gray-100 rounded-2xl py-3 text-center cursor-pointer active:bg-orange-50 transition-all"><p class="text-[12px] font-black text-gray-700">10:30</p></div>
                    <div class="bg-white border border-gray-100 rounded-2xl py-3 text-center cursor-pointer active:bg-orange-50 transition-all"><p class="text-[12px] font-black text-gray-700">14:00</p></div>
                    <div class="bg-gray-50 border border-gray-100 rounded-2xl py-3 text-center"><p class="text-[12px] font-black text-gray-300">16:30</p></div>
                </div>
            </div>
            <!-- Notes -->
            <div class="space-y-2">
                <h3 class="font-black text-[13px] text-gray-900 uppercase tracking-widest">Note (optionnel)</h3>
                <textarea placeholder="Ex: préférence pour couleur naturelle, allergie au nickel..." class="w-full bg-white border border-gray-100 rounded-2xl p-4 text-[13px] text-gray-700 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none shadow-sm resize-none h-24"></textarea>
            </div>
        </div>
        <div class="bg-white px-5 pt-4 pb-10 border-t border-gray-100 sticky bottom-0 shrink-0">
            <div class="flex justify-between items-center mb-4">
                <div><p class="text-[11px] text-gray-400 font-bold">Coupe & Brushing · Mer 26 fév · 09:00</p><p class="font-black text-gray-900 text-xl">45,00€</p></div>
            </div>
            <button onclick="navigateTo('appointments')" class="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-[14px] uppercase tracking-[0.2em] shadow-xl shadow-orange-100 active:scale-95 transition-all">Confirmer la Réservation</button>
        </div>
    </div >
    `;

// ═══════════════════════════════════════════════
//  SCREENS OBJECT CLOSED
// ═══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
    navigateTo('accueil');
    startFlashSaleTimer();
});

// ──────────────────────────────────────────────
//  SERVICES TAB SWITCHING
// ──────────────────────────────────────────────
const SERVICES_TAB_CONTENT = {
    styles: `
    <div class="h-full w-full bg-black snap-y snap-mandatory overflow-y-auto">
        <div class="relative snap-start flex-shrink-0" style="height:100%"><img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071&auto=format&fit=crop" class="w-full h-full object-cover absolute inset-0"><div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div><div class="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-50"><div class="flex flex-col items-center gap-1"><button class="w-12 h-12 flex items-center justify-center text-white active:scale-90 transition-transform"><span class="material-symbols-outlined text-[30px]">favorite</span></button><span class="text-[10px] font-bold text-white">1.2k</span></div><div class="flex flex-col items-center gap-1"><button onclick="openComments()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">mode_comment</span></button><span class="text-[10px] font-bold text-white">84</span></div><button onclick="openShare()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">share</span></button><button class="w-14 h-14 bg-primary rounded-2xl flex flex-col items-center justify-center border-2 border-white/20 shadow-xl mt-2 active:scale-90 transition-transform" onclick="navigateTo('ai_camera')"><span class="material-symbols-outlined text-white text-xl">auto_fix_high</span><span class="text-[7px] font-black text-white uppercase tracking-widest mt-0.5">ESSAI IA</span></button></div><div class="absolute left-5 right-20 bottom-10 z-50 space-y-3"><div class="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100" class="w-10 h-10 rounded-full border-2 border-primary object-cover"><div><h4 class="text-white font-black text-sm">Sarah Jenkins <span class="text-white/40 font-normal text-xs">• 2h</span></h4></div></div><p class="text-white text-sm font-medium">Balayage Cuivré pour l'été ✨</p><div class="flex gap-2"><span class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10">Coloration</span></div></div></div>
        <div class="relative snap-start flex-shrink-0" style="height:100%"><img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop" class="w-full h-full object-cover absolute inset-0"><div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div><div class="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-50"><div class="flex flex-col items-center gap-1"><button class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">favorite</span></button><span class="text-[10px] font-bold text-white">3.4k</span></div><div class="flex flex-col items-center gap-1"><button onclick="openComments()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">mode_comment</span></button><span class="text-[10px] font-bold text-white">212</span></div><button onclick="openShare()" class="w-12 h-12 flex items-center justify-center text-white"><span class="material-symbols-outlined text-[30px]">share</span></button></div><div class="absolute left-5 right-20 bottom-10 z-50 space-y-3"><div class="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=100" class="w-10 h-10 rounded-full border-2 border-primary object-cover"><div><h4 class="text-white font-black text-sm">Elena Rossi <span class="text-white/40 font-normal text-xs">• 5h</span></h4></div></div><p class="text-white text-sm font-medium">Tutoriel Contouring 💄</p></div></div>
    </div > `,
    services_grid: `
    <div class="bg-white p-5 overflow-y-auto h-full pb-24 space-y-6">
        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button class="shrink-0 px-4 py-2 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-orange-100">Tous</button>
            <button class="shrink-0 px-4 py-2 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full border border-gray-100">Coiffure</button>
            <button class="shrink-0 px-4 py-2 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full border border-gray-100">Esthétique</button>
            <button class="shrink-0 px-4 py-2 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full border border-gray-100">Massage</button>
            <button class="shrink-0 px-4 py-2 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full border border-gray-100">Onglerie</button>
        </div>
        <div class="grid grid-cols-2 gap-4">
            ${[
            { icon: 'content_cut', name: 'Coupe Femme', price: 'À partir de 35€', time: '45min', color: 'bg-orange-50 text-primary' },
            { icon: 'palette', name: 'Coloration', price: 'À partir de 65€', time: '2h', color: 'bg-purple-50 text-purple-600' },
            { icon: 'spa', name: 'Soin Visage', price: 'À partir de 45€', time: '1h', color: 'bg-green-50 text-green-600' },
            { icon: 'face_retouching_natural', name: 'Maquillage', price: 'À partir de 55€', time: '1h30', color: 'bg-pink-50 text-pink-600' },
            { icon: 'front_hand', name: 'Manucure', price: 'À partir de 25€', time: '45min', color: 'bg-blue-50 text-blue-600' },
            { icon: 'self_improvement', name: 'Massage', price: 'À partir de 60€', time: '1h', color: 'bg-teal-50 text-teal-600' },
        ].map(s => `<div class="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm cursor-pointer active:scale-[0.98] transition-all" onclick="navigateTo('service_detail')"><div class="w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mb-3"><span class="material-symbols-outlined text-xl">${s.icon}</span></div><h4 class="font-black text-[13px] text-gray-900">${s.name}</h4><p class="text-[10px] text-gray-400 font-bold mt-0.5">${s.time}</p><p class="text-primary font-black text-[12px] mt-2">${s.price}</p></div>`).join('')}
        </div>
    </div > `,
    salons: `
    <div class="bg-[#F5F6F8] overflow-y-auto h-full pb-24">
        <div class="relative h-44 bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=500" class="w-full h-full object-cover opacity-60"><div class="absolute inset-0 flex items-end justify-center pb-4"><button class="px-5 py-2.5 bg-white rounded-full text-[11px] font-black text-gray-900 shadow-xl flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[16px]">map</span>Voir sur la carte</button></div></div>
        <div class="p-5 space-y-4">
            ${[
            { name: "L'Atelier de Beauté", area: 'Paris 11ème · 0.8km', rating: '4.9', tags: ['Coloration', 'Soin Bio'], img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=100' },
            { name: 'Studio Lumière', area: 'Paris 8ème · 1.2km', rating: '4.8', tags: ['Spa', 'Massage'], img: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=100' },
            { name: 'L\'Atelier Naturel', area: 'Paris 11ème · 1.5km', rating: '4.9', tags: ['Bio Certifié', 'Végétal'], img: 'https://images.unsplash.com/photo-1595163153849-76e52d8d5c73?q=80&w=100' },
        ].map(s => `<div class="bg-white rounded-[2rem] p-4 flex gap-4 border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition-all" onclick="navigateTo('service_detail')"><img src="${s.img}" class="w-20 h-20 rounded-2xl object-cover shrink-0"><div class="flex-1 py-1"><div class="flex justify-between items-start"><h4 class="font-black text-[14px] text-gray-900 leading-tight">${s.name}</h4><div class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-[12px]">star</span><span class="text-[11px] font-black">${s.rating}</span></div></div><p class="text-[11px] text-gray-400 font-medium mt-0.5">${s.area}</p><div class="flex gap-2 mt-2">${s.tags.map(t => `<span class="px-2.5 py-1 bg-orange-50 text-primary text-[8px] font-black rounded-full border border-orange-100">${t}</span>`).join('')}</div><button class="mt-2 px-4 py-1.5 bg-primary text-white text-[9px] font-black rounded-full shadow-sm">Réserver</button></div></div>`).join('')}
        </div>
    </div > `,
    independants: `
    <div class="bg-[#F5F6F8] overflow-y-auto h-full p-5 space-y-4 pb-24">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-1">12 Pros Indépendants</p>
        ${[
            { name: 'Claire Dubois', job: 'Coiffeuse · Paris 11ème', rating: '4.9', jobs: '156 RDV', img: 'https://images.unsplash.com/photo-1595163153849-76e52d8d5c73?q=80&w=100', avail: 'Dispo ce soir' },
            { name: 'Elena Rossi', job: 'Esthéticienne · Paris 8ème', rating: '4.8', jobs: '98 RDV', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=100', avail: 'Dispo demain' },
            { name: 'Marie Lefort', job: 'Maquilleuse · Paris 5ème', rating: '5.0', jobs: '234 RDV', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=100', avail: 'Dispo ce soir' },
        ].map(p => `<div class="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm flex gap-4 cursor-pointer active:scale-[0.98] transition-all" onclick="navigateTo('booking_flow')"><img src="${p.img}" class="w-16 h-16 rounded-2xl object-cover shrink-0"><div class="flex-1"><div class="flex justify-between items-start"><h4 class="font-black text-[14px] text-gray-900">${p.name}</h4><div class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-[12px]">star</span><span class="text-[11px] font-black">${p.rating}</span></div></div><p class="text-[11px] text-gray-500 font-medium">${p.job}</p><p class="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-wider">${p.jobs}</p><span class="inline-block mt-2 px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full border border-green-100">${p.avail}</span></div></div>`).join('')
        }
    </div > `
};

function switchServicesTab(tabId) {
    const content = document.getElementById('services-tab-content');
    const tabs = document.querySelectorAll('#services-tabs .tab-btn');
    if (!content) return;

    tabs.forEach(btn => {
        const isActive = btn.dataset.tab === tabId;
        btn.classList.toggle('border-primary', isActive);
        btn.classList.toggle('text-primary', isActive);
        btn.classList.toggle('border-transparent', !isActive);
        btn.classList.toggle('text-gray-400', !isActive);
    });

    content.innerHTML = SERVICES_TAB_CONTENT[tabId] || SERVICES_TAB_CONTENT['styles'];
}

// ──────────────────────────────────────────────
//  AI CHAT INTERACTION
// ──────────────────────────────────────────────
const AI_RESPONSES = {
    default: 'Je cherche pour vous... 🔍 Voici quelques recommandations basées sur votre profil beauté !',
    peau: 'D\'après votre profil, vous avez une peau mixte à tendance grasse. Je recommande une routine légère : nettoyant doux + sérum vitamine C + hydratant non-comédogène. ✨',
    rdv: 'Parfait ! Votre coiffeuse habituelle Claire Dubois est disponible demain à 14h30. Je peux confirmer le rendez-vous ? 📅',
    cheveux: 'Pour des cheveux secs, les produits riches en kératine et huiles végétales sont idéaux. Je vous recommande notre Masque Nourrissant & le Sérum Protecteur ! 💧',
    tendances: 'Les tendances beauté 2026 : Glazed Skin, Brun Naturel, Lèvres Nude Glossy, et la coloration végétale qui explose ! 🔥'
};

function sendAIMessage(btn, text) {
    if (!text || !text.trim()) return;
    const messages = document.getElementById('ai-chat-messages');
    if (!messages) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'flex gap-3 items-end flex-row-reverse animate-in slide-in-from-bottom duration-300';
    userMsg.innerHTML = `<img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100" class="w-8 h-8 rounded-xl object-cover shrink-0"><div class="max-w-[75%]"><div class="bg-primary rounded-[1.5rem] rounded-br-md px-5 py-4 shadow-sm"><p class="text-[13px] text-white font-medium">${text}</p></div></div>`;
    messages.appendChild(userMsg);

    const typingEl = document.createElement('div');
    typingEl.className = 'flex gap-3 items-end animate-in slide-in-from-bottom duration-300';
    typingEl.innerHTML = `<div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-white text-sm">smart_toy</span></div><div class="bg-white rounded-[1.5rem] rounded-bl-md px-5 py-4 shadow-sm border border-gray-100"><div class="flex gap-1.5 items-center"><div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay:0ms"></div><div class="w-2 h-2 bg-gray-300 rounded-full animate-delay:150ms"></div><div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay:300ms"></div></div></div>`;
    messages.appendChild(typingEl);
    messages.scrollTop = messages.scrollHeight;

    const aiInput = document.getElementById('ai-input');
    if (aiInput) aiInput.value = '';

    const lowerText = text.toLowerCase();
    let responseKey = 'default';
    if (lowerText.includes('peau') || lowerText.includes('teint')) responseKey = 'peau';
    else if (lowerText.includes('rdv') || lowerText.includes('réserv') || lowerText.includes('coiffeur')) responseKey = 'rdv';
    else if (lowerText.includes('cheveux') || lowerText.includes('chev')) responseKey = 'cheveux';
    else if (lowerText.includes('tendance')) responseKey = 'tendances';

    setTimeout(() => {
        typingEl.remove();
        const aiMsg = document.createElement('div');
        aiMsg.className = 'flex gap-3 items-end animate-in slide-in-from-bottom duration-300';
        aiMsg.innerHTML = `<div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-white text-sm">smart_toy</span></div><div class="max-w-[85%]"><div class="bg-white rounded-[1.5rem] rounded-bl-md px-5 py-4 shadow-sm border border-gray-100"><p class="text-[13px] text-gray-800 font-medium leading-relaxed">${AI_RESPONSES[responseKey]}</p></div><p class="text-[9px] text-gray-400 font-bold px-2 mt-1">Maintenant</p></div>`;
        messages.appendChild(aiMsg);
        messages.scrollTop = messages.scrollHeight;
    }, 1200);
}

// ──────────────────────────────────────────────
//  BOTTOM SHEET OVERLAYS
// ──────────────────────────────────────────────
function openComments() {
    const overlay = document.createElement('div');
    overlay.id = 'comments-overlay';
    overlay.className = 'fixed inset-0 z-[200] flex items-end';
    overlay.innerHTML = `
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="this.parentElement.remove()"></div>
        <div class="relative w-full bg-white rounded-t-[2rem] p-6 space-y-5 animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-y-auto">
            <div class="flex justify-between items-center"><h3 class="font-black text-[15px] text-gray-900">Commentaires (84)</h3><button onclick="document.getElementById('comments-overlay').remove()" class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><span class="material-symbols-outlined text-gray-500 text-[18px]">close</span></button></div>
            ${[
            { user: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=60', txt: "L'éclat de ta peau est incroyable ! ✨", time: '2min' },
            { user: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=60', txt: "C'est quel pinceau ? J'en ai besoin !", time: '5min' },
            { user: 'Jessica L.', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=60', txt: "En direct de Londres ! J'adore tes conseils !", time: '12min' },
        ].map(c => `<div class="flex gap-3"><img src="${c.avatar}" class="w-9 h-9 rounded-full object-cover shrink-0"><div class="flex-1 bg-gray-50 rounded-2xl px-4 py-3"><div class="flex justify-between items-start"><p class="font-black text-[12px] text-gray-900">${c.user}</p><p class="text-[9px] text-gray-400 font-bold">${c.time}</p></div><p class="text-[12px] text-gray-600 font-medium mt-0.5">${c.txt}</p></div></div>`).join('')}
            <div class="flex gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-2"><div class="flex-1 bg-gray-50 rounded-full px-4 py-3 text-[12px] text-gray-400 border border-gray-100">Ajouter un commentaire...</div><button class="w-10 h-10 bg-primary rounded-full flex items-center justify-center"><span class="material-symbols-outlined text-white text-[18px]">send</span></button></div>
        </div>`;
    document.body.appendChild(overlay);
}

function openShare() {
    const overlay = document.createElement('div');
    overlay.id = 'share-overlay';
    overlay.className = 'fixed inset-0 z-[200] flex items-end';
    overlay.innerHTML = `
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="this.parentElement.remove()"></div>
                <div class="relative w-full bg-white rounded-t-[2rem] p-6 space-y-5 animate-in slide-in-from-bottom duration-300">
                    <div class="flex justify-between items-center"><h3 class="font-black text-[15px] text-gray-900">Partager ce contenu</h3><button onclick="document.getElementById('share-overlay').remove()" class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><span class="material-symbols-outlined text-gray-500 text-[18px]">close</span></button></div>
                    <div class="grid grid-cols-4 gap-4">
                        ${[
            { icon: 'chat_bubble', label: 'Message', bg: 'bg-blue-50 text-blue-500' },
            { icon: 'public', label: 'Instagram', bg: 'bg-pink-50 text-pink-500' },
            { icon: 'link', label: 'Copier lien', bg: 'bg-gray-50 text-gray-600' },
            { icon: 'more_horiz', label: 'Plus', bg: 'bg-gray-50 text-gray-600' },
        ].map(s => `<div class="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all"><div class="w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-xl">${s.icon}</span></div><p class="text-[9px] font-black text-gray-600 uppercase tracking-wider">${s.label}</p></div>`).join('')}
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100"><span class="text-[12px] font-bold text-gray-500">beautybook.app/style/abc123</span><button class="text-primary font-black text-[11px] uppercase tracking-widest">Copier</button></div>
                    <div class="pb-4"></div>
                </div>`;
    document.body.appendChild(overlay);
}

// ──────────────────────────────────────────────
//  FLASH SALE COUNTDOWN TIMER
// ──────────────────────────────────────────────
function startFlashSaleTimer() {
    const endTime = Date.now() + (1 * 3600 + 24 * 60 + 10) * 1000;
    function updateTimer() {
        const el = document.querySelector('.flash-sale-timer');
        if (!el) return;
        const remaining = Math.max(0, endTime - Date.now());
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        el.textContent = `Termine dans ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} `;
    }
    setInterval(updateTimer, 1000);
    updateTimer();
}

// ──────────────────────────────────────────────
//  CART QUANTITY MANAGEMENT
// ──────────────────────────────────────────────
function updateCartQty(btn, delta) {
    const row = btn.closest('[data-cart-item]') || btn.parentElement;
    const qtyEl = row?.querySelector('[data-qty]');
    if (!qtyEl) return;
    const newQty = Math.max(0, (parseInt(qtyEl.textContent) || 1) + delta);
    qtyEl.textContent = newQty;
    if (newQty === 0 && row.parentElement) row.remove();
}

// ──────────────────────────────────────────────
//  BOUTIQUE SUB-CATEGORIES
// ──────────────────────────────────────────────
let currentActiveCategory = null;
function toggleSubCategories(categoryId) {
    const subBar = document.getElementById('sub-categories-bar');
    if (!subBar) return;
    const container = subBar.querySelector('div');
    const data = {
        soins: ['Visage', 'Corps', 'Solaire', 'Anti-âge', 'Démaquillant', 'Bio'],
        makeup: ['Teint', 'Lèvres', 'Yeux', 'Sourcils', 'Pinceaux', 'Palettes'],
        hair: ['Shampoing', 'Soin', 'Masque', 'Huile', 'Styling', 'Coloration'],
        parfum: ['Eau de Parfum', 'Eau de Toilette', 'Coffret', 'Brume', 'Homme']
    };

    document.querySelectorAll('[id^="cat-"]').forEach(el => {
        el.classList.remove('ring-primary', 'border-primary', 'ring-2');
        el.classList.add('border-gray-100');
    });

    if (currentActiveCategory === categoryId) {
        subBar.classList.add('hidden');
        currentActiveCategory = null;
    } else {
        currentActiveCategory = categoryId;
        const activeCat = document.getElementById(`cat - ${categoryId} `);
        if (activeCat) activeCat.classList.add('ring-primary', 'border-primary', 'ring-2');
        if (data[categoryId]) {
            container.innerHTML = data[categoryId].map(sub =>
                `<button class="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap active:bg-orange-50 active:text-primary transition-all shadow-sm">${sub}</button>`
            ).join('');
            subBar.classList.remove('hidden');
        } else {
            subBar.classList.add('hidden');
        }
    }
}


/**
 * UTILS & NAVIGATION
 */

function navigateTo(screenId) {
    const contentArea = document.getElementById('app-content');
    if (!contentArea) return;

    // Transition effect
    contentArea.classList.remove('animate-in', 'fade-in', 'duration-500');
    void contentArea.offsetWidth; // Trigger reflow
    contentArea.classList.add('animate-in', 'fade-in', 'duration-500');

    if (SCREENS[screenId]) {
        contentArea.innerHTML = SCREENS[screenId];
        updateNavState(screenId);
        contentArea.scrollTop = 0;

        // Dynamic content injection
        if (screenId === 'appointments') {
            const container = document.getElementById('appointments-container');
            if (container) container.innerHTML = getAppointmentsContent();
        }
        if (screenId === 'profile') {
            const container = document.getElementById('profile-container');
            if (container) container.innerHTML = getProfileContent();
        }

        // Re-run any screen-specific initializers if needed
        if (screenId === 'boutique') startFlashSaleTimer();
    } else {
        contentArea.innerHTML = '<div class="p-12 text-center text-gray-400 font-bold">Écran [' + screenId + '] en cours de développement...</div>';
    }
}

function updateNavState(activeScreenId) {
    // Bottom Nav
    document.querySelectorAll('.nav-item').forEach(item => {
        const screen = item.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (screen === activeScreenId) {
            item.classList.add('text-primary');
            item.classList.remove('text-gray-400');
        } else {
            item.classList.remove('text-primary');
            item.classList.add('text-gray-400');
        }
    });

    // Top Tabs
    document.querySelectorAll('[data-top-tab]').forEach(tab => {
        const tabId = tab.getAttribute('data-top-tab');
        if (tabId === activeScreenId) {
            tab.classList.add('bg-primary', 'text-white');
            tab.classList.remove('bg-gray-100', 'text-gray-400');
        } else {
            tab.classList.remove('bg-primary', 'text-white');
            tab.classList.add('bg-gray-100', 'text-gray-400');
        }
    });
}

function switchTopTab(tabId) {
    navigateTo(tabId);
}

function closeOverlays() {
    const overlays = ['comments-overlay', 'share-overlay'];
    overlays.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

function getAppointmentsContent() {
    if (currentUserRole === 'professional') {
        return `
            <div class="space-y-6">
                <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-[16px] font-black text-gray-900">Agenda : Aujourd'hui</h3>
                        <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black underline">Modifier</span>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-center gap-5 p-4 bg-orange-50 rounded-[1.8rem] border border-orange-100/50">
                            <div class="text-center shrink-0 w-12"><p class="text-[13px] font-black text-primary">09:00</p><p class="text-[8px] font-black text-primary/60 uppercase">45 min</p></div>
                            <div class="h-8 w-px bg-orange-200"></div>
                            <div class="flex-1">
                                <p class="text-[14px] font-black text-gray-900">Coupe Style Luxe</p>
                                <p class="text-[10px] text-gray-500 font-bold">Jean-Marc (Client régulier)</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-5 p-4 border border-gray-100 rounded-[1.8rem]">
                            <div class="text-center shrink-0 w-12"><p class="text-[13px] font-black text-gray-400">10:00</p><p class="text-[8px] font-black text-gray-300 uppercase">Libre</p></div>
                            <div class="h-8 w-px bg-gray-100"></div>
                            <div class="flex-1">
                                <p class="text-[14px] font-black text-gray-300">Créneau disponible</p>
                            </div>
                            <button class="bg-primary text-white p-2 rounded-xl shadow-lg"><span class="material-symbols-outlined text-[18px]">add</span></button>
                        </div>
                    </div>
                </div>
                <!-- Performance Quick Stats -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white rounded-[2rem] p-5 border border-gray-100">
                        <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">CA du jour</p>
                        <p class="text-xl font-black text-gray-900 mt-1">185.00€</p>
                    </div>
                    <div class="bg-white rounded-[2rem] p-5 border border-gray-100">
                        <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">RDV Complètes</p>
                        <p class="text-xl font-black text-gray-900 mt-1">4/6</p>
                    </div>
                </div>
            </div>
        `;
    } else if (currentUserRole === 'administrator') {
        return `
            <div class="space-y-6">
                <!-- Admin Dashboard Overview -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-900 rounded-[2rem] p-6 text-white col-span-2">
                        <p class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Global Performance</p>
                        <h4 class="text-3xl font-black mt-2">42,850.00€</h4>
                        <div class="flex items-center gap-2 mt-4 text-green-400"><span class="material-symbols-outlined text-sm">trending_up</span><span class="text-[11px] font-bold">+18.4% ce mois</span></div>
                    </div>
                </div>
                <div class="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
                    <h3 class="text-[15px] font-black text-gray-900 mb-5">Validation de comptes Pro</h3>
                    <div class="space-y-4">
                        <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <img src="https://images.unsplash.com/photo-1595163153849-76e52d8d5c73?q=80&w=100" class="w-10 h-10 rounded-full object-cover">
                            <div class="flex-1"><p class="text-[12px] font-black text-gray-900">Salon "Pure Beauty"</p><p class="text-[9px] text-gray-400">Dossier #9524 - En attente</p></div>
                            <button class="bg-primary text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-orange-100">Gérer</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    // Default: Client View
    return `
        <div class="space-y-8">
            <div class="space-y-4">
                <div class="flex items-center justify-between"><h3 class="text-[13px] font-black text-gray-900 uppercase tracking-widest">À venir</h3><span class="text-[10px] text-primary font-black uppercase tracking-widest">2 RDV</span></div>
                <div class="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                    <div class="h-1.5 bg-gradient-to-r from-primary to-orange-400"></div>
                    <div class="p-5 flex gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-orange-50 flex flex-col items-center justify-center text-primary shrink-0"><span class="text-[18px] font-black leading-none">24</span><span class="text-[8px] font-black uppercase tracking-widest">FÉV</span></div>
                        <div class="flex-1 space-y-2">
                            <div class="flex justify-between items-start"><div><h4 class="font-black text-[14px] text-gray-900">Coupe & Brushing Premium</h4><p class="text-[11px] text-gray-500 font-medium mt-0.5">L'Atelier de Beauté • 14:30</p></div><span class="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">Confirmé</span></div>
                            <div class="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1595163153849-76e52d8d5c73?q=80&w=100" class="w-6 h-6 rounded-full object-cover border border-gray-100"><span class="text-[11px] text-gray-500 font-bold">Claire Dubois</span></div>
                            <div class="flex gap-2 pt-1"><button class="flex-1 py-2 border border-gray-200 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest">Modifier</button><button class="flex-1 py-2 bg-primary rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-orange-100">Itinéraire</button></div>
                        </div>
                    </div>
                </div>
            </div>
            <button onclick="navigateTo('services')" class="w-full py-5 border-2 border-dashed border-orange-200 rounded-[2rem] flex items-center justify-center gap-3 text-primary active:bg-orange-50 transition-all"><span class="material-symbols-outlined">add_circle</span><span class="text-[12px] font-black uppercase tracking-widest">Prendre un nouveau RDV</span></button>
        </div>
    `;
}

function getProfileContent() {
    let headerAction = '';
    if (currentUserRole === 'professional') {
        headerAction = `<div class="mt-4 flex gap-2 justify-center"><button class="bg-gray-900 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest">Éditer ma page Pro</button><button class="bg-white border border-gray-200 text-gray-900 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest">Portefeuille</button></div>`;
    } else if (currentUserRole === 'administrator') {
        headerAction = `<div class="mt-4 flex gap-2 justify-center"><button class="bg-red-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest">Console Admin</button><button class="bg-gray-900 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest">Logs Système</button></div>`;
    }

    return `
        <div class="bg-white px-5 pt-10 pb-6 text-center relative border-b border-gray-100">
            <div class="relative w-24 h-24 mx-auto mb-3">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200" class="w-full h-full rounded-full object-cover border-4 border-white shadow-xl">
                <span class="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <h2 class="font-black text-[20px] text-gray-900">Sophie Martin</h2>
            <p class="text-[11px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">Role : ${currentUserRole}</p>
            ${headerAction}
            <!-- Role Switcher (For Prototype Demo) -->
            <div class="mt-6 flex justify-center gap-2 p-1.5 bg-gray-50 rounded-2xl w-fit mx-auto border border-gray-100">
                <button onclick="setRole('client')" class="px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${currentUserRole === 'client' ? 'bg-white shadow text-primary' : 'text-gray-400'}">Client</button>
                <button onclick="setRole('professional')" class="px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${currentUserRole === 'professional' ? 'bg-white shadow text-primary' : 'text-gray-400'}">Pro</button>
                <button onclick="setRole('administrator')" class="px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${currentUserRole === 'administrator' ? 'bg-white shadow text-primary' : 'text-gray-400'}">Admin</button>
            </div>
        </div>
        <div class="px-5 py-6 space-y-4" id="profile-actions-container">
            ${getProfileActions()}
        </div>
    `;
}

function getProfileActions() {
    let actions = '';
    if (currentUserRole === 'client') {
        actions = `
            <button class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm active:bg-orange-50"><span class="material-symbols-outlined text-primary">person</span><span class="flex-1 text-left text-[14px] font-black">Mon Compte</span><span class="material-symbols-outlined text-gray-300">chevron_right</span></button>
            <button onclick="navigateTo('loyalty')" class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm active:bg-orange-50"><span class="material-symbols-outlined text-amber-500">stars</span><span class="flex-1 text-left text-[14px] font-black">Fidélité</span><span class="material-symbols-outlined text-gray-300">chevron_right</span></button>
        `;
    } else if (currentUserRole === 'professional') {
        actions = `
            <button class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm active:bg-orange-50"><span class="material-symbols-outlined text-primary">store</span><span class="flex-1 text-left text-[14px] font-black">Mon Salon / Services</span><span class="material-symbols-outlined text-gray-300">chevron_right</span></button>
            <button class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm active:bg-orange-50"><span class="material-symbols-outlined text-primary">timeline</span><span class="flex-1 text-left text-[14px] font-black">Statistiques Pro</span><span class="material-symbols-outlined text-gray-300">chevron_right</span></button>
        `;
    } else if (currentUserRole === 'administrator') {
        actions = `
            <button class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm active:bg-orange-50"><span class="material-symbols-outlined text-red-500">gavel</span><span class="flex-1 text-left text-[14px] font-black">Gestion Contentieux</span><span class="material-symbols-outlined text-gray-300">chevron_right</span></button>
            <button class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm active:bg-orange-50"><span class="material-symbols-outlined text-primary">group</span><span class="flex-1 text-left text-[14px] font-black">Utilisateurs</span><span class="material-symbols-outlined text-gray-300">chevron_right</span></button>
        `;
    }
    return actions;
}

function setRole(role) {
    currentUserRole = role;
    const currentScreen = document.querySelector('.nav-item.text-primary')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || 'accueil';
    navigateTo(currentScreen);
}
