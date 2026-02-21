'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDashboardData } from '@/app/actions/sheets';
import { SheetRow } from '@/lib/google-sheets';
import { StatusBadge } from './status-badge';
import { Loader2, RefreshCw, Archive, PlayCircle, Calendar, User, BookOpen, Clock, Tag, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function DashboardShell() {
  const [data, setData] = useState<{ live: SheetRow[]; archive: SheetRow[]; isNextDayPreview: boolean; currentTime: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (e) {
      console.error("Dashboard error:", e);
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

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Fetching data from Google Sheets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Class Dashboard</h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4 text-accent" />
              BD Time: {data ? format(new Date(data.currentTime), 'PPpp') : '...'}
            </p>
            <Badge variant="outline" className="border-primary/20 text-primary font-bold">
              <MapPin className="h-3 w-3 mr-1" /> Bangladesh
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={loadData} 
          disabled={refreshing}
          className="hover:bg-primary/5 border-primary/20 transition-all shadow-sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Sheet
        </Button>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 h-12 bg-muted/50 border shadow-sm p-1">
          <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all py-2 rounded-md">
            <PlayCircle className="mr-2 h-4 w-4" />
            Live Data
          </TabsTrigger>
          <TabsTrigger value="archive" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all py-2 rounded-md">
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {data?.isNextDayPreview ? "Next Session Requirements" : "Today's Schedule"}
                {data?.isNextDayPreview && <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">Post 1 PM Update</Badge>}
              </h3>
              <p className="text-sm text-muted-foreground">Showing requirements for {data?.isNextDayPreview ? "tomorrow" : "today"}.</p>
            </div>
          </div>

          {data?.live.length === 0 ? (
            <Card className="border-dashed py-24 text-center bg-muted/5">
              <div className="max-w-[300px] mx-auto space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">No active requirements found</h4>
                <p className="text-sm text-muted-foreground">Data for today might have moved to Archive if it's past 1 PM BD time.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.live.map((row, i) => (
                <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary overflow-hidden bg-white/95">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border-primary/10">
                        {row.productType || 'Requirement'}
                      </Badge>
                      <StatusBadge timeStr={row.time} />
                    </div>
                    <CardTitle className="text-lg font-bold text-primary leading-tight line-clamp-2">
                      {row.course}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 font-semibold text-accent/90">
                      <BookOpen className="h-3.5 w-3.5" />
                      {row.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-4">
                    <div className="p-3 bg-muted/30 rounded-lg border border-muted/50 group-hover:bg-muted/40 transition-colors">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Tag className="h-3 w-3" /> Topic
                      </p>
                      <p className="text-sm font-medium leading-relaxed line-clamp-2">
                        {row.topic || '---'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/20 p-2 rounded-md">
                      <div className="flex items-center gap-1.5 font-bold text-primary/80">
                        <Clock className="h-3.5 w-3.5" />
                        {row.time || 'TBA'}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-primary/[0.01] flex flex-col items-start gap-3">
                    <div className="flex items-center gap-3 w-full">
                       <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                         <User className="h-4 w-4 text-primary" />
                       </div>
                       <div className="flex flex-col min-w-0">
                         <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-tighter">Lead Teacher</span>
                         <span className="text-sm font-bold text-foreground truncate">{row.teacher1 || 'TBA'}</span>
                       </div>
                    </div>
                    {(row.teacher2 || row.teacher3) && (
                      <div className="pl-1 text-[10px] text-muted-foreground font-medium flex flex-col gap-1 w-full border-l-2 border-accent/20 ml-4 py-0.5">
                        {row.teacher2 && <div className="flex justify-between"><span>DS1:</span> <span className="font-bold text-foreground/80">{row.teacher2}</span></div>}
                        {row.teacher3 && <div className="flex justify-between"><span>DS2:</span> <span className="font-bold text-foreground/80">{row.teacher3}</span></div>}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archive">
          <Card className="border shadow-lg overflow-hidden bg-white">
            <CardHeader className="border-b bg-muted/10 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                    Completed Requirements
                  </CardTitle>
                  <CardDescription>Records of previous sessions. Past 1 PM classes move here automatically.</CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">{data?.archive.length || 0} Records</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[120px] font-bold text-[11px] uppercase tracking-wider">Date</TableHead>
                      <TableHead className="w-[120px] font-bold text-[11px] uppercase tracking-wider">Time</TableHead>
                      <TableHead className="font-bold text-[11px] uppercase tracking-wider">Course & Subject</TableHead>
                      <TableHead className="font-bold text-[11px] uppercase tracking-wider">Topic</TableHead>
                      <TableHead className="font-bold text-[11px] uppercase tracking-wider">Staff</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.archive.map((row, i) => (
                      <TableRow key={i} className="group hover:bg-primary/[0.02]">
                        <TableCell className="whitespace-nowrap font-bold text-xs text-muted-foreground">{row.date}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs font-medium">{row.time}</TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold text-primary/80 leading-tight">{row.course}</span>
                              <Badge variant="outline" className="w-fit text-[9px] h-4 py-0 font-bold bg-accent/5 border-accent/10 text-accent">{row.subject}</Badge>
                           </div>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate font-medium text-muted-foreground">
                          {row.topic}
                        </TableCell>
                        <TableCell className="text-xs">
                           <div className="flex flex-col gap-1">
                              <span className="font-bold">{row.teacher1 || '---'}</span>
                              {(row.teacher2 || row.teacher3) && (
                                <span className="text-[10px] text-muted-foreground italic">
                                  Includes support staff
                                </span>
                              )}
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data?.archive.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          No archived data found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
