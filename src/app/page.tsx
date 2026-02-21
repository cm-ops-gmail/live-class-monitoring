
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-black border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-32">
                {/* 
                  INSTRUCTIONS: 
                  1. The 'public' folder is at the root of your project.
                  2. Upload your logo to that folder and name it 'logo.png'.
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
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <DashboardShell />
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            &copy; 2026 10 MS Content Operations. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
