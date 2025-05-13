
import React from "react";

interface MemberAvatarProps {
  avatar: string;
  online?: boolean;
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({ avatar, online }) => {
  return (
    <div className="h-12 w-12 rounded-full bg-maintenease-100 text-maintenease-600 flex items-center justify-center font-bold text-lg relative">
      {avatar}
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

export default MemberAvatar;
