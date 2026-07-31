import {
  BookOpen,
  Brain,
  Languages,
  MessageCircle,
  Settings,
  Star,
  BrainCircuit,
  BookType,
  Lightbulb,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const links = [
  {
    name: "Vocabulary",
    path: "/vocabulary",
    icon: BookOpen,
  },
  {
    name: "Verb Trainer",
    path: "/verbs",
    icon: BookType,
  },
  {
    name: "Practice",
    path: "/practice",
    icon: Brain,
  },
  {
    name: "Knowledge",
    path: "/knowledge",
    icon: BrainCircuit,
  },
  {
    name: "Learning Coach",
    path: "/coach",
    icon: Lightbulb,
  },
  {
    name: "Grammar",
    path: "/grammar",
    icon: Languages,
  },
  {
    name: "Speaking",
    path: "/speaking",
    icon: MessageCircle,
  },
  {
    name: "Favorites",
    path: "/favorites",
    icon: Star,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[#ECE8E3] bg-white px-5 py-7">
      <div className="px-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1F1D1B]">
          DeutschPal
        </h1>

        <p className="mt-1 text-sm leading-5 text-[#77716B]">
          Learn through your own vocabulary and mistakes.
        </p>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-[#FFF0E2] text-[#B85F28]"
                    : "text-[#5F5A55] hover:bg-[#FAF8F6] hover:text-[#1F1D1B]",
                ].join(" ")
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[#ECE8E3] px-2 pt-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#A09A94]">
          Current focus
        </p>

        <p className="mt-2 text-sm font-medium text-[#1F1D1B]">
          TELC B1 preparation
        </p>

        <p className="mt-1 text-sm leading-5 text-[#77716B]">
          Vocabulary, grammar and active recall.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;