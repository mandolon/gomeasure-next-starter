"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { href: "/order/property", label: "Property" },
  { href: "/order/schedule", label: "Schedule" },
  { href: "/order/contact",  label: "Contact" },
  { href: "/order/review",   label: "Review" },
];

export default function Progress() {
  const pathname = usePathname();
  return (
    <nav className="progress" aria-label="Steps">
      {steps.map(s => {
        const active = pathname.startsWith(s.href);
        return (
          <Link key={s.href} href={s.href} className={`step${active ? " active" : ""}`}>
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
