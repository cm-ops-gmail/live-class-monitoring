
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Top Navbar */}
      <nav className="bg-black border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-32">
                {/* 
                  INSTRUCTIONS: 
                  1. Upload your logo to the 'public' folder.
                  2. Name it exactly 'logo.png'.
                  3. The component below will automatically display it.
                */}
                <Image 
                  src="/logo.png" 
                  alt="Company Logo" 
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">
                  Content Operations Monitor
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardShell />
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            &copy; 2025 10 MS Content Operations. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
