
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { PlayCircle } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Top Navbar */}
      <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <PlayCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider uppercase font-headline">SheetSync</h1>
                <p className="text-[10px] text-white/70 font-medium -mt-1 tracking-tighter">DASHBOARD SYSTEM</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <span className="text-sm font-medium text-white/80">Google Sheets Live Sync</span>
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
      <footer className="mt-auto border-t py-6 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SheetSync Dashboard. Connected to Google Sheets API.</p>
        </div>
      </footer>
    </main>
  );
}
