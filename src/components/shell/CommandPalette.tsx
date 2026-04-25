import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { NAV_ITEMS, NAV_GROUPS } from "./navConfig";
import { Plus } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CREATE_ACTIONS = [
  { label: "New Work Order",  href: "/work-orders/new", code: "WO+"  },
  { label: "New Inspection",  href: "/inspections/new", code: "INS+" },
  { label: "New Asset",       href: "/assets/new",      code: "AST+" },
  { label: "New Vendor",      href: "/vendors/new",     code: "VND+" },
  { label: "New Checklist",   href: "/checklists/new",  code: "CHK+" },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Create">
          {CREATE_ACTIONS.map((a) => (
            <CommandItem key={a.href} onSelect={() => go(a.href)} className="font-sans">
              <Plus className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="flex-1">{a.label}</span>
              <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{a.code}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {NAV_GROUPS.map((groupName) => (
          <CommandGroup key={groupName} heading={groupName}>
            {NAV_ITEMS.filter((i) => i.group === groupName).map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.href} onSelect={() => go(item.href)} className="font-sans">
                  <Icon className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="flex-1">{item.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{item.code}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
