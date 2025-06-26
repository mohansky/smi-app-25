"use server";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { students, users, verificationTokens } from "@/db/schema";
import { CreateUserSchema } from "@/lib/validations/user";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/types";
import { sendVerificationEmail } from "@/lib/email";

// export async function createUser(prevState: unknown, formData: FormData) {
//   try {
//     // Log the incoming form data for debugging
//     console.log("Incoming form data:", {
//       name: formData.get("name"),
//       email: formData.get("email"),
//       role: formData.get("role"),
//     });

//     // Validate form data using Zod
//     const validatedFields = CreateUserSchema.safeParse({
//       name: formData.get("name"),
//       email: formData.get("email"),
//       password: formData.get("password"),
//       role: formData.get("role") || undefined,
//     });

//     // Check validation results
//     if (!validatedFields.success) {
//       console.error("Validation errors:", validatedFields.error.errors);
//       return {
//         error: validatedFields.error.errors[0].message,
//       };
//     }

//     const { name, email, password, role } = validatedFields.data;

//     // Check if user already exists
//     const existingUser = await db.query.users.findFirst({
//       where: eq(users.email, email),
//     });

//     if (existingUser) {
//       console.warn("User with this email already exists");
//       return {
//         error: "Email already exists",
//       };
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Log details before insertion (be careful with sensitive info)
//     console.log("Attempting to create user:", {
//       name: name,
//       email,
//       role: role || "USER",
//     });

//     // Create user
//     const newUser = await db
//       .insert(users)
//       .values({
//         id: uuidv4(), // Explicitly generate UUID
//         name: name,
//         email,
//         password: hashedPassword,
//         role: role || "USER", // Ensure role is set
//         isVerified: false,
//       })
//       .returning();

//     console.log("User created successfully:", newUser[0]);

//     return {
//       success: "Account created successfully!",
//     };
//   } catch (error) {
//     // Log the full error for debugging
//     console.error("Detailed user creation error:", error);

//     // If it's a database-specific error, you might want to log more details
//     if (error instanceof Error) {
//       return {
//         error: `Creation failed: ${error.message}`,
//       };
//     }

//     return {
//       error: "An unexpected error occurred during account creation",
//     };
//   }
// }

export async function createUser(prevState: unknown, formData: FormData) {
  try {
    console.log("Incoming form data:", {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    });

    // Validate form data using Zod
    const validatedFields = CreateUserSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role") || undefined,
    });

    if (!validatedFields.success) {
      console.error("Validation errors:", validatedFields.error.errors);
      return {
        error: validatedFields.error.errors[0].message,
      };
    }

    const { name, email, password, role } = validatedFields.data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      console.warn("User with this email already exists");
      return {
        error: "Email already exists",
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Attempting to create user:", {
      name: name,
      email,
      role: role || "USER",
    });

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        id: uuidv4(),
        name: name,
        email,
        password: hashedPassword,
        role: role || "USER",
        isVerified: false,
      })
      .returning();

    console.log("User created successfully:", newUser[0]);

    // Generate verification token
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save verification token
    await db.insert(verificationTokens).values({
      id: uuidv4(), // Generate UUID for the token record
      email,
      token: verificationToken,
      expires: expiresAt,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email,
      name,
      verificationToken
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      return {
        success: "Account created successfully! Please check your email for verification instructions.",
        warning: "Verification email could not be sent. Please contact support.",
      };
    }

    return {
      success: "Account created successfully! Please check your email to verify your account.",
    };

  } catch (error) {
    console.error("Detailed user creation error:", error);
    
    if (error instanceof Error) {
      return {
        error: `Creation failed: ${error.message}`,
      };
    }
    
    return {
      error: "An unexpected error occurred during account creation",
    };
  }
}

