"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getPotentialManagers,
  assignManager,
} from "@/services/employeeService";
import { ChevronsUpDown } from "lucide-react";

interface Manager {
  id: string;
  email: string;
  profile: { firstName: string; lastName: string; department: string } | null;
}

interface AssignManagerFormProps {
  employeeId: string;
  onSuccess: () => void;
}

export function AssignManagerForm({
  employeeId,
  onSuccess,
}: AssignManagerFormProps) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getPotentialManagers().then((allManagers) => {
      const filteredManagers = allManagers.filter(
        (manager: { id: string }) => manager.id !== employeeId
      );
      setManagers(filteredManagers);
    });
  }, []);

  const handleAssign = () => {
    if (!selectedManager) {
      toast.error("Please select a manager.");
      return;
    }
    const promise = assignManager(employeeId, selectedManager.id);
    toast.promise(promise, {
      loading: "Assigning manager...",
      success: () => {
        onSuccess();
        return "Manager assigned successfully!";
      },
      error: "Failed to assign manager.",
    });
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedManager
              ? `${selectedManager.profile?.firstName} ${selectedManager.profile?.lastName}`
              : "Select a manager..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search managers..." />
            <CommandList>
              <CommandEmpty>No manager found.</CommandEmpty>
              <CommandGroup>
                {managers.map((manager) => (
                  <CommandItem
                    key={manager.id}
                    value={`${manager.profile?.firstName} ${manager.profile?.lastName} ${manager.email}`}
                    onSelect={() => {
                      setSelectedManager(manager);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {manager.profile?.firstName} {manager.profile?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {manager.email} - {manager.profile?.department}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button onClick={handleAssign} className="w-full">
        Confirm Assignment
      </Button>
    </div>
  );
}
