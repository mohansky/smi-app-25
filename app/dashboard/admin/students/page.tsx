// app/dashboard/admin/students/page.tsx
import { Suspense } from "react";
import { getStudents } from "@/app/actions/student";
import { Container } from "@/components/custom-ui/container";
import { studentsColumns } from "@/components/columns/students-columns";
import CustomDataTable from "@/components/custom-ui/custom-data-table";
import TablesPageLoading from "@/components/skeletons/tables-skeleton";

// FIX 4: Disable caching for this page to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function StudentsContent() {
  const { students, error } = await getStudents();
  
  if (error) {
    return (
      <Container width="marginy">
        <div className="text-red-500">Error loading students: {error}</div>
      </Container>
    );
  }

  const studentsData = students || [];

  return (
    <div className="w-[98vw] md:w-[75vw] mb-10">
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