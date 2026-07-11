"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";

interface DropdownItem {
  label: string;
  value?: string;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  menuClassName?: string;
  align?: "left" | "right";
}

export function Dropdown({
  trigger,
  items,
  className = "",
  menuClassName = "",
  align = "left",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1"
      >
        {trigger}
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`
            absolute mt-2 w-48 bg-white border border-slate-300 rounded-xl shadow-lg z-50
            ${align === "right" ? "right-0" : "left-0"}
            ${menuClassName}
          `}
        >
          <ul className="py-1">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className="w-full px-1 py-1 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
