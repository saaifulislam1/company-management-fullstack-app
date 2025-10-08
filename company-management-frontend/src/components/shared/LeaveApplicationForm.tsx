"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import * as leaveService from "@/services/leaveService";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";

// Define the form validation schema using Zod
const formSchema = z.object({
  leaveType: z.string().min(1, "Leave type is required"),
  startDate: z.date().refine((val) => val !== null, {
    message: "Start date is required",
  }),
  endDate: z.date().refine((val) => val !== null, {
    message: "End date is required",
  }),
  attachment: z.any().optional(),
  reason: z.string().min(3, "Reason must be at least 3 characters long"),
});

// The component receives functions to call on success and to close the dialog
interface LeaveApplicationFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function LeaveApplicationForm({
  onSuccess,
  onClose,
}: LeaveApplicationFormProps) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        // 500KB
        setFileError("File is too large (max 500KB)");
        setFilePreview(null);
        form.setValue("attachment", undefined);
        return;
      }
      setFileError(null);
      setFilePreview(URL.createObjectURL(file));
      form.setValue("attachment", file);
    }
  };
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formData.append(key, value as any);
          }
        }
      });

      await leaveService.applyForLeave(formData);
      toast("Your leave request has been submitted.");
      onSuccess(); // Trigger data refresh on the parent page
      onClose(); // Close the dialog
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast("Submission Failed");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="leaveType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a leave type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="VACATION">Vacation</SelectItem>
                  <SelectItem value="SICK">Sick Leave</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4">
          {/* Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < startOfDay(new Date())}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < startOfDay(new Date())}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide a reason for your leave..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attachment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachment (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </FormControl>
              {fileError && (
                <p className="text-sm text-destructive">{fileError}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        {filePreview && (
          <img
            src={filePreview}
            alt="Attachment preview"
            className="mt-2 h-24 w-24 object-cover rounded-md"
          />
        )}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