export async function getStudentByUserEmail(userEmail: string) {
  try {
    // Query the database to join students and users by email
    const result = await db
      .select({
        studentId: students.id,
        studentName: students.name,
        studentEmail: students.email,
        userId: students.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(users.email, userEmail))
      .limit(1); // Optional: Only fetch the first match

    if (result.length === 0) {
      return null; // No match found
    }

    return result[0]; // Return the matched student details
  } catch (error) {
    console.error("Error fetching student by user email:", error);
    throw new Error("Failed to fetch student details.");
  }
}

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

export async function getAllUsers() {
  try {
    // Fetch all users from the database
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt); // Order by creation date, newest first

    console.log(`Retrieved ${allUsers.length} users from database`);

    return {
      success: true,
      data: allUsers,
    };
  } catch (error) {
    console.error("Error fetching all users:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to fetch users: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred while fetching users",
    };
  }
}

export async function deleteUserRecord(userId: string): Promise<ActionState> {
  try {
    console.log(`Attempting to delete user with ID: ${userId}`);

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      console.warn(`User with ID ${userId} not found`);
      return {
        status: "error",
        data: {
          message: "User not found",
        },
      };
    }

    // Check if user has associated students (optional: prevent deletion if students exist)
    const associatedStudents = await db.query.students.findMany({
      where: eq(students.userId, userId),
    });

    if (associatedStudents.length > 0) {
      console.warn(
        `Cannot delete user ${userId}: has ${associatedStudents.length} associated students`
      );
      return {
        status: "error",
        data: {
          message: `Cannot delete user. This user has ${associatedStudents.length} associated student(s). Please reassign or delete the students first.`,
        },
      };
    }

    // Delete the user
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (deletedUser.length === 0) {
      console.error(`Failed to delete user with ID: ${userId}`);
      return {
        status: "error",
        data: {
          message: "Failed to delete user",
        },
      };
    }

    console.log(`User deleted successfully:`, deletedUser[0]);

    // Revalidate the users page to reflect changes
    revalidatePath("/dashboard/admin/users");

    return {
      status: "success",
      data: {
        message: `User "${existingUser.name}" has been deleted successfully`,
      },
    };
  } catch (error) {
    console.error("Detailed user deletion error:", error);

    if (error instanceof Error) {
      return {
        status: "error",
        data: {
          message: `Deletion failed: ${error.message}`,
        },
      };
    }

    return {
      status: "error",
      data: {
        message: "An unexpected error occurred during user deletion",
      },
    };
  }
}


// export async function toggleUserRole(userId: string): Promise<ActionState> {
//   try {
//     console.log(`Attempting to toggle role for user with ID: ${userId}`);

//     // Check if user exists and get current role
//     const existingUser = await db.query.users.findFirst({
//       where: eq(users.id, userId),
//     });

//     if (!existingUser) {
//       console.warn(`User with ID ${userId} not found`);
//       return {
//         status: "error",
//         data: {
//           message: "User not found",
//         },
//       };
//     }

//     // Determine new role - only allow USER -> ADMIN promotion
//     if (existingUser.role !== "USER") {
//       return {
//         status: "error",
//         data: {
//           message: "Only users with USER role can be promoted to ADMIN",
//         },
//       };
//     }

//     // Update user role to ADMIN
//     const updatedUser = await db
//       .update(users)
//       .set({
//         role: "ADMIN",
//       })
//       .where(eq(users.id, userId))
//       .returning();

//     if (updatedUser.length === 0) {
//       console.error(`Failed to update role for user with ID: ${userId}`);
//       return {
//         status: "error",
//         data: {
//           message: "Failed to update user role",
//         },
//       };
//     }

//     console.log(`User role updated successfully:`, updatedUser[0]);

//     // Revalidate the users page to reflect changes
//     revalidatePath("/dashboard/admin/users");

//     return {
//       status: "success",
//       data: {
//         message: `User "${existingUser.name}" has been promoted to ADMIN successfully`,
//       },
//     };

//   } catch (error) {
//     console.error("Detailed role toggle error:", error);

//     if (error instanceof Error) {
//       return {
//         status: "error",
//         data: {
//           message: `Role update failed: ${error.message}`,
//         },
//       };
//     }

