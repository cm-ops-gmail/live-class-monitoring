
'use server';

import { fetchSheetData, SheetRow } from '@/lib/google-sheets';
import { parse, isAfter, isBefore, isSameDay, addDays, startOfToday, setHours, setMinutes } from 'date-fns';

export async function getDashboardData() {
  const allData = await fetchSheetData();
  const now = new Date();
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const cutoffTime = setMinutes(setHours(today, 13), 0); // 1 PM

  const isAfterCutoff = isAfter(now, cutoffTime);

  const liveRows: SheetRow[] = [];
  const archiveRows: SheetRow[] = [];

  allData.forEach(row => {
    try {
      // Assuming date format in sheet is something parseable like MM/DD/YYYY or DD/MM/YYYY
      // We'll try common formats or just basic Date parsing
      const rowDate = new Date(row.date);
      if (isNaN(rowDate.getTime())) return;

      if (!isAfterCutoff) {
        // Before 1 PM: Live = Today
        if (isSameDay(rowDate, today)) {
          liveRows.push(row);
        } else if (isBefore(rowDate, today)) {
          archiveRows.push(row);
        }
      } else {
        // After 1 PM: Live = Tomorrow, Today moves to Archive
        if (isSameDay(rowDate, tomorrow)) {
          liveRows.push(row);
        } else if (isBefore(rowDate, tomorrow) || isSameDay(rowDate, today)) {
          archiveRows.push(row);
        }
      }
    } catch (e) {
      // If date parsing fails, skip or move to archive
      archiveRows.push(row);
    }
  });

  return {
    live: liveRows,
    archive: archiveRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    isNextDayPreview: isAfterCutoff
  };
}
