// app/dashboard/admin/students/page.tsx
import { Suspense } from "react";
import { getStudents } from "@/app/actions/student";
import { Container } from "@/components/custom-ui/container";
import { studentsColumns } from "@/components/columns/students-columns";
// import { StudentFormValues } from "@/lib/validations/student";
import CustomDataTable from "@/components/custom-ui/custom-data-table";
import TablesPageLoading from "@/components/skeletons/tables-skeleton";

export default async function StudentsPage() {
  const { students, error } = await getStudents();
  
  if (error) {
    return (
      <Container width="marginy">Error loading students: {error}</Container>
    );
  }

  // Data is already properly typed from getStudents(), no need to re-validate
  const studentsData = students || [];

  return (
    <Suspense fallback={<TablesPageLoading />}>
      <div className="w-[98vw] md:w-[75vw] mb-10">
        <CustomDataTable
          columns={studentsColumns}
          data={studentsData}
          tableTitle="Students"
          filters={[{ column: "name", placeholder: "Find by Name" }]}
        />
      </div>
    </Suspense>
  );
}