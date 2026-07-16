import { Play, Search, Users, ShoppingBag, LayoutGrid, Star } from "lucide-react";

const categories = [
  { icon: Play, label: "Vidéos" },
  { icon: Search, label: "Explorer" },
  { icon: Users, label: "Pros" },
  { icon: ShoppingBag, label: "Shop" },
  { icon: LayoutGrid, label: "Catégories" },
  { icon: Star, label: "Favoris" },
];

export default function CategoryBar() {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.label}
              className="flex flex-col items-center gap-1.5 min-w-[48px]"
            >
              <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <Icon className="w-5 h-5 text-foreground" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}