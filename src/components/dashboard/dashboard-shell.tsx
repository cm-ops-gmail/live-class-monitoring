'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDashboardData } from '@/app/actions/sheets';
import { SheetRow } from '@/lib/google-sheets';
import { StatusBadge } from './status-badge';
import { Loader2, RefreshCw, Archive, PlayCircle, Calendar, ClipboardList, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export function DashboardShell() {
  const [data, setData] = useState<{ live: SheetRow[]; archive: SheetRow[]; isNextDayPreview: boolean; currentTime: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const result = await getDashboardData();
    setData(result);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000); // Auto-refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Class Schedule Dashboard</h2>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            Bangladesh Time: {data ? format(new Date(data.currentTime), 'PPpp') : '...'}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadData} 
          disabled={refreshing}
          className="hover:bg-primary/5 transition-colors shadow-sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Sync Sheet
        </Button>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6 h-12 bg-white/50 border shadow-sm">
          <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all py-2">
            <PlayCircle className="mr-2 h-4 w-4" />
            Live Data
          </TabsTrigger>
          <TabsTrigger value="archive" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all py-2">
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card className="border-none shadow-md overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    {data?.isNextDayPreview ? "Next Day's Schedule (Updated)" : "Today's Live Classes"}
                  </CardTitle>
                  <CardDescription>
                    {data?.isNextDayPreview 
                      ? "Upcoming classes for the next session (Post 1 PM Update)" 
                      : "Active scheduled classes for today"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data?.live.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No live data available for the current period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-bold">Time</TableHead>
                        <TableHead className="font-bold">Course / Subject</TableHead>
                        <TableHead className="font-bold">Topic</TableHead>
                        <TableHead className="font-bold">Teachers</TableHead>
                        <TableHead className="text-right font-bold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.live.map((row, i) => (
                        <TableRow key={i} className="hover:bg-accent/5 group transition-colors">
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex flex-col">
                              <span>{row.time}</span>
                              <span className="text-[10px] text-muted-foreground uppercase">{row.productType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-primary">{row.course}</span>
                              <span className="text-xs text-muted-foreground">{row.subject}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{row.topic}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-xs">
                              {row.teacher1 && <div className="flex items-center gap-1"><User className="h-3 w-3" /> {row.teacher1}</div>}
                              {row.teacher2 && <div className="text-muted-foreground italic">DS1: {row.teacher2}</div>}
                              {row.teacher3 && <div className="text-muted-foreground italic">DS2: {row.teacher3}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <StatusBadge timeStr={row.time} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive">
          <Card className="border-none shadow-md bg-white/80">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-muted-foreground flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archive
              </CardTitle>
              <CardDescription>History of previous class requirements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Course/Subject</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Teachers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.archive.map((row, i) => (
                      <TableRow key={i} className="opacity-70 hover:opacity-100 transition-opacity">
                        <TableCell className="whitespace-nowrap font-medium text-xs">{row.date}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{row.time}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="text-sm">{row.course}</span>
                              <span className="text-[10px]">{row.subject}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{row.topic}</TableCell>
                        <TableCell className="text-[10px]">
                           {row.teacher1}{row.teacher2 ? ` / ${row.teacher2}` : ''}
                        </TableCell>
                      </TableRow>
                    ))}
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
