import { DemoClassEmailTemplate } from "@/components/emails/demo-class-email-template";
import { demoFormSchema } from "@/lib/demoFormValidation";
import { Resend } from "resend";
import { DemoFormState } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export const onDemoFormAction = async (
  prevState: DemoFormState,
  formData: FormData
): Promise<DemoFormState> => {
  "use server";
  
  try {
    const fetchTitle = prevState.fetchTitle;
    const data = Object.fromEntries(formData);
    
    // Add title from prevState if not in formData
    const formDataWithTitle = {
      ...data,
      title: fetchTitle
    };
    
    const parsed = demoFormSchema.safeParse(formDataWithTitle);
    
    if (!parsed.success) {
      return {
        fetchTitle,
        data: {
          message: "Please fix the errors below.",
          issues: parsed.error.issues.map((issue) => issue.message),
          user: undefined,
        },
        status: "error",
      };
    }

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return {
        fetchTitle,
        data: {
          message: "Email service is not configured. Please contact support.",
          issues: ["Email service unavailable"],
          user: undefined,
        },
        status: "error",
      };
    }

    // Send email
    const emailResult = await resend.emails.send({
      from: "MK <mail@mohankumar.dev>",
      to: "mohansky@gmail.com",
      subject: `Demo ${parsed.data.title} class for ${parsed.data.senderName}.`,
      replyTo: parsed.data.email,
      react: DemoClassEmailTemplate({
        senderName: parsed.data.senderName as string,
        phone: parsed.data.phone as string,
        email: parsed.data.email as string,
        title: parsed.data.title as string,
      }),
    });

    // Check if email was sent successfully
    if (emailResult.error) {
      console.error("Email sending failed:", emailResult.error);
      return {
        fetchTitle,
        data: {
          message: "Failed to send email. Please try again or contact us directly.",
          issues: ["Email delivery failed"],
          user: undefined,
        },
        status: "error",
      };
    }

    return {
      fetchTitle,
      data: {
        message: "Form submitted successfully! Thank you for your interest. We'll contact you soon.",
        user: parsed.data,
        issues: undefined,
      },
      status: "success",
    };
    
  } catch (error) {
    console.error("Demo form submission error:", error);
    
    return {
      fetchTitle: prevState.fetchTitle,
      data: {
        message: "An unexpected error occurred. Please try again later.",
        issues: ["Server error"],
        user: undefined,
      },
      status: "error",
    };
  }
};

// import { DemoClassEmailTemplate } from "@/components/emails/demo-class-email-template";
// import { demoFormSchema } from "@/lib/demoFormValidation";
// import { Resend } from "resend";
// import { DemoFormState } from "@/types";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const onDemoFormAction = async (
//   prevState: DemoFormState,
//   formData: FormData
// ): Promise<DemoFormState> => {
//   "use server";

//   const fetchTitle = prevState.fetchTitle;
//   const data = Object.fromEntries(formData);
//   const parsed = demoFormSchema.safeParse({ ...data, title: fetchTitle });

//   if (parsed.success) {
//     await resend.emails.send({
//       from: "MK <mail@mohankumar.dev>",
//       to: "mohansky@gmail.com",
//       subject: `Demo ${parsed.data.title} class for ${parsed.data.senderName}.`,
//       replyTo: parsed.data.email,
//       react: DemoClassEmailTemplate({
//         senderName: parsed.data.senderName as string,
//         phone: parsed.data.phone as string,
//         email: parsed.data.email as string,
//         title: parsed.data.title as string,
//       }),
//     });
//     return {
//       fetchTitle,
//       data: {
//         message: "Form submitted. Thank you for your interest.",
//         user: parsed.data,
//         issues: undefined,
//       },
//       status: "success",
//     };
//   } else {
//     return {
//       fetchTitle,
//       data: {
//         message: parsed.error.issues.map((issue) => issue.message),
//         issues: parsed.error.issues.map((issue) => issue.message),
//         user: undefined,
//       },
//       status: "error",
//     };
//   }
// };