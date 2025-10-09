// utils/dateFormatter.ts
export const formatDate = (dateString: string | Date | ""): string => {
  if (dateString == "" || dateString == undefined){
    return ""
  }
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day || ""}-${month || ""}-${year || ""}`;
};