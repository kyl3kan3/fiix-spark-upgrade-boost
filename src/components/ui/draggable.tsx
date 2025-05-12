
import React, { useState, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DraggableProps {
  children: ReactNode;
  className?: string;
  key?: string | number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const Draggable: React.FC<DraggableProps> = ({
  children,
  className,
  key,
  onDragStart,
  onDragEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={nodeRef}
      key={key}
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        if (onDragStart) onDragStart();
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        if (onDragEnd) onDragEnd();
      }}
      className={cn(
        "cursor-move",
        isDragging && "opacity-50",
        className
      )}
    >
      {children}
    </div>
  );
};