//     return {
//       status: "error",
//       data: {
//         message: "An unexpected error occurred during role update",
//       },
//     };
//   }
// }

// "use server";
// import { db } from "@/db/drizzle";
// import { eq } from "drizzle-orm";
// import { users } from "@/db/schema";
// import { revalidatePath } from "next/cache";
// import { ActionState } from "@/lib/types";

// export async function toggleUserRole(userId: string): Promise<ActionState> {
//   try {
//     console.log(`Attempting to toggle role for user with ID: ${userId}`);

//     // Check if user exists and get current role
//     const existingUser = await db.query.users.findFirst({
//       where: eq(users.id, userId),
//     });

//     if (!existingUser) {
//       console.warn(`User with ID ${userId} not found`);
//       return {
//         status: "error",
//         data: {
//           message: "User not found",
//         },
//       };
//     }

//     // Determine new role - only allow USER -> ADMIN promotion
//     if (existingUser.role !== "USER") {
//       return {
//         status: "error",
//         data: {
//           message: "Only users with USER role can be promoted to ADMIN",
//         },
//       };
//     }

//     // Update user role to ADMIN using raw SQL if needed
//     const updatedUser = await db
//       .update(users)
//       .set({
//         role: "ADMIN" as "USER" | "ADMIN", // Explicit type annotation
//       })
//       .where(eq(users.id, userId))
//       .returning();

//     if (updatedUser.length === 0) {
//       console.error(`Failed to update role for user with ID: ${userId}`);
//       return {
//         status: "error",
//         data: {
//           message: "Failed to update user role",
//         },
//       };
//     }

//     console.log(`User role updated successfully:`, updatedUser[0]);

//     // Revalidate the users page to reflect changes
//     revalidatePath("/dashboard/admin/users");

//     return {
//       status: "success",
//       data: {
//         message: `User "${existingUser.name}" has been promoted to ADMIN successfully`,
//       },
//     };

//   } catch (error) {
//     console.error("Detailed role toggle error:", error);

//     if (error instanceof Error) {
//       return {
//         status: "error",
//         data: {
//           message: `Role update failed: ${error.message}`,
//         },
//       };
//     }

//     return {
//       status: "error",
//       data: {
//         message: "An unexpected error occurred during role update",
//       },
//     };
//   }
// }




export async function toggleUserRole(formData: FormData | string): Promise<ActionState> {
  try {
    // Handle both FormData and direct string calls
    const userId = typeof formData === "string" ? formData : formData.get("userId") as string;
    
    console.log(`Attempting to toggle role for user with ID: ${userId}`);

    if (!userId) {
      return {
        status: "error",
        data: {
          message: "User ID is required",
        },
      };
    }

    // Check if user exists and get current role
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      console.warn(`User with ID ${userId} not found`);
      return {
        status: "error",
        data: {
          message: "User not found",
        },
      };
    }

    // Determine new role - only allow USER -> ADMIN promotion
    if (existingUser.role !== "USER") {
      return {
        status: "error",
        data: {
          message: "Only users with USER role can be promoted to ADMIN",
        },
      };
    }

    // Update user role to ADMIN using raw SQL if needed
    const updatedUser = await db
      .update(users)
      .set({
        role: "ADMIN" as "USER" | "ADMIN", // Explicit type annotation
      })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      console.error(`Failed to update role for user with ID: ${userId}`);
      return {
        status: "error",
        data: {
          message: "Failed to update user role",
        },
      };
    }

    console.log(`User role updated successfully:`, updatedUser[0]);

    // Revalidate the users page to reflect changes
    revalidatePath("/dashboard/admin/users");

    return {
      status: "success",
      data: {
        message: `User "${existingUser.name}" has been promoted to ADMIN successfully`,
      },
    };

  } catch (error) {
    console.error("Detailed role toggle error:", error);

    if (error instanceof Error) {
      return {
        status: "error",
        data: {
          message: `Role update failed: ${error.message}`,
        },
      };
    }

    return {
      status: "error",
      data: {
        message: "An unexpected error occurred during role update",
      },
    };
  }
}