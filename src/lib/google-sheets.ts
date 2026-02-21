import { google } from 'googleapis';

/**
 * Service Account Credentials
 * Priority: Environment Variables (Vercel/Production) -> Hardcoded Fallback
 */
const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID || "pelagic-range-466218-p1",
  private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCk38vIK+mRrLC6\nQNflraVEmv6ufxIzswb6RQZgAX4QFEP3Rlj+4oPMwjIdLHPXLRsKv9TfycjwJTfk\nYMsHK29Md5BnJ1Q1TNe5muh4bWZRAHW3zHOlAMYyewlU/aczGRBvc6k1gax4hzDB\nXpi8YnQEdfhwFsbBIH1CqxhoHzkEK73He2TpS/kzNBhtiK6Rtjmx2taH9wCTkYc9\nXvtE9/ZD6FxwargD80vPz8tn7WroyTXJKx0+rMf7OCnqgKgtKd0u3IRdXyffs2Iu\noCMoZB7HBm42bZ3WcyQlOuyC48MawnafvF3Z7lvGCADVq8isyplvkaDFRkCIP0FS\nOYstZveVAgMBAAECggEAESYH24+ZsSGtlgnFiumXPX4DjGHCImd2C9TfF2BAXOrG\nsPL7sbMcs1DlhnxHpjNWUzVlrkseH8A3QoVAyMOfRWxQNDJ2gz61V2RB1rjGQhmS\npOXah2h/tONwMotZdyqdt4HnsR2GM1kYXJx6tWlmGMquZvYvgQngjW0fUkEhHIpH\nNkCzFbUmV4Aq/t/MnqQ7ya3VUAO8DNIpBpLJ78F3Ryc6E6L7FTU/KiVYT7h+rTRy\nztZEhlN4//5FZoXPTpwwvVgTLq33e8UJOQjV6UVV465eF0tY21TZcO9uxdA6buoT\nXhMH4b83jSpOx/l0RdvPPvskpqdmFc3f3aBD27MUQQKBgQDix73F1seQfeEoBmjY\ndK94/hCQinRsHOqB0K+9g2dD1w+Ljthl8EPImi29upZ+ti4dza+PfgAWGQZ0tSLz\npO6OhFP+0b74Hw2uyNliytYJKlgcXXueXMtndd3cKOWXd/0AWSFfXXDL/7m4h17B\nCrZxD/Sfwzs0dkbZAMGgVq5OdQKBgQC6HhumFHrnz4mjsXlZ5jzfnTbnfIqO4mR6\nU8+J+WVRkF/qLiCOMmTbK2YPNuU51knls/kqK2iczBUTUAXZeK8BBJlwisZuXj//\n5XbfO4BVOy0UXMAK+roqscWXznj4Fb+ciidSzsWVKxeoy5Qh94PwYq2i4bSkCFuH\nrWtRYvUgoQKBgCcAYRPQP1wLOhjPGWL4lmEBmMmy9hjN1ErlIARAwBa7utGujGrj\nqlSqp2k02MMMA9xeTm4oJk2mmiSiLlOmrtxVx7hQTD6R4KGJq1FBPxQucx7VuPfg\nT58Id1JwuiOVoC5aJdIn2MlMvp0MsvASLpQ9QT3krp70JHUXmzU/ExUtAoGBALMG\nCPRcmMhnse555M9bjsxNTiWmfyTnkVy1R1lhQlsNc6UvT3NX9/l1qksSM7XJcPV5\ngz9T1+GS0Obtv2KrGjLxeKJvamV5VThRQWGCu3PAYyFGAhfNistMilL2cRe428G4\nhhC6AgX1GGHtyIRPsGLGmFynnHl37Ir6fdMgS8dhAoGBAKRrHpDuGNwuzzG2ocUG\n0plGxx/Efei9FesQNGMnnHRG2tVcRZzs0NFzwu/Q4hY1b2jTfsI88ZQ0Xr0nKC87\nUhOVYSXOd+4wvtMi1QllnViE36Wo0V230rg4QqVs5WndnHAkUTXQwnAqCwaEOqH7\AdIemxZqJ2/0pQnTLSSrygzI\n-----END PRIVATE KEY-----\n",
  client_email: process.env.GOOGLE_CLIENT_EMAIL || "requisition-dashboard-edit@pelagic-range-466218-p1.iam.gserviceaccount.com",
};

const SHEET_ID = '1kGU4EojCOQhvh2W4a0wH8HPS-xxwvoxejerCijUXPdY';
const TAB_NAME = 'Upcoming day requirements';

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
        
        // Exact mapping for the requested columns
        if (header === 'date' || header.includes('date')) rowData.date = val;
        else if (header === 'scheduled time' || header === 'time') rowData.time = val;
        else if (header === 'product type') rowData.productType = val;
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
