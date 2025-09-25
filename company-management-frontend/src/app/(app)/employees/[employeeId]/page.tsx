"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getEmployeeProfileById } from "@/services/employeeService"; // We will create this
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO } from "date-fns";

// Define the shape of the data we expect
interface ProfileData {
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string | null;
    address: string | null;
    emergencyContact: string | null;
    dateOfJoining: string;
  } | null;
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const employeeId = params.employeeId as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (employeeId) {
        try {
          const data = await getEmployeeProfileById(employeeId);
          setProfile(data);
        } catch (error) {
          console.error("Failed to fetch employee profile", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchProfile();
  }, [employeeId]);

  if (isLoading) {
    return <div className="text-center">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center">Employee not found.</div>;
  }

  const { firstName = "", lastName = "" } = profile.profile || {};
  const fallback =
    (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "??";

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-3xl">{fallback}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {firstName} {lastName}
          </h1>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Role</p>
              <p>{profile.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date of Joining</p>
              <p>
                {profile.profile
                  ? format(
                      parseISO(profile.profile.dateOfJoining),
                      "dd MMM, yyyy"
                    )
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p>{profile.profile?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Address</p>
              <p>{profile.profile?.address || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium">Emergency Contact</p>
              <p>{profile.profile?.emergencyContact || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
