"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { DeleteButton } from "../buttons/delete-button";
import DateFormatter from "../custom-ui/date-format";
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { deleteUserRecord } from "@/app/actions/users";
import { PromoteUserButton } from "../buttons/promote-user-toggle";

// Define the User type based on your schema
export type UserData = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isVerified: boolean;
  createdAt: Date;
};

export const usersColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      // const user = row.original; // Get the full row data

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              role === "ADMIN"
                ? "default"
                : role === "USER"
                  ? "secondary"
                  : "outline"
            }
            className="capitalize"
          >
            {role.toLowerCase()}
          </Badge>
          {/* <PromoteUserButton 
            userId={user.id} 
            userName={user.name} 
            currentRole={role} 
          /> */}
        </div>
      );
    },
  },
  {
    accessorKey: "isVerified",
    header: "Status",
    cell: ({ row }) => {
      const isVerified = row.getValue("isVerified") as boolean;
      return (
        <div className="flex items-center">
          {isVerified ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-green-600">Verified</span>
            </>
          ) : (
            <>
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              <span className="text-red-600">Unverified</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <DateFormatter dateString={row.getValue("createdAt")} />,
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                User Details
              </DialogTitle>
            </DialogHeader>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  {user.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2 text-sm">{user.email}</span>
                  </div>

                  <div className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Role:</span>
                    <Badge
                      variant={
                        user.role === "ADMIN"
                          ? "default"
                          : user.role === "USER"
                            ? "secondary"
                            : "outline"
                      }
                      className="ml-2 capitalize"
                    >
                      {user.role.toLowerCase()}
                    </Badge>
                    <PromoteUserButton
                      userId={user.id}
                      userName={user.name}
                      currentRole={user.role}
                    />
                  </div>

                  <div className="flex items-center">
                    {user.isVerified ? (
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="mr-2 h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Verification Status:</span>
                    <span
                      className={`ml-2 ${
                        user.isVerified ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {user.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Created:</span>
                    <span className="ml-2 text-sm">
                      <DateFormatter dateString={user.createdAt} />
                    </span>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-center">
                    <span className="font-light text-sm text-muted-foreground">
                      User ID: {user.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    id: "delete",
    header: "Delete",
    cell: ({ row }) => {
      const { id, name } = row.original;
      return (
        <DeleteButton
          id={id}
          identifier={`User ${name}`}
          deleteAction={deleteUserRecord} // You'll need to create this action
          entityType="User"
        />
      );
    },
  },
];

// export async function getAllUsers() {
//   try {
//     // Fetch all users from the database
//     const allUsers = await db
//       .select({
//         id: users.id,
//         name: users.name,
//         email: users.email,
//         role: users.role,
//         isVerified: users.isVerified,
//         createdAt: users.createdAt,
//       })
//       .from(users)
//       .orderBy(users.createdAt); // Order by creation date, newest first

//     console.log(`Retrieved ${allUsers.length} users from database`);

//     return {
//       success: true,
//       data: allUsers,
//     };
//   } catch (error) {
//     console.error("Error fetching all users:", error);

//     if (error instanceof Error) {
//       return {
//         success: false,
//         error: `Failed to fetch users: ${error.message}`,
//       };
//     }

//     return {
//       success: false,
//       error: "An unexpected error occurred while fetching users",
//     };
//   }
// }
// "use client";
// import { ColumnDef } from "@tanstack/react-table";
// import { CaretSortIcon } from "@radix-ui/react-icons";
// import { Button } from "../ui/button";
// import { DeleteButton } from "../buttons/delete-button";
// import DateFormatter from "../custom-ui/date-format";
// import {
//   User,
//   Mail,
//   Shield,
//   CheckCircle2,
//   XCircle,
//   Calendar,
//   Eye,
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../ui/dialog";
// import { Badge } from "../ui/badge";
// import { deleteUserRecord } from "@/app/actions/users";

// // Define the User type based on your schema
// export type UserData = {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   isVerified: boolean;
//   createdAt: Date;
// };

// export const usersColumns: ColumnDef<UserData>[] = [
//   {
//     accessorKey: "name",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Name
//           <CaretSortIcon className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//     cell: ({ row }) => (
//       <div className="font-medium">{row.getValue("name")}</div>
//     ),
//   },
//   {
//     accessorKey: "email",
//     header: "Email",
//     cell: ({ row }) => (
//       <div className="text-sm text-muted-foreground">
//         {row.getValue("email")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "role",
//     header: "Role",
//     cell: ({ row }) => {
//       const role = row.getValue("role") as string;
//       return (
//         <Badge
//           variant={role === "ADMIN" ? "default" : role === "USER" ? "secondary" : "outline"}
//           className="capitalize"
//         >
//           {role.toLowerCase()}
//         </Badge>
//       );
//     },
//   },
//   {
//     accessorKey: "isVerified",
//     header: "Status",
//     cell: ({ row }) => {
//       const isVerified = row.getValue("isVerified") as boolean;
//       return (
//         <div className="flex items-center">
//           {isVerified ? (
//             <>
//               <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
//               <span className="text-green-600">Verified</span>
//             </>
//           ) : (
//             <>
//               <XCircle className="mr-2 h-4 w-4 text-red-600" />
//               <span className="text-red-600">Unverified</span>
//             </>
//           )}
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "createdAt",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Created
//           <CaretSortIcon className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//     cell: ({ row }) => <DateFormatter dateString={row.getValue("createdAt")} />,
//   },
//   {
//     id: "details",
//     header: "Details",
//     cell: ({ row }) => {
//       const user = row.original;
//       return (
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button variant="outline" size="sm">
//               <Eye className="mr-2 h-4 w-4" />
//               View
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[500px]">
//             <DialogHeader>
//               <DialogTitle className="text-xl font-bold">
//                 User Details
//               </DialogTitle>
//             </DialogHeader>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg flex items-center">
//                   <User className="mr-2 h-5 w-5" />
//                   {user.name}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center">
//                     <Mail className="mr-2 h-5 w-5 text-muted-foreground" />
//                     <span className="font-medium">Email:</span>
//                     <span className="ml-2 text-sm">{user.email}</span>
//                   </div>

//                   <div className="flex items-center">
//                     <Shield className="mr-2 h-5 w-5 text-muted-foreground" />
//                     <span className="font-medium">Role:</span>
//                     <Badge
//                       variant={user.role === "ADMIN" ? "default" : user.role === "USER" ? "secondary" : "outline"}
//                       className="ml-2 capitalize"
//                     >
//                       {user.role.toLowerCase()}
//                     </Badge>
//                   </div>

//                   <div className="flex items-center">
//                     {user.isVerified ? (
//                       <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
//                     ) : (
//                       <XCircle className="mr-2 h-5 w-5 text-red-600" />
//                     )}
//                     <span className="font-medium">Verification Status:</span>
//                     <span
//                       className={`ml-2 ${
//                         user.isVerified ? "text-green-600" : "text-red-600"
//                       }`}
//                     >
//                       {user.isVerified ? "Verified" : "Unverified"}
//                     </span>
//                   </div>

//                   <div className="flex items-center">
//                     <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
//                     <span className="font-medium">Created:</span>
//                     <span className="ml-2 text-sm">
//                       <DateFormatter dateString={user.createdAt} />
//                     </span>
//                   </div>

//                   <div className="pt-2 border-t">
//                     <span className="font-medium text-sm text-muted-foreground">
//                       User ID: {user.id}
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </DialogContent>
//         </Dialog>
//       );
//     },
//   },
//   {
//     id: "delete",
//     header: "Delete",
//     cell: ({ row }) => {
//       const { id, name } = row.original;
//       return (
//         <DeleteButton
//           id={id}
//           identifier={`User ${name}`}
//           deleteAction={deleteUserRecord}
//           entityType="User"
//         />
//       );
//     },
//   },
// ];
