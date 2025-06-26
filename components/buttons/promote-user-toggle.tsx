"use client";

import { Button } from "@/components/ui/button";
import { Shield, Crown } from "lucide-react";
import { useTransition } from "react";
import { toggleUserRole } from "@/app/actions/users";
import { toast } from "sonner"; // Assuming you're using sonner for toasts
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PromoteUserButtonProps {
  userId: string;
  userName: string;
  currentRole: string;
}

export function PromoteUserButton({ 
  userId, 
  userName, 
  currentRole 
}: PromoteUserButtonProps) {
  const [isPending, startTransition] = useTransition();
  
  // Only show button for USER role
  if (currentRole !== "USER") {
    return null;
  }

  const handlePromote = () => {
    startTransition(async () => {
      try {
        const result = await toggleUserRole(userId);
        
        if (result.status === "success") {
          toast.success(result.data?.message || "User promoted successfully!");
        } else {
          toast.error(result.data?.message || "Failed to promote user");
        }
      } catch (error) {
        console.error("Error promoting user:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Crown className="mr-2 h-4 w-4" />
          {isPending ? "Promoting..." : "Promote to Admin"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600" />
            Promote User to Admin
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p>
                Are you sure you want to promote <strong>{userName}</strong> to Admin role? 
                This will give them full administrative privileges including the ability to:
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                <li>Manage all users and students</li>
                <li>Access financial records</li>
                <li>Modify system settings</li>
                <li>Delete critical data</li>
              </ul>
              <p className="mt-2 font-medium text-orange-600">
                This action cannot be easily reversed.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePromote}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Promoting..." : "Yes, Promote to Admin"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}