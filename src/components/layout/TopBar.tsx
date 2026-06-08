import React from "react";
import { Search, Bell, HelpCircle } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export default function TopBar() {
  return (
    <header className="h-14 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge core..."
            className="pl-9 h-8 bg-secondary/30 border-transparent focus:bg-secondary/50 focus:border-border transition-all w-full max-w-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-tariro-indigo shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        </Button>
      </div>
    </header>
  );
}
