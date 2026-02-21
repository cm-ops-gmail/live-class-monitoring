'use server';

import { fetchSheetData, SheetRow } from '@/lib/google-sheets';
import { isAfter, isBefore, isSameDay, addDays, startOfToday, setHours, setMinutes, parse } from 'date-fns';

/**
 * Get current time in Bangladesh (UTC+6)
 */
function getBangladeshNow() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 6));
}

/**
 * Robust date parsing for common spreadsheet formats
 */
function parseSheetDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try standard DD/MM/YYYY or D/M/YYYY
  const parts = dateStr.split(/[-/.]/);
  if (parts.length === 3) {
    const d = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    // Basic validation: if month > 12, it might be MM/DD/YYYY, but we prioritize DD/MM/YYYY
    if (m > 12) return new Date(y, d - 1, m);
    return new Date(y, m - 1, d);
  }
  
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export async function getDashboardData() {
  const allData = await fetchSheetData();
  const nowBD = getBangladeshNow();
  
  // Normalize BD Today
  const bdTodayStart = new Date(nowBD.getFullYear(), nowBD.getMonth(), nowBD.getDate());
  const bdTomorrowStart = addDays(bdTodayStart, 1);
  
  // Cutoff is exactly 1:00 PM Bangladesh Time
  const cutoffTime = setMinutes(setHours(bdTodayStart, 13), 0);
  const isAfterCutoff = isAfter(nowBD, cutoffTime);

  const liveRows: SheetRow[] = [];
  const archiveRows: SheetRow[] = [];

  // If before 1 PM, target is today. If after 1 PM, target is tomorrow.
  const targetDate = isAfterCutoff ? bdTomorrowStart : bdTodayStart;

  allData.forEach(row => {
    try {
      const rowDate = parseSheetDate(row.date);
      if (!rowDate) {
        archiveRows.push(row);
        return;
      }

      const rowDayStart = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());

      if (isSameDay(rowDayStart, targetDate)) {
        liveRows.push(row);
      } else if (isBefore(rowDayStart, targetDate)) {
        // This handles moving today's classes to archive after 1 PM 
        // because targetDate would have shifted to tomorrow.
        archiveRows.push(row);
      }
    } catch (e) {
      archiveRows.push(row);
    }
  });

  return {
    live: liveRows,
    archive: archiveRows.sort((a, b) => {
       const da = parseSheetDate(a.date)?.getTime() || 0;
       const db = parseSheetDate(b.date)?.getTime() || 0;
       return db - da;
    }),
    isNextDayPreview: isAfterCutoff,
    currentTime: nowBD.toISOString()
  };
}
