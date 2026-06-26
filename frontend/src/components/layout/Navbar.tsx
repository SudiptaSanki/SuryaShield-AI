"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Shield, Activity, Clock, FileText, Info, Orbit, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", icon: <Sun size={16} />, text: "Mission" },
  { href: "/dashboard", icon: <Activity size={16} />, text: "Live Dashboard" },
  { href: "/forecast", icon: <Clock size={16} />, text: "AI Forecast" },
  { href: "/history", icon: <FileText size={16} />, text: "History" },
  { href: "/impact", icon: <Shield size={16} />, text: "Impact" },
  { href: "/sun", icon: <Orbit size={16} />, text: "3D Sun" },
  { href: "/research", icon: <Info size={16} />, text: "Research" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b-0 border-t-0 border-l-0 border-r-0 border-b-[1px] border-[rgba(0,212,255,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <Sun className="h-7 w-7 sm:h-8 sm:w-8 text-solar-orange animate-[spin_10s_linear_infinite]" />
            <span className="font-bold text-lg sm:text-xl tracking-wider text-star-white flex items-center">
              SURYA<span className="text-plasma-blue">SHIELD</span> <Shield className="h-4 w-4 ml-1 text-corona-gold" />
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden lg:block">
            <div className="flex space-x-1">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.href} 
                  href={link.href} 
                  icon={link.icon} 
                  text={link.text} 
                  active={pathname === link.href}
                />
              ))}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="lg:hidden p-2 rounded-lg text-star-white/80 hover:text-plasma-blue hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-space-dark/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href 
                    ? "text-plasma-blue bg-plasma-blue/10 border border-plasma-blue/20" 
                    : "text-star-white/80 hover:text-plasma-blue hover:bg-white/5"
                }`}
              >
                {link.icon}
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, icon, text, active }: { href: string; icon: React.ReactNode; text: string; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active 
          ? "text-plasma-blue bg-plasma-blue/10" 
          : "text-star-white/80 hover:text-plasma-blue hover:bg-space-deep/50"
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}
