'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDashboardData } from '@/app/actions/sheets';
import { SheetRow } from '@/lib/google-sheets';
import { StatusBadge } from './status-badge';
import { Loader2, RefreshCw, Archive, PlayCircle, Calendar, User, BookOpen, Clock, Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rows.map((row, i) => {
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
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border-primary/20 px-3 py-1">
                        {row.productType || 'Requirement'}
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {row.course || 'Global Course'}
                      </span>
                    </div>
                    <StatusBadge timeStr={row.time} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CardTitle className="text-xl font-black text-white leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
                      {row.subject || 'Subject Pending'}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-sm font-bold text-accent flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        {row.topic || 'General Topic'}
                      </CardDescription>
                      
                      {allReady ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[10px] uppercase tracking-tighter">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Ready to go live
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500 font-black text-[10px] uppercase tracking-tighter animate-pulse">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Need Attention
                        </div>
                      )}
                    </div>
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
          })}
        </div>

        {/* Detailed Status Table */}
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
                    <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
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
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Central Command</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Sync <span className="text-primary italic">Intelligence</span>
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-muted-foreground border-white/10 px-4 py-1.5 rounded-full font-bold">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              {data ? format(new Date(data.currentTime), 'MMM do, yyyy') : '...'}
            </Badge>
            <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-muted-foreground border-white/10 px-4 py-1.5 rounded-full font-bold">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              BD Time: {data ? format(new Date(data.currentTime), 'HH:mm') : '...'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto relative z-10">
          <Button 
            onClick={loadData} 
            disabled={refreshing}
            className="w-full lg:w-auto bg-primary hover:bg-primary/80 text-primary-foreground font-black uppercase tracking-widest px-8 py-6 h-auto rounded-2xl transition-all shadow-xl shadow-primary/10"
          >
            <RefreshCw className={cn("mr-3 h-5 w-5", refreshing && "animate-spin")} />
            {refreshing ? 'Syncing...' : 'Refresh Matrix'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="flex w-fit bg-secondary/50 border border-white/10 p-1.5 rounded-2xl h-auto mb-10 mx-auto">
          <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300">
            <PlayCircle className="mr-2 h-4 w-4" />
            Live Matrix
          </TabsTrigger>
          <TabsTrigger value="archive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300">
            <Archive className="mr-2 h-4 w-4" />
            Historical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-8 animate-in zoom-in-95 duration-500">
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