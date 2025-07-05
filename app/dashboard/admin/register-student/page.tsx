import { addStudent } from "@/app/actions/student";
import AddStudentForm from "@/components/forms/add-student-form";
import { Dialog } from "@/components/ui/dialog";
import React from "react";

export default function page() {
  return (
    <div className="w-[98vw] md:w-[60vw] mb-10">
      <Dialog >
        <AddStudentForm addStudent={addStudent} />
      </Dialog>
    </div>
  );
}
