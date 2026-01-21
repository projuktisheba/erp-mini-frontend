export function formatDate(dateInput: string | Date): string {
  const date = new Date(dateInput); // keeps local date

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}


// Function to generate the current user's local timezone offset string (e.g., "+06:00")
export const getTimezoneOffset = () => {
    // getTimezoneOffset() returns the difference in minutes between UTC and local time
    // For UTC+6, it returns -360. We need to flip the sign.
    const offset = new Date().getTimezoneOffset(); 
    const sign = offset < 0 ? "+" : "-"; 
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    
    // Format as required: +HH:MM or -HH:MM
    const formattedOffset = `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return formattedOffset;
};