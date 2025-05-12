
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatUser } from "@/types/chat";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      
      <h3 className="text-sm font-medium mb-2">Team Members</h3>
      
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center p-2 rounded cursor-pointer ${
                    selectedUser?.id === user.id ? "bg-maintenease-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => onSelectUser(user)}
                >
                  <div className="h-10 w-10 rounded-full bg-maintenease-100 text-maintenease-600 flex items-center justify-center font-bold text-sm mr-2">
                    {user.avatar || user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{user.name}</p>
                      {user.unread > 0 && (
                        <span className="ml-2 bg-maintenease-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {user.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      {user.online ? (
                        <UserCheck className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <Circle className="h-3 w-3 text-gray-400 mr-1" />
                      )}
                      <span className="truncate">{user.role}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No users found</div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default UserList;
