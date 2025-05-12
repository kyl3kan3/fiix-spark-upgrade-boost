
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatUser } from "@/types/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface UserListProps {
  users: ChatUser[];
  selectedUser: ChatUser | null;
  onSelectUser: (user: ChatUser) => void;
  loading: boolean;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  selectedUser, 
  onSelectUser,
  loading 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Sort users with unread messages first
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => b.unread - a.unread);
  }, [filteredUsers]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-2 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                    selectedUser?.id === user.id 
                      ? "bg-maintenease-100" 
                      : user.unread > 0 
                        ? "bg-maintenease-50 hover:bg-maintenease-100" 
                        : "hover:bg-gray-100"
                  }`}
                  onClick={() => onSelectUser(user)}
                >
                  <div className="h-10 w-10 rounded-full bg-maintenease-100 text-maintenease-600 flex items-center justify-center font-bold text-sm mr-2">
                    {user.avatar || user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium truncate ${user.unread > 0 ? "text-maintenease-800 font-semibold" : ""}`}>
                        {user.name}
                      </p>
                      {user.unread > 0 && (
                        <Badge variant="default" className="ml-2 bg-maintenease-600">
                          {user.unread}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      {user.unread > 0 ? (
                        <MessageCircle className="h-3 w-3 text-maintenease-600 mr-1" />
                      ) : (
                        <Circle className="h-3 w-3 text-gray-400 mr-1" />
                      )}
                      <span className="truncate">{user.role}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                {searchQuery ? "No users found" : "No team members available"}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default UserList;
