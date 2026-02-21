'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDashboardData } from '@/app/actions/sheets';
import { SheetRow } from '@/lib/google-sheets';
import { StatusBadge } from './status-badge';
import { Loader2, RefreshCw, Archive, PlayCircle, Calendar, User, BookOpen, Clock, Sparkles, CheckCircle2, XCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addHours, isWithinInterval, parse } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DashboardShell() {
  const [data, setData] = useState<{ 
    live: SheetRow[]; 
    archive: SheetRow[]; 
    isNextDayPreview: boolean; 
    currentTime: string;
    archiveDate: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveTime, setLiveTime] = useState<Date | null>(null);

  // Live Bangladesh Clock (UTC+6)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const bdTime = new Date(utc + (3600000 * 6));
      setLiveTime(bdTime);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (e) {
      console.error("Dashboard sync error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const isStatusReady = (val?: string) => {
    if (!val) return false;
    const clean = val.trim().toLowerCase().replace(/\s/g, '');
    return clean === 'allupdated' || clean === 'na' || clean === 'n/a';
  };

  const getRowStatus = (row: SheetRow) => {
    const s1 = isStatusReady(row.teacherAlignment);
    const s2 = isStatusReady(row.slide);
    const s3 = isStatusReady(row.titleCaption);
    const s4 = isStatusReady(row.platformCrosspost);
    const allReady = s1 && s2 && s3 && s4;
    return { allReady, s1, s2, s3, s4 };
  };

  const scrollToRow = useCallback((tabType: 'live' | 'archive', index: number) => {
    const elementId = `${tabType}-row-${index}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-primary/20');
      setTimeout(() => {
        element.classList.remove('bg-primary/20');
      }, 2000);
    }
  }, []);

  // Logic for "Live Now" (2 hour window)
  const liveNowRows = useMemo(() => {
    if (!data?.live || !liveTime) return [];
    
    return data.live.filter(row => {
      try {
        const timePart = row.time.split('-')[0].trim();
        const startTime = parse(timePart, 'h:mm a', liveTime);
        const endTime = addHours(startTime, 2);
        return isWithinInterval(liveTime, { start: startTime, end: endTime });
      } catch (e) {
        return false;
      }
    });
  }, [data?.live, liveTime]);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold tracking-widest uppercase">Initializing Sync</h3>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Establishing secure connection...</p>
        </div>
      </div>
    );
  }

  const renderCard = (row: SheetRow, i: number, tabType: 'live' | 'archive') => {
    const { allReady } = getRowStatus(row);
    return (
      <Card 
        key={i} 
        className={cn(
          "group card-hover-effect relative border-white/5 bg-gradient-to-br from-secondary/40 to-black overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[var(--delay)]",
        )}
        style={{ "--delay": `${i * 100}ms` } as any}
      >
        <div className="absolute -right-20 -top-20 h-40 w-40 bg-primary/5 blur-[80px] group-hover:bg-primary/10 transition-all duration-700" />
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1.5">
              <Badge variant="outline" className="w-fit text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border-primary/20 px-3 py-1">
                {row.productType || 'Requirement'}
              </Badge>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {row.course || 'Global Course'}
              </span>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={() => scrollToRow(tabType, i)}
                className="transition-transform active:scale-95 cursor-pointer"
              >
                {allReady ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black text-xs uppercase tracking-tight py-2 px-4 flex items-center gap-2 hover:bg-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4" />
                    Ready to go live
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-500 border-red-500/30 font-black text-xs uppercase tracking-tight py-2 px-4 animate-attention flex items-center gap-2 hover:bg-red-500/30">
                    <AlertCircle className="h-4 w-4" />
                    Need Attention
                  </Badge>
                )}
              </button>
              <StatusBadge timeStr={row.time} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-2xl font-black text-white leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
                {row.subject || 'Subject Pending'}
              </CardTitle>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-black/95 border-white/10 backdrop-blur-xl p-0 shadow-2xl overflow-hidden" align="end">
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <h4 className="font-black uppercase tracking-widest text-xs text-primary flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      Class Metadata
                    </h4>
                  </div>
                  <ScrollArea className="h-[300px] p-4">
                    <div className="space-y-4">
                      {Object.entries(row).map(([key, value]) => {
                        if (!value || typeof value !== 'string') return null;
                        return (
                          <div key={key} className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground block">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <p className="text-xs font-medium text-white/90 leading-relaxed">{value}</p>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            
            <CardDescription className="text-base font-bold text-accent flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {row.topic || 'General Topic'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-6 relative z-10">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-primary/10 transition-all duration-500">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-0.5">Primary Teacher</span>
              <span className="text-base font-bold text-white truncate">{row.teacher1 || 'Assigning...'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-2 font-bold uppercase tracking-tighter">
              <Clock className="h-4 w-4 text-primary" />
              {row.time || 'TBA'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = (rows: SheetRow[], emptyMessage: string, tabType: 'live' | 'archive') => {
    if (rows.length === 0) {
      return (
        <Card className="border-dashed py-24 text-center bg-secondary/10 border-white/10">
          <div className="max-w-[300px] mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-xl">System Standby</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{emptyMessage}</p>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rows.map((row, i) => renderCard(row, i, tabType))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="h-px flex-1 bg-white/5" />
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">Detailed Sync Matrix</h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="rounded-[2rem] border border-white/5 bg-secondary/20 overflow-hidden backdrop-blur-xl">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-white font-black uppercase tracking-widest text-[10px] py-6">Date</TableHead>
                  <TableHead className="text-white font-black uppercase tracking-widest text-[10px]">Topic</TableHead>
                  <TableHead className="text-white font-black uppercase tracking-widest text-[10px] text-center">Teacher Alignment</TableHead>
                  <TableHead className="text-white font-black uppercase tracking-widest text-[10px] text-center">Slide</TableHead>
                  <TableHead className="text-white font-black uppercase tracking-widest text-[10px] text-center">Title &amp; Caption</TableHead>
                  <TableHead className="text-white font-black uppercase tracking-widest text-[10px] text-center">Platform &amp; Cross Post</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => {
                  const status = getRowStatus(row);
                  const StatusIcon = ({ ready }: { ready: boolean }) => (
                    ready 
                      ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> 
                      : <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  );

                  return (
                    <TableRow 
                      key={i} 
                      id={`${tabType}-row-${i}`}
                      className="border-white/5 hover:bg-white/5 transition-colors duration-500 scroll-mt-24"
                    >
                      <TableCell className="font-bold text-xs text-muted-foreground py-4">{row.date}</TableCell>
                      <TableCell className="font-black text-white text-sm">{row.topic || 'N/A'}</TableCell>
                      <TableCell className="text-center"><StatusIcon ready={status.s1} /></TableCell>
                      <TableCell className="text-center"><StatusIcon ready={status.s2} /></TableCell>
                      <TableCell className="text-center"><StatusIcon ready={status.s3} /></TableCell>
                      <TableCell className="text-center"><StatusIcon ready={status.s4} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute -left-20 -bottom-20 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(255,165,0,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Real Time MONITORING</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
            Content Operations <br />
            <span className="text-primary italic">Live Class Monitoring Dashboard</span>
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-muted-foreground border-white/10 px-4 py-1.5 rounded-full font-bold">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              {liveTime ? format(liveTime, 'MMM do, yyyy') : '...'}
            </Badge>
            <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-muted-foreground border-white/10 px-4 py-1.5 rounded-full font-bold">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              BD Time: {liveTime ? format(liveTime, 'h:mm:ss a') : '...'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto relative z-10">
          <Button 
            onClick={loadData} 
            disabled={refreshing}
            variant="default"
            size="sm"
            className="w-full lg:w-auto bg-primary hover:bg-primary/80 text-primary-foreground font-black uppercase tracking-widest px-6 h-10 rounded-xl transition-all shadow-lg shadow-primary/10"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
            {refreshing ? 'Syncing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="flex w-fit bg-secondary/50 border border-white/10 p-1.5 rounded-2xl h-auto mb-10 mx-auto">
          <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300">
            <PlayCircle className="mr-2 h-4 w-4" />
            Upcoming Classes
          </TabsTrigger>
          <TabsTrigger value="archive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300">
            <Archive className="mr-2 h-4 w-4" />
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-12 animate-in zoom-in-95 duration-500">
          {/* Live Now Section */}
          <div className="space-y-6">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  Live Now
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Classes currently in progress (2-hour active window).
                </p>
              </div>
            </div>
            {liveNowRows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {liveNowRows.map((row, i) => renderCard(row, i, 'live'))}
              </div>
            ) : (
              <Card className="py-12 text-center bg-white/5 border-white/5 rounded-3xl">
                <p className="text-muted-foreground font-medium">No live classes available at this moment.</p>
              </Card>
            )}
          </div>

          {/* Upcoming Section */}
          <div className="space-y-8">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  {data?.isNextDayPreview ? "Tomorrow's Requirements" : "Today's Active Requirements"}
                  {data?.isNextDayPreview && <Badge className="bg-accent text-accent-foreground font-black text-[10px] px-3 py-1">PREVIEW</Badge>}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data?.isNextDayPreview 
                    ? "The 1 PM cutoff has passed. Showing tomorrow's operational data." 
                    : "Displaying all validated requirements for the current active day."}
                </p>
              </div>
            </div>
            {renderContent(data?.live || [], "The matrix is clear. No active requirements scheduled.", 'live')}
          </div>
        </TabsContent>

        <TabsContent value="archive" className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-black flex items-center gap-3">
                Historical View
                <Badge variant="outline" className="border-white/10 text-muted-foreground font-black text-[10px] px-3 py-1">ARCHIVED</Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                Showing archived data from: {data?.archiveDate ? format(new Date(data.archiveDate), 'PPPP') : 'Calculating Archive...'}
              </p>
            </div>
          </div>
          {renderContent(data?.archive || [], "No historical data detected.", 'archive')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
