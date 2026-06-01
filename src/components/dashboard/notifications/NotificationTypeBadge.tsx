
import React from "react";

interface NotificationTypeBadgeProps {
 type: 'email' | 'sms' | 'push' | 'in_app';
}

const NotificationTypeBadge: React.FC<NotificationTypeBadgeProps> = ({ type }) => {
 switch (type) {
 case 'email':
 return (
 <span className="text-primary text-xs px-1.5 py-0.5 bg-primary/10 rounded mr-2">Email</span>
 );
 case 'sms':
 return (
 <span className="text-success text-xs px-1.5 py-0.5 bg-success/10 rounded mr-2">SMS</span>
 );
 case 'push':
 return (
 <span className="text-primary text-xs px-1.5 py-0.5 bg-primary/10 rounded mr-2">Push</span>
 );
 case 'in_app':
 return (
 <span className="text-warning text-xs px-1.5 py-0.5 bg-warning/10 rounded mr-2">App</span>
 );
 default:
 return null;
 }
};

export default NotificationTypeBadge;
