'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDashboardData } from '@/app/actions/sheets';
import { SheetRow } from '@/lib/google-sheets';
import { StatusBadge } from './status-badge';
import { Loader2, RefreshCw, Archive, PlayCircle, Calendar, User, BookOpen, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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
          <h2 className="text-3xl font-bold tracking-tight text-primary">Class Schedule</h2>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4 text-accent" />
            BD Time: {data ? format(new Date(data.currentTime), 'PPpp') : '...'}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadData} 
          disabled={refreshing}
          className="hover:bg-primary/5 border-primary/20 transition-all shadow-sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Sync Data
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
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {data?.isNextDayPreview ? "Next Session Preview" : "Current Active Session"}
                {data?.isNextDayPreview && <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">Post 1 PM Update</Badge>}
              </h3>
              <p className="text-sm text-muted-foreground">Showing classes for {data?.isNextDayPreview ? "tomorrow" : "today"}.</p>
            </div>
          </div>

          {data?.live.length === 0 ? (
            <Card className="border-dashed py-20 text-center">
              <p className="text-muted-foreground">No classes scheduled for this period.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.live.map((row, i) => (
                <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary overflow-hidden bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-muted/50">
                        {row.productType || 'Standard'}
                      </Badge>
                      <StatusBadge timeStr={row.time} />
                    </div>
                    <CardTitle className="text-lg font-bold text-primary leading-tight line-clamp-2">
                      {row.course}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 font-medium text-accent">
                      <BookOpen className="h-3 w-3" />
                      {row.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-4">
                    <div className="p-3 bg-muted/30 rounded-lg border border-muted/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tighter mb-1 flex items-center gap-1">
                        <Tag className="h-3 w-3" /> Topic
                      </p>
                      <p className="text-sm font-medium leading-relaxed line-clamp-3">
                        {row.topic || 'No topic specified'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {row.time}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-primary/[0.02] flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2 w-full">
                       <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                         <User className="h-4 w-4 text-primary" />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-bold text-muted-foreground">Lead Teacher</span>
                         <span className="text-sm font-bold text-foreground truncate">{row.teacher1 || 'TBA'}</span>
                       </div>
                    </div>
                    {(row.teacher2 || row.teacher3) && (
                      <div className="pl-10 text-[10px] text-muted-foreground italic flex flex-wrap gap-2">
                        {row.teacher2 && <span>DS1: {row.teacher2}</span>}
                        {row.teacher3 && <span>DS2: {row.teacher3}</span>}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archive">
          <Card className="border-none shadow-md bg-white/80">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-muted-foreground flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Completed Sessions
              </CardTitle>
              <CardDescription>Archive of previous class requirements. Past 1 PM classes move here.</CardDescription>
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
                      <TableHead>Teacher 1</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.archive.map((row, i) => (
                      <TableRow key={i} className="opacity-70 hover:opacity-100 transition-opacity">
                        <TableCell className="whitespace-nowrap font-medium text-xs">{row.date}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{row.time}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="text-sm font-semibold">{row.course}</span>
                              <span className="text-[10px] text-muted-foreground">{row.subject}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{row.topic}</TableCell>
                        <TableCell className="text-xs font-medium">
                           {row.teacher1 || '---'}
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
