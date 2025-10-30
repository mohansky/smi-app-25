// app/dashboard/admin/students/page.tsx
import { Suspense } from "react";
import { getStudents } from "@/app/actions/student";
import { studentsColumns } from "@/components/columns/students-columns";
import { CustomDataTable } from "@/components/custom-ui/custom-data-table";
import TablesPageLoading from "@/components/skeletons/tables-skeleton";

// Disable caching for fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StudentsPage() {
  const { students, error } = await getStudents();
 
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Students
          </h2>
          <p className="text-gray-600">
            {error || "Unable to fetch students at this time"}
          </p>
        </div>
      </div>
    );
  }

  const studentsData = students || [];
  
  return (
    <Suspense fallback={<TablesPageLoading />}>
      <div className="w-[98vw] md:w-[75vw] mb-10">
        <CustomDataTable
          columns={studentsColumns}
          data={studentsData}
          tableTitle="Students"
          pgSize={10}
          showDatePicker={false}
          filters={[
            { column: "name", placeholder: "Find by Name" },
            {
              column: "isActive",
              placeholder: "Filter by Status",
              type: "select",
              options: [
                { label: "All", value: "all" },
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" }
              ]
            }
          ]}
        />
      </div>
    </Suspense>
  );
}




// // app/dashboard/admin/students/page.tsx
// import { Suspense } from "react";
// import { getStudents } from "@/app/actions/student";
// import { studentsColumns } from "@/components/columns/students-columns";
// import CustomDataTable from "@/components/custom-ui/custom-data-table";
// import TablesPageLoading from "@/components/skeletons/tables-skeleton";

// // Disable caching for fresh data
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// async function StudentsContent() {
//   const { students, error } = await getStudents();
 
//   if (error) {
//     return (
//       <div className="p-4">
//         <div className="text-destructive">Error loading students: {error}</div>
//       </div>
//     );
//   }

//   const studentsData = students || [];
  
//   return (
//     <div className="container mx-auto p-4 max-w-full">
//       <CustomDataTable
//         columns={studentsColumns}
//         data={studentsData}
//         tableTitle="Students"
//         filters={[{ column: "name", placeholder: "Find by Name" }]}
//       />
//     </div>
//   );
// }

// export default async function StudentsPage() {
//   return (
//     <Suspense fallback={<TablesPageLoading />}>
//       <StudentsContent />
//     </Suspense>
//   );
// }