import { ChevronDown, MapPin } from "lucide-react";


type AreaMenuToggleButtonProps = {
  label?: string;
  open: boolean;
  /**
   * True when an actual area is currently selected (i.e. label !== "All Area").
   * Renders the button in the brand red with a pill background — gives the
   * visitor an obvious "you-are-here" cue at a glance.
   */
  active?: boolean;
  onToggle: () => void;
};

export default function AreaMenuToggleButton({
  label = "Click Me",
  open,
  active = false,
  onToggle,
}: AreaMenuToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1 transition-colors duration-200 bg-transparent md:gap-3 focus:outline-none focus:ring-0 px-3 py-1 rounded-full
        ${
          active
            ? "text-front-red font-semibold bg-front-red/10 border border-front-red/30 hover:bg-front-red/15"
            : "text-front-navy hover:text-front-shadowed-slate"
        }
      `}
      aria-current={active ? "page" : undefined}
    >
      {active && <MapPin className="w-4 h-4" aria-hidden="true" />}
      <span className="font-sans capitalize text-front-body">{label}</span>
      <ChevronDown
        className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
      />
    </button>
  );
}
