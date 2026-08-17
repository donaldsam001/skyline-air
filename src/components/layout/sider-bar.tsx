"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Lock,
  Users,
  Sliders,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

// Sidebar navigation items config
const navItems = [
  {
    label: "Personal details",
    href: "/account/personal-details",
    icon: User,
  },
  {
    label: "Security settings",
    href: "/account/security",
    icon: Lock,
  },
  {
    label: "Other travellers",
    href: "/account/travellers",
    icon: Users,
  },
  {
    label: "Customisation preferences",
    href: "/account/preferences",
    icon: Sliders,
  },
  {
    label: "Payment methods",
    href: "/account/payment-methods",
    icon: CreditCard,
  },
  {
    label: "Privacy and data management",
    href: "/account/privacy",
    icon: ShieldCheck,
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-80 rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
      <nav className="flex flex-col divide-y divide-gray-100">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Check if current route matches item route
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50/70 text-blue-600 font-semibold border-l-4 border-blue-600 pl-4"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 stroke-[1.75] ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}