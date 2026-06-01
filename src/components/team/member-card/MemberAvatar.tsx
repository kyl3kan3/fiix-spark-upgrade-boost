
import React from "react";

interface MemberAvatarProps {
 avatar: string | null;
 online?: boolean;
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({ avatar, online }) => {
 return (
 <div className="relative shrink-0 mb-1">
 <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-2 border-primary/20">
 {avatar}
 </div>
 {online !== undefined && (
 <span
 className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-card ${online ? "bg-success" : "bg-muted-foreground"}`}
 />
 )}
 </div>
 );
};

export default MemberAvatar;
