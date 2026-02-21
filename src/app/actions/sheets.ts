'use server';

import { fetchSheetData, SheetRow } from '@/lib/google-sheets';
import { isAfter, isBefore, isSameDay, addDays, subDays, setHours, setMinutes, parse, isValid, startOfDay } from 'date-fns';

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
  
  const cleanStr = dateStr.trim();
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

  const native = new Date(cleanStr);
  if (isValid(native) && !isNaN(native.getTime())) return startOfDay(native);

  return null;
}

export async function getDashboardData() {
  const allData = await fetchSheetData();
  const nowBD = getBangladeshNow();
  
  const bdTodayStart = startOfDay(nowBD);
  const cutoffTime = setMinutes(setHours(bdTodayStart, 13), 0);
  const isAfterCutoff = isAfter(nowBD, cutoffTime);

  // If before 1 PM: Live is today, Archive is yesterday.
  // If after 1 PM: Live is tomorrow, Archive is today.
  const liveTargetDate = isAfterCutoff ? addDays(bdTodayStart, 1) : bdTodayStart;
  const archiveTargetDate = isAfterCutoff ? bdTodayStart : subDays(bdTodayStart, 1);

  const liveRows: SheetRow[] = [];
  const archiveRows: SheetRow[] = [];

  allData.forEach(row => {
    const rowDate = parseSheetDate(row.date);
    if (!rowDate) return;

    const rowDayStart = startOfDay(rowDate);

    if (isSameDay(rowDayStart, liveTargetDate)) {
      liveRows.push(row);
    } else if (isSameDay(rowDayStart, archiveTargetDate)) {
      archiveRows.push(row);
    }
  });

  return {
    live: liveRows,
    archive: archiveRows,
    isNextDayPreview: isAfterCutoff,
    currentTime: nowBD.toISOString()
  };
}
