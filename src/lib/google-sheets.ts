import { google } from 'googleapis';

const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
};

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const TAB_NAME = process.env.GOOGLE_TAB_NAME!;

export interface SheetRow {
  date: string;
  time: string; 
  productType: string;
  course: string;
  subject: string;
  topic: string;
  teacher1: string;
  teacher2: string;
  teacher3: string;
  teacherAlignment: string;
  slide: string;
  titleCaption: string;
  platformCrosspost: string;
  [key: string]: string;
}

export async function fetchSheetData(): Promise<SheetRow[]> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TAB_NAME}!A:Z`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    // Headers are in the second row (index 1)
    const headers = rows[1].map(h => h.toString().trim().toLowerCase());
    
    const dataRows = rows.slice(2).map(row => {
      const rowData: any = {};
      headers.forEach((header, index) => {
        const val = (row[index] || '').toString().trim();
        
        if (header.includes('date')) rowData.date = val;
        else if (header.includes('time')) rowData.time = val;
        else if (header.includes('product type')) rowData.productType = val;
        else if (header === 'course') rowData.course = val;
        else if (header === 'subject') rowData.subject = val;
        else if (header === 'topic') rowData.topic = val;
        else if (header === 'teacher 1') rowData.teacher1 = val;
        else if (header.includes('teacher 2') || header.includes('doubt solver 1')) rowData.teacher2 = val;
        else if (header.includes('teacher 3') || header.includes('doubt solver 2')) rowData.teacher3 = val;
        else if (header.includes('teacher alignment') || header.includes('teacher allignment')) rowData.teacherAlignment = val;
        else if (header === 'slide') rowData.slide = val;
        else if (header.includes('title & caption')) rowData.titleCaption = val;
        else if (header.includes('platform & cross post') || header.includes('platform & cros post')) rowData.platformCrosspost = val;
        
        rowData[header] = val;
      });
      return rowData as SheetRow;
    });

    return dataRows;
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    return [];
  }
}
