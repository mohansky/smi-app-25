// app/dashboard/admin/students/page.tsx
import { Suspense } from "react";
import { getStudents } from "@/app/actions/student";
import { studentsColumns } from "@/components/columns/students-columns";
import CustomDataTable from "@/components/custom-ui/custom-data-table";
import TablesPageLoading from "@/components/skeletons/tables-skeleton";

// Disable caching for fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function StudentsContent() {
  const { students, error } = await getStudents();
 
  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading students: {error}</div>
      </div>
    );
  }

  const studentsData = students || [];
  
  return (
    <div className="container mx-auto p-4 max-w-full">
      <CustomDataTable
        columns={studentsColumns}
        data={studentsData}
        tableTitle="Students"
        filters={[{ column: "name", placeholder: "Find by Name" }]}
      />
    </div>
  );
}

export default async function StudentsPage() {
  return (
    <Suspense fallback={<TablesPageLoading />}>
      <StudentsContent />
    </Suspense>
  );
}