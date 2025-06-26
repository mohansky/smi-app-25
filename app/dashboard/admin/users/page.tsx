// app/dashboard/admin/users/page.tsx
import { getAllUsers } from "@/app/actions/users";
import { CustomDataTable } from "@/components/custom-ui/custom-data-table";
import StudentDetailsLoading from "@/components/skeletons/student-details-skeleton";
import { Suspense } from "react";
import { usersColumns } from "@/components/columns/users-columns";

export default async function UsersPage() {
  const result = await getAllUsers();
  
  if (result.success && result.data) {
    // Transform the data to ensure proper typing and format
    const transformedUsers = result.data
      .filter((user) => user.name && user.email) // Filter out users with null name or email
      .map((user) => ({
        id: user.id,
        name: user.name!,
        email: user.email!,
        role: user.role || "USER",
        isVerified: user.isVerified ?? false,
        createdAt: user.createdAt ? (user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)) : new Date(),
      }));

    return (
      <Suspense fallback={<StudentDetailsLoading />}>
        <div className="w-[98vw] md:w-[75vw] mb-10">
          <CustomDataTable
            tableTitle="All Users"
            pgSize={10}
            columns={usersColumns}
            data={transformedUsers}
            showDatePicker={false} // Users don't typically need date filtering
            filters={[
              { column: "name", placeholder: "Find by Name" },
              { column: "email", placeholder: "Find by Email" },
              { column: "role", placeholder: "Filter by Role" }
            ]}
          />
        </div>
      </Suspense>
    );
  } else {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Users
          </h2>
          <p className="text-gray-600">
            {result.error || "Unable to fetch users at this time"}
          </p>
        </div>
      </div>
    );
  }
}