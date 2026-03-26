const monthMap = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec"
};

const normalizeToken = (token) => {
  if (!token) return "";
  return String(token).trim();
};

export const formatDate = (value) => {
  const token = normalizeToken(value);
  if (!token) return "";
  if (/^\d{4}$/.test(token)) return token;
  if (/^\d{4}-\d{2}$/.test(token)) {
    const [year, month] = token.split("-");
    return `${monthMap[month] ?? month} ${year}`;
  }
  return token;
};

export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate) || "Present";
  if (!start && !end) return "";
  if (!start) return end;
  return `${start} - ${end}`;
};
