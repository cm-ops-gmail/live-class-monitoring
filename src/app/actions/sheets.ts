'use server';

import { fetchSheetData, SheetRow } from '@/lib/google-sheets';
import { isAfter, isBefore, isSameDay, addDays, setHours, setMinutes, parse, isValid, startOfDay } from 'date-fns';

/**
 * Get current time in Bangladesh (UTC+6)
 */
function getBangladeshNow() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 6));
}

/**
 * Robust date parsing for spreadsheet strings
 * Specifically handles: "Friday, February 20, 2026"
 */
function parseSheetDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Clean string
  const cleanStr = dateStr.trim();

  // Try parsing the format "Friday, February 20, 2026" (EEEE, MMMM d, yyyy)
  const formats = [
    'EEEE, MMMM d, yyyy',
    'MMMM d, yyyy',
    'd-MMM-yy',
    'd/M/yyyy',
    'yyyy-MM-dd'
  ];

  for (const fmt of formats) {
    const parsed = parse(cleanStr, fmt, new Date());
    if (isValid(parsed)) return startOfDay(parsed);
  }

  // Fallback to native if above fails
  const native = new Date(cleanStr);
  if (isValid(native) && !isNaN(native.getTime())) return startOfDay(native);

  return null;
}

export async function getDashboardData() {
  const allData = await fetchSheetData();
  const nowBD = getBangladeshNow();
  
  // Normalize BD Today
  const bdTodayStart = startOfDay(nowBD);
  const bdTomorrowStart = addDays(bdTodayStart, 1);
  
  // Cutoff is exactly 1:00 PM Bangladesh Time
  const cutoffTime = setMinutes(setHours(bdTodayStart, 13), 0);
  const isAfterCutoff = isAfter(nowBD, cutoffTime);

  const liveRows: SheetRow[] = [];
  const archiveRows: SheetRow[] = [];

  // Target date for "Live" is today before 1 PM, and tomorrow (or next available) after 1 PM.
  // Note: If today is Feb 21 and it's 2 PM, Feb 21 data moves to Archive.
  const liveTargetDate = isAfterCutoff ? bdTomorrowStart : bdTodayStart;

  allData.forEach(row => {
    const rowDate = parseSheetDate(row.date);
    if (!rowDate) return; // Skip rows without valid dates

    const rowDayStart = startOfDay(rowDate);

    // If row date matches our target live date, it's live
    if (isSameDay(rowDayStart, liveTargetDate)) {
      liveRows.push(row);
    } 
    // If row date is before our current target, it's archive
    // (This includes today's data if it's past 1 PM)
    else if (isBefore(rowDayStart, liveTargetDate)) {
      archiveRows.push(row);
    }
    // Future dates beyond target remain hidden or could be filtered similarly
  });

  return {
    live: liveRows,
    archive: archiveRows.sort((a, b) => {
       const da = parseSheetDate(a.date)?.getTime() || 0;
       const db = parseSheetDate(b.date)?.getTime() || 0;
       return db - da; // Newest first
    }),
    isNextDayPreview: isAfterCutoff,
    currentTime: nowBD.toISOString()
  };
}
