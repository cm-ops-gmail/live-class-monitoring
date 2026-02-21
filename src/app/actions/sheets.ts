'use server';

import { fetchSheetData, SheetRow } from '@/lib/google-sheets';
import { isAfter, isBefore, isSameDay, addDays, startOfToday, setHours, setMinutes, parse } from 'date-fns';

/**
 * Get current time in Bangladesh (UTC+6)
 */
function getBangladeshNow() {
  const now = new Date();
  // Bangladesh is UTC+6
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 6));
}

export async function getDashboardData() {
  const allData = await fetchSheetData();
  const nowBD = getBangladeshNow();
  
  // Today and Tomorrow in Bangladesh
  const todayBD = startOfToday();
  // Note: startOfToday() uses local system time, but for logic we need to 
  // ensure we are comparing "dates" relative to the BD context.
  // We'll normalize the BD now to its date start.
  const bdTodayStart = new Date(nowBD.getFullYear(), nowBD.getMonth(), nowBD.getDate());
  const bdTomorrowStart = addDays(bdTodayStart, 1);
  
  // Cutoff is 1 PM Bangladesh Time
  const cutoffTime = setMinutes(setHours(bdTodayStart, 13), 0);
  const isAfterCutoff = isAfter(nowBD, cutoffTime);

  const liveRows: SheetRow[] = [];
  const archiveRows: SheetRow[] = [];

  // Determine the "Live" date based on the 1 PM rule
  const targetDate = isAfterCutoff ? bdTomorrowStart : bdTodayStart;

  allData.forEach(row => {
    try {
      if (!row.date) return;
      
      // Attempt to parse date from sheet (handling various formats like DD/MM/YYYY)
      // We'll try common delimiters
      const dateParts = row.date.split(/[-/.]/);
      let rowDate: Date;
      
      if (dateParts.length === 3) {
        // Assume DD/MM/YYYY or MM/DD/YYYY - we'll try to be smart
        // If first part > 12, it's definitely DD
        const d1 = parseInt(dateParts[0]);
        const d2 = parseInt(dateParts[1]);
        const d3 = parseInt(dateParts[2]);
        
        if (d1 > 12) {
          rowDate = new Date(d3, d2 - 1, d1); // DD/MM/YYYY
        } else {
          // Ambiguous, but let's assume DD/MM/YYYY as it's common in BD/Global
          rowDate = new Date(d3, d2 - 1, d1);
        }
      } else {
        rowDate = new Date(row.date);
      }

      if (isNaN(rowDate.getTime())) {
        archiveRows.push(row);
        return;
      }

      // Normalize rowDate to start of day for comparison
      const rowDayStart = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());

      if (isSameDay(rowDayStart, targetDate)) {
        liveRows.push(row);
      } else if (isBefore(rowDayStart, targetDate)) {
        archiveRows.push(row);
      } else {
        // Future dates (beyond tomorrow if we are in tomorrow preview)
        // For now, let's keep them out of Live/Archive or treat as future live
        // The user specifically asked for "next day's data" in Live
      }
    } catch (e) {
      archiveRows.push(row);
    }
  });

  return {
    live: liveRows,
    archive: archiveRows.sort((a, b) => {
       const da = new Date(a.date).getTime();
       const db = new Date(b.date).getTime();
       return db - da;
    }),
    isNextDayPreview: isAfterCutoff,
    currentTime: nowBD.toISOString()
  };
}
