
export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case "service":
      return "bg-blue-100 text-blue-800";
    case "supplier":
      return "bg-purple-100 text-purple-800";
    case "contractor":
      return "bg-orange-100 text-orange-800";
    case "consultant":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
