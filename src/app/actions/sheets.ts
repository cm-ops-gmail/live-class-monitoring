'use server';

import { fetchSheetData, SheetRow } from '@/lib/google-sheets';
import { isAfter, isBefore, isSameDay, addDays, startOfDay, parse, isValid } from 'date-fns';

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
    'EEEE, MMMM d, yyyy', // Friday, February 20, 2026
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
  const cutoffTime = new Date(bdTodayStart);
  cutoffTime.setHours(13, 0, 0, 0); // 1:00 PM BD Time

  const isAfterCutoff = isAfter(nowBD, cutoffTime);

  /**
   * Logical Requirements:
   * If before 1 PM: Live = Today.
   * If after 1 PM: Live = Tomorrow.
   */
  const liveTargetDate = isAfterCutoff ? addDays(bdTodayStart, 1) : bdTodayStart;

  // Process all rows to associate them with parsed dates
  const rowsWithDates = allData.map(row => ({
    row,
    parsedDate: parseSheetDate(row.date)
  })).filter(item => item.parsedDate !== null) as { row: SheetRow; parsedDate: Date }[];

  // 1. Live Data: Classes on the liveTargetDate
  const liveRows = rowsWithDates
    .filter(item => isSameDay(item.parsedDate, liveTargetDate))
    .map(item => item.row);

  // 2. Archive Data: Classes from the most recent day BEFORE the liveTargetDate
  // Get all unique dates strictly before the liveTargetDate
  const pastDates = Array.from(new Set(
    rowsWithDates
      .filter(item => isBefore(item.parsedDate, liveTargetDate))
      .map(item => item.parsedDate.getTime())
  )).sort((a, b) => b - a); // Sort descending (most recent first)

  const archiveRows: SheetRow[] = [];
  let actualArchiveDate = null;

  if (pastDates.length > 0) {
    const latestPastDate = new Date(pastDates[0]);
    actualArchiveDate = latestPastDate.toISOString();
    rowsWithDates
      .filter(item => isSameDay(item.parsedDate, latestPastDate))
      .forEach(item => archiveRows.push(item.row));
  }

  return {
    live: liveRows,
    archive: archiveRows,
    isNextDayPreview: isAfterCutoff,
    currentTime: nowBD.toISOString(),
    archiveDate: actualArchiveDate
  };
}
