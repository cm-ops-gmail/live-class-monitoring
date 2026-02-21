
'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { parse, isWithinInterval, setHours, setMinutes, startOfToday } from 'date-fns';

interface StatusBadgeProps {
  timeStr: string;
}

export function StatusBadge({ timeStr }: StatusBadgeProps) {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      try {
        const now = new Date();
        // Assume timeStr format is like "10:00 AM - 11:00 AM" or similar
        const parts = timeStr.split('-').map(p => p.trim());
        if (parts.length < 1) return;

        const startTimeParts = parts[0].match(/(\d+):(\d+)\s*(AM|PM)/i);
        const endTimeParts = parts[1]?.match(/(\d+):(\d+)\s*(AM|PM)/i);

        if (!startTimeParts) return;

        let startHour = parseInt(startTimeParts[1]);
        const startMin = parseInt(startTimeParts[2]);
        const startAmPm = startTimeParts[3].toUpperCase();

        if (startAmPm === 'PM' && startHour < 12) startHour += 12;
        if (startAmPm === 'AM' && startHour === 12) startHour = 0;

        const startTime = setMinutes(setHours(startOfToday(), startHour), startMin);

        let endTime;
        if (endTimeParts) {
          let endHour = parseInt(endTimeParts[1]);
          const endMin = parseInt(endTimeParts[2]);
          const endAmPm = endTimeParts[3].toUpperCase();
          if (endAmPm === 'PM' && endHour < 12) endHour += 12;
          if (endAmPm === 'AM' && endHour === 12) endHour = 0;
          endTime = setMinutes(setHours(startOfToday(), endHour), endMin);
        } else {
          // If no end time, assume 1 hour duration
          endTime = setHours(startTime, startTime.getHours() + 1);
        }

        setIsLive(isWithinInterval(now, { start: startTime, end: endTime }));
      } catch (e) {
        setIsLive(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [timeStr]);

  if (!isLive) return null;

  return (
    <Badge variant="default" className="bg-accent text-accent-foreground animate-pulse border-none">
      LIVE NOW
    </Badge>
  );
}
