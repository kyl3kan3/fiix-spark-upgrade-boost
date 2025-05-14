
import React from "react";

interface NotificationTypeBadgeProps {
  type: 'email' | 'sms' | 'push' | 'in_app';
}

const NotificationTypeBadge: React.FC<NotificationTypeBadgeProps> = ({ type }) => {
  switch (type) {
    case 'email':
      return (
        <span className="text-blue-500 text-xs px-1.5 py-0.5 bg-blue-100 rounded mr-2">Email</span>
      );
    case 'sms':
      return (
        <span className="text-green-500 text-xs px-1.5 py-0.5 bg-green-100 rounded mr-2">SMS</span>
      );
    case 'push':
      return (
        <span className="text-purple-500 text-xs px-1.5 py-0.5 bg-purple-100 rounded mr-2">Push</span>
      );
    case 'in_app':
      return (
        <span className="text-orange-500 text-xs px-1.5 py-0.5 bg-orange-100 rounded mr-2">App</span>
      );
    default:
      return null;
  }
};

export default NotificationTypeBadge;
