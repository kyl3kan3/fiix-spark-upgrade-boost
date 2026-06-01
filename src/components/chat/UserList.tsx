
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from "lucide-react";
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

const UserList: React.FC<UserListProps> = ({ users, selectedUser, onSelectUser, loading }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Sort users with unread messages first
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => b.unread - a.unread);
  }, [filteredUsers]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 bg-background border-border focus-visible:ring-primary/30 text-sm"
        />
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-1">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors text-left ${
                    selectedUser?.id === user.id
                      ? "bg-primary/10 border border-primary/20"
                      : user.unread > 0
                      ? "bg-primary/5 hover:bg-primary/10 border border-transparent"
                      : "hover:bg-muted border border-transparent"
                  }`}
                  onClick={() => onSelectUser(user)}
                >
                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                    {user.avatar || user.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Name + role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-sm truncate font-medium ${
                          selectedUser?.id === user.id
                            ? "text-primary"
                            : user.unread > 0
                            ? "text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {user.name}
                      </p>
                      {user.unread > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4 shrink-0">
                          {user.unread}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {user.unread > 0 ? (
                        <MessageCircle className="h-3 w-3 text-primary shrink-0" />
                      ) : null}
                      <span className="truncate">{user.role}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
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
