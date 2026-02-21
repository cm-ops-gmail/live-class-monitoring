# **App Name**: SheetSync Dashboard

## Core Features:

- Google Sheets Integration: Connects to the specified Google Sheet (https://docs.google.com/spreadsheets/d/1kGU4EojCOQhvh2W4a0wH8HPS-xxwvoxejerCijUXPdY/edit?gid=0#gid=0) using the provided service account (Fahad requisition-dashboard-edit@pelagic-range-466218-p1.iam.gserviceaccount.com) to fetch data.
- Real-time Data Display: Displays data from the 'Upcoming day requirements' tab in a clear, tabular format.
- Live/Archive Tab Navigation: Allows users to switch between 'Live Data' and 'Archive' views using tabs.
- Automatic Data Archiving: Automatically moves data from the 'Live Data' view to the 'Archive' view after 1 PM each day.
- Live Class Highlighting: Highlights classes in the 'Live Data' view when the current time matches the class time.

## Style Guidelines:

- Primary color: Dark blue (#3F51B5) to convey a sense of stability and professionalism.
- Background color: Light gray (#F0F0F0) for a clean and neutral backdrop.
- Accent color: Soft amber (#FFB300) for interactive elements and to highlight the 'Live' classes.
- Body and headline font: 'Inter', a sans-serif font, for a clean and modern dashboard look. 
- Use simple, outline-style icons to represent different data categories or actions.
- Use a clean and structured layout with clear separation of sections for 'Live Data' and 'Archive'. Utilize cards or similar UI elements to present data in a digestible manner.
- Use subtle transitions and animations to provide feedback on user interactions (e.g., tab switching, data updates).