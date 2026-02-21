'use server';

import { fetchSheetData, SheetRow } from '@/lib/google-sheets';
import { isAfter, isBefore, isSameDay, addDays, setHours, setMinutes, parse, isValid } from 'date-fns';

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
 */
function parseSheetDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try native parsing first
  const d = new Date(dateStr);
  if (isValid(d) && !isNaN(d.getTime())) return d;

  // Handle formats like "21-Feb-25" or "21/02/2025"
  const mmmMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  
  const cleanStr = dateStr.replace(/,/g, '');
  const parts = cleanStr.split(/[-/.\s]+/);
  
  if (parts.length >= 2) {
    let day = parseInt(parts[0]);
    let monthStr = parts[1].toLowerCase().substring(0, 3);
    let year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();

    // Swapped DD-MMM and MMM-DD if necessary
    if (isNaN(day)) {
      monthStr = parts[0].toLowerCase().substring(0, 3);
      day = parseInt(parts[1]);
    }

    if (mmmMap[monthStr] !== undefined && !isNaN(day)) {
      if (year < 100) year += 2000;
      return new Date(year, mmmMap[monthStr], day);
    }
  }

  return null;
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

  // Target date for "Live" is today before 1 PM, and tomorrow after 1 PM.
  const liveTargetDate = isAfterCutoff ? bdTomorrowStart : bdTodayStart;

  allData.forEach(row => {
    const rowDate = parseSheetDate(row.date);
    if (!rowDate) {
      // If no date, put in archive as a fallback
      archiveRows.push(row);
      return;
    }

    const rowDayStart = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());

    if (isSameDay(rowDayStart, liveTargetDate)) {
      liveRows.push(row);
    } else if (isBefore(rowDayStart, liveTargetDate)) {
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
