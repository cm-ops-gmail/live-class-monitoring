'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Syncing with Google Sheets...</p>
      </div>
    );
  }

  const renderCardGrid = (rows: SheetRow[], emptyMessage: string) => {
    if (rows.length === 0) {
      return (
        <Card className="border-dashed py-24 text-center bg-muted/5">
          <div className="max-w-[300px] mx-auto space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground">No data found</h4>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rows.map((row, i) => (
          <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary overflow-hidden bg-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border-primary/10">
                  {row.productType || 'Session'}
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
            <CardFooter className="pt-4 border-t bg-primary/[0.01]">
              <div className="flex items-center gap-3 w-full">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-tighter">Teacher 1</span>
                  <span className="text-sm font-bold text-foreground truncate">{row.teacher1 || 'TBA'}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Requirement Dashboard</h2>
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
          <div className="space-y-1">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              {data?.isNextDayPreview ? "Next Day Schedule" : "Current Session Requirements"}
              {data?.isNextDayPreview && <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">Preview Mode</Badge>}
            </h3>
            <p className="text-sm text-muted-foreground">
              Status: {data?.isNextDayPreview ? "Displaying tomorrow's requirements" : "Displaying today's active requirements"}
            </p>
          </div>
          {renderCardGrid(data?.live || [], "No requirements found for the active session.")}
        </TabsContent>

        <TabsContent value="archive" className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              Previous Requirements Archive
              <Badge variant="outline" className="text-muted-foreground">Historical View</Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Displaying the most recently completed session's data.
            </p>
          </div>
          {renderCardGrid(data?.archive || [], "No archived data found for the previous session.")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
