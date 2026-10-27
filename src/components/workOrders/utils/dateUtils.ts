
export const formatDate = (dateString: string | null) => {
 if (!dateString) return "—";
 const date = new Date(dateString);
 return new Intl.DateTimeFormat("en-US", {
 year: "numeric",
 month: "short",
 day: "numeric",
 hour: "numeric",
 minute: "numeric"
 }).format(date);
};

/** Date-only display for work order due dates (no time). */
export const formatDateOnly = (dateString: string | null) => {
 if (!dateString) return "—";
 const date = new Date(dateString);
 return new Intl.DateTimeFormat("en-US", {
 year: "numeric",
 month: "short",
 day: "numeric",
 }).format(date);
};
