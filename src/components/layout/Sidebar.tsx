import {
  House,
  BookOpen,
  Languages,
  MessageCircle,
  Star,
  ChartColumn,
  Settings,
} from "lucide-react";

const menu = [
  { icon: House, label: "Dashboard" },
  { icon: BookOpen, label: "Vocabulary" },
  { icon: Languages, label: "Verbs" },
  { icon: MessageCircle, label: "Speaking" },
  { icon: Star, label: "Favorites" },
  { icon: ChartColumn, label: "Progress" },
  { icon: Settings, label: "Settings" },
];

function Sidebar() {
  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-screen p-6">

      <h1 className="text-3xl font-bold mb-12">
        DeutschPal
      </h1>

      <nav className="space-y-2">

        {menu.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.label}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-orange-100 hover:text-black transition"
            >
              <Icon size={20} />

              {item.label}

            </button>

          );

        })}

      </nav>

    </aside>
  );
}

export default Sidebar;