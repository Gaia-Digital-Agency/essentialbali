import { ChevronDown } from "lucide-react";

export default function AreaMenuToggleButton({
  label = "Click Me",
  open,
  onToggle,
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-7 
                 bg-transparent 
                 text-front-navy 
                 hover:text-front-shadowed-slate
                 transition-colors duration-200
                 focus:outline-none focus:ring-0"
    >
      <span className="font-sans text-front-body">{label}</span>

      <ChevronDown
        className={`w-4 h-4 transition-transform duration-300 ${
          open ? "rotate-180" : "rotate-0"
        }`}
      />
    </button>
  );
}
