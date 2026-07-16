
notifications: `
        <div class="flex flex-col h-full bg-[#F5F6F8] animate-in fade-in duration-500 overflow-y-auto hide-scrollbar pb-24">
            <div class="px-6 pt-8 pb-6 bg-white border-b border-gray-100">
                <div class="flex items-center gap-4 mb-6">
                    <button onclick="navigateTo('accueil')" class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-900 border border-gray-100">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 class="text-xl font-black text-gray-900">Notifications</h2>
                </div>
                <!-- Tabs -->
                <div class="flex gap-4 overflow-x-auto hide-scrollbar">
                    <button class="px-5 py-2.5 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg">Tout</button>
                    <button class="px-5 py-2.5 bg-white text-gray-400 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Offres</button>
                    <button class="px-5 py-2.5 bg-white text-gray-400 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Suivi</button>
                </div>
            </div>

            <div class="p-6 space-y-4">
                <div class="bg-white p-5 rounded-[2.5rem] flex gap-4 border border-orange-100 shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-primary shrink-0">
                        <span class="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div class="flex-1 space-y-1">
                        <div class="flex justify-between items-start">
                            <h4 class="text-[14px] font-black text-gray-900">Nouveautés AI</h4>
                            <span class="text-[9px] font-bold text-gray-400">À l'instant</span>
                        </div>
                        <p class="text-[12px] text-gray-600 leading-relaxed">Le filtre "Sunset Glow" est maintenant disponible pour vos tests en direct ! ✨</p>
                        <button class="text-[10px] font-black text-primary uppercase tracking-widest mt-2">Essayer maintenant</button>
                    </div>
                    <div class="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full"></div>
                </div>

                <div class="bg-white p-5 rounded-[2.5rem] flex gap-4 border border-gray-50 shadow-sm relative">
                    <div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                        <span class="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div class="flex-1 space-y-1">
                        <div class="flex justify-between items-start">
                            <h4 class="text-[14px] font-black text-gray-900">Commande expédiée</h4>
                            <span class="text-[9px] font-bold text-gray-400">Il y a 2h</span>
                        </div>
                        <p class="text-[12px] text-gray-600 leading-relaxed">Votre colis #BB-992 a été remis au transporteur. Arrivée prévue demain ! 📦</p>
                    </div>
                </div>
            </div>
        </div>
    `,

    localisation: `
    <div class="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-y-auto hide-scrollbar pb-24">
        <div class="px-6 pt-8 pb-6 bg-white">
            <div class="flex items-center gap-4 mb-8">
                <button onclick="navigateTo('accueil')" class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-900 border border-gray-100">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 class="text-xl font-black text-gray-900">Ma Position</h2>
            </div>

            <div class="relative group mb-8">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">location_on</span>
                <input type="text" placeholder="Entrez votre ville..."
                    class="w-full bg-[#F5F6F8] border-none rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-primary/20 outline-none placeholder-gray-400 font-medium">
            </div>

            <button class="w-full py-4 bg-primary/10 text-primary rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all mb-10">
                <span class="material-symbols-outlined">my_location</span>
                Utiliser ma position actuelle
            </button>

            <div class="space-y-6">
                <h3 class="text-[13px] font-black text-gray-400 uppercase tracking-[0.15em]">Villes Populaires</h3>
                <div class="space-y-1">
                    <div class="flex items-center justify-between py-4 border-b border-gray-50 group cursor-pointer active:bg-gray-50 px-2 rounded-xl transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <span class="material-symbols-outlined text-[20px]">map</span>
                            </div>
                            <p class="text-[14px] font-black text-gray-900">Paris, FR</p>
                        </div>
                        <span class="material-symbols-outlined text-gray-300">chevron_right</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
};

function navigateTo(screenId) {
    const contentArea = document.getElementById('app-content');
    contentArea.classList.remove('screen-transition');
    void contentArea.offsetWidth;
    contentArea.classList.add('screen-transition');

    if (SCREENS[screenId]) {
        contentArea.innerHTML = SCREENS[screenId];
        updateNavState(screenId);
        contentArea.scrollTop = 0;
    } else {
        contentArea.innerHTML = '<div class="p-8 text-center text-gray-500">Écran en cours de développement...</div>';
    }
}

function updateNavState(activeScreenId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-screen') === activeScreenId);
    });
}

function switchServicesTab(tabId) {
    const contentArea = document.getElementById('services-tab-content');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
        const isActive = tab.getAttribute('data-tab') === tabId;
        tab.classList.toggle('border-b-2', isActive);
        tab.classList.toggle('border-primary', isActive);
        tab.classList.toggle('text-gray-900', isActive);
        tab.classList.toggle('active-tab', isActive);
        tab.classList.toggle('text-gray-400', !isActive);
    });

    if (tabId === 'services_grid') {
        contentArea.innerHTML = `
            <div class="p-6 grid grid-cols-2 gap-3 pb-24 animate-in fade-in duration-300">
                <div class="flex flex-col gap-3">
                    <div class="relative rounded-[2rem] overflow-hidden aspect-[3/5] group shadow-sm active:scale-95 transition-transform" onclick="navigateTo('service_detail')">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn1YiIu6ETGVBZRb1cGjCkzuKUgYVsPatj0Jebz9tTQdu1QH3-7J28EZIECvRpvG07TzBNPKuuG355F0kYzu12BeJu273hqlosUQXAyVzvEwaPLhHTtuYmtXk5i9Ab5-trSb3eVXfAQcxw4aflw2cQVAiowBrWi-bidPuEzph8I2xr9tiGV-QxVuToY2uzlZf6palmymsLifA1AVcU8hEFm6SoYK3Nkvhh6yMQGCAIuE-3cTGMjrfPxHoEoOkNycUX5N0gbH5wSo" class="w-full h-full object-cover">
                        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                            <h4 class="text-white font-black text-sm">Balayage</h4>
                            <p class="text-primary font-black text-xs">120 € - 250 €</p>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-3">
                    <div class="relative rounded-[2rem] overflow-hidden aspect-[3/4] group shadow-sm active:scale-95 transition-transform">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAggXxzyKS6DzC--MDagn77e7GkIJSKJqg8jq2BUrqcx1r3E9HyHLdHTZOuFDkF3IkZYgbEUSBwnmdSOBKgDQUu3jW7KimRPh90oI0_JoeMoHZlJm9fxNNNfKiwdXFvpNWqg44uA63JHbKIRxIuaIDlo7IqRxHbzJH9lAgfCD6pwwn2drUID5PUB__c8-891B3qkL9sBqwlfcR7dBGK_aN5y0e10vb2stKiu6rwb3FzmtmKTJoqEd5AKqwfN8Hx4NFg5t3aCxbXxAc" class="w-full h-full object-cover">
                        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                            <h4 class="text-white font-black text-sm text-[12px] leading-tight">Ongles Acryliques</h4>
                            <p class="text-primary font-black text-xs">45 € - 80 €</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (tabId === 'styles') {
        contentArea.innerHTML = `
            <div class="flex flex-col h-full bg-black snap-y snap-mandatory animate-in fade-in duration-300">
                <div class="relative h-full w-full snap-start border-b border-gray-900 flex-shrink-0" onclick="navigateTo('style_detail')">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaHrR2z3Gb9abtyPyXbWTxj7qV_okvXghMpS18wDN0XCBg4fP_SMJHf1IMIRZ6bv0qtrBVGiyK8W_B1FK6UrjvnMYpt7WgcfsvE8ZS9tP-g43c9pJhw7vc0dPzz4E4n2RD73erjBEz2jp0xgMMtxLZXukoMOtvDyIRbr136s0dbGzawGHofY_4iT1TkIdgxnlwgvQbdYLV5BkAoTLWuWdR-6816OyG5hRJ-VLRO701yepTPvgY-Db36WAcqQocBbGlXKK-u_LRyuY" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div class="absolute left-6 right-20 bottom-8 z-50 space-y-2">
                        <h4 class="text-white font-black text-lg">Sunset Ombre Hair</h4>
                        <p class="text-white/60 text-[10px] uppercase tracking-widest">Voir le détail du style</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        contentArea.innerHTML = '<div class="p-12 text-center text-gray-400 font-bold animate-in zoom-in duration-300">Section en cours de développement...</div>';
    }
}

function openComments() {
    const drawer = document.getElementById('comment-drawer');
    const backdrop = document.getElementById('overlay-backdrop');
    drawer.classList.remove('translate-y-full');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
}

function openShare() {
    const sheet = document.getElementById('share-sheet');
    const backdrop = document.getElementById('overlay-backdrop');
    sheet.classList.remove('translate-y-full');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
}

function closeOverlays() {
    const commentDrawer = document.getElementById('comment-drawer');
    const shareSheet = document.getElementById('share-sheet');
    const backdrop = document.getElementById('overlay-backdrop');
    if (commentDrawer) commentDrawer.classList.add('translate-y-full');
    if (shareSheet) shareSheet.classList.add('translate-y-full');
    if (backdrop) backdrop.classList.remove('opacity-100', 'pointer-events-auto');
}

window.addEventListener('DOMContentLoaded', () => { navigateTo('accueil'); });

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
        const activeCat = document.getElementById(`cat-${categoryId}`);
        if (activeCat) activeCat.classList.add('ring-primary', 'border-primary', 'ring-2');

        if (data[categoryId]) {
            container.innerHTML = data[categoryId].map(sub => `
                <button class="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap active:bg-orange-50 active:text-primary transition-all shadow-sm">
                    ${sub}
                </button>
            `).join('');
            subBar.classList.remove('hidden');
        } else {
            subBar.classList.add('hidden');
        }
    }
}
