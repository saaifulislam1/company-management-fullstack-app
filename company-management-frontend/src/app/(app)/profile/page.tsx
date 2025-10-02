"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { updateMyProfile } from "@/services/employeeService";
import { getMyProfile } from "@/services/authService";
import toast from "react-hot-toast"; // 1. Import from react-hot-toast
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the validation schema for the fields we can update
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const [managerName, setManagerName] = useState<string>(
    "No manager assigned yet"
  );

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      emergencyContact: "",
    },
  });

  // Fetch the user's full profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profileData = await getMyProfile();
          const profile = profileData.data.profile || {};
          setManagerName(
            profileData.data.manager.profile.firstName +
              " " +
              profileData.data.manager.profile.lastName
          );
          console.log(
            profileData.data.manager.profile.firstName,
            "profiledata"
          );

          form.reset({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            phone: profile.phone || "",
            address: profile.address || "",
            emergencyContact: profile.emergencyContact || "",
          });
        } catch (error) {
          // 2. Use react-hot-toast for errors
          toast.error("Failed to fetch profile data.");
        }
      }
    };
    fetchProfile();
  }, [user, form]);

  // Handle the form submission
  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      console.log(values, "Form values");
      await updateMyProfile(values);
      // 3. Use react-hot-toast for success
      toast.success("Your profile has been updated.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // 4. Use react-hot-toast for submission errors
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Jane Doe - 01XXXXXXXXX"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.role || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Manager Name</Label>
                  <Input value={managerName || ""} disabled />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
