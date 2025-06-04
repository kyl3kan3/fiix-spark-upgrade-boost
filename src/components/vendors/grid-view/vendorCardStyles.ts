
export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    case "suspended":
      return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  }
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case "service":
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    case "supplier":
      return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
    case "contractor":
      return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100";
    case "consultant":
      return "bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  }
};
