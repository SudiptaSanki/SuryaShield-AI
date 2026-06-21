import Link from 'next/link';
import { Sun, Shield, Activity, Clock, FileText, Info } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b-0 border-t-0 border-l-0 border-r-0 border-b-[1px] border-[rgba(0,212,255,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sun className="h-8 w-8 text-solar-orange animate-[spin_10s_linear_infinite]" />
            <span className="font-bold text-xl tracking-wider text-star-white flex items-center">
              SURYA<span className="text-plasma-blue">SHIELD</span> <Shield className="h-4 w-4 ml-1 text-corona-gold" />
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="flex space-x-6">
              <NavLink href="/" icon={<Sun size={16} />} text="Mission" />
              <NavLink href="/dashboard" icon={<Activity size={16} />} text="Live Dashboard" />
              <NavLink href="/forecast" icon={<Clock size={16} />} text="AI Forecast" />
              <NavLink href="/history" icon={<FileText size={16} />} text="History" />
              <NavLink href="/impact" icon={<Shield size={16} />} text="Impact" />
              <NavLink href="/research" icon={<Info size={16} />} text="Research" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-star-white/80 hover:text-plasma-blue hover:bg-space-deep/50 transition-colors"
    >
      {icon}
      {text}
    </Link>
  );
}
