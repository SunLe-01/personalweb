"use client";

import type { SectionId } from "@/lib/section-types";

type SectionMenuProps = {
  activeSection: SectionId;
  disabled: boolean;
  onNavigate: (section: SectionId) => void;
  items: Array<{ id: SectionId; label: string }>;
};

export function SectionMenu({ activeSection, disabled, onNavigate, items }: SectionMenuProps) {
  return (
    <nav className="shell-menu" aria-label="Section navigation">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="shell-menu__button"
          data-active={item.id === activeSection}
          disabled={disabled}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
