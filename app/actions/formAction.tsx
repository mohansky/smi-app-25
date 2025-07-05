import { ContactFormEmailTemplate } from "@/components/emails/contact-form-email-template";
import { formSchema } from "@/lib/formValidation";
import { ActionState } from "@/types";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to verify reCAPTCHA
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not set");
    return false;
  }
  
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    });
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

export const onFormAction = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  "use server";
  
  // Verify reCAPTCHA first
  const recaptchaToken = formData.get('recaptcha') as string;
  
  if (!recaptchaToken) {
    return {
      status: "error",
      data: {
        message: "reCAPTCHA verification is required",
        issues: ["reCAPTCHA verification is required"],
        user: undefined,
      },
    };
  }
  
  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  
  if (!isRecaptchaValid) {
    console.log("Invalid reCAPTCHA token");
    return {
      status: "error",
      data: {
        message: "reCAPTCHA verification failed. Please try again.",
        issues: ["reCAPTCHA verification failed"],
        user: undefined,
      },
    };
  }
  
  // Extract honeypot field (keep as additional protection)
  const honeypotValue = formData.get('website');
  
  // Check if honeypot field is filled
  if (honeypotValue) {
    console.log("Spam detected via honeypot");
    return {
      status: "success",
      data: {
        message: "Form submitted. Thank you for your interest.",
        user: undefined,
        issues: undefined,
      },
    };
  }
  
  // Remove reCAPTCHA token from form data before validation
  formData.delete('recaptcha');
  const data = Object.fromEntries(formData);
  const parsed = formSchema.safeParse(data);
  
  if (parsed.success) {
    // Additional spam checks (keep these as well)
    if (isSpamMessage(parsed.data.message) || isSpamEmail(parsed.data.email)) {
      console.log("Spam detected via content analysis");
      return {
        status: "success",
        data: {
          message: "Form submitted. Thank you for your interest.",
          user: parsed.data,
          issues: undefined,
        },
      };
    }
    
    try {
      // Send email for legitimate submissions
      await resend.emails.send({
        // from: "MK <mail@mohankumar.dev>",
        from: process.env.RESEND_FROM_EMAIL!,
        to: "mohansky@gmail.com",
        subject: `Enquiry from ${parsed.data.senderName}`,
        replyTo: parsed.data.email as string,
        react: ContactFormEmailTemplate({
          senderName: parsed.data.senderName as string,
          phone: parsed.data.phone as string,
          email: parsed.data.email as string,
          message: parsed.data.message as string,
        }),
      });
      
      return {
        status: "success",
        data: {
          message: "Form submitted. Thank you for your interest.",
          user: parsed.data,
          issues: undefined,
        },
      };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        status: "error",
        data: {
          message: "Failed to send message. Please try again.",
          issues: ["Failed to send message"],
          user: undefined,
        },
      };
    }
  } else {
    return {
      status: "error",
      data: {
        message: parsed.error.issues.map((issue) => issue.message),
        issues: parsed.error.issues.map((issue) => issue.message),
        user: undefined,
      },
    };
  }
};

// Keep your existing spam detection functions
function isSpamMessage(message: string): boolean {
  const spamPatterns = [
    /buy viagra/i,
    /casino/i,
    /\bloan\b/i,
    /\bcheap\b.*\bmedication\b/i,
    /\bmake money fast\b/i,
    /https?:\/\/(?!.*mohankumar\.dev)/i,
  ];
  
  return spamPatterns.some(pattern => pattern.test(message));
}

function isSpamEmail(email: string): boolean {
  const spamDomains = [
    /\.xyz$/i,
    /\.top$/i,
    /temporary-mail\.net/i,
    /disposable-email\.com/i,
    /temp-mail\./i,
    /10minutemail\./i,
  ];
  
  return spamDomains.some(pattern => pattern.test(email));
}


// import { ContactFormEmailTemplate } from "@/components/emails/contact-form-email-template";
// import { formSchema } from "@/lib/formValidation";
// import { ActionState } from "@/types";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const onFormAction = async (
//   prevState: ActionState,
//   formData: FormData
// ): Promise<ActionState> => {
//   "use server";
  
//   // Extract honeypot field
//   const honeypotValue = formData.get('website');
  
//   // Check if honeypot field is filled (if it is, it's likely a bot)
//   if (honeypotValue) {
//     console.log("Spam detected via honeypot");
//     // Return success without actually sending an email
//     // This silently fails for bots without letting them know why
//     return {
//       status: "success",
//       data: {
//         message: "Form submitted. Thank you for your interest.",
//         user: undefined,
//         issues: undefined,
//       },
//     };
//   }
  
//   const data = Object.fromEntries(formData);
//   const parsed = formSchema.safeParse(data);
  
//   if (parsed.success) {
//     // Additional spam checks
//     if (isSpamMessage(parsed.data.message) || isSpamEmail(parsed.data.email)) {
//       console.log("Spam detected via content analysis");
//       // Return success without actually sending an email
//       return {
//         status: "success",
//         data: {
//           message: "Form submitted. Thank you for your interest.",
//           user: parsed.data,
//           issues: undefined,
//         },
//       };
//     }
    
//     // Only send email for legitimate submissions
//     await resend.emails.send({
//       from: "MK <mail@mohankumar.dev>",
//       to: "mohansky@gmail.com",
//       subject: `Enquiry from ${parsed.data.senderName}`,
//       replyTo: parsed.data.email as string,
//       react: ContactFormEmailTemplate({
//         senderName: parsed.data.senderName as string,
//         phone: parsed.data.phone as string,
//         email: parsed.data.email as string,
//         message: parsed.data.message as string,
//       }),
//     });
    
//     return {
//       status: "success",
//       data: {
//         message: "Form submitted. Thank you for your interest.",
//         user: parsed.data,
//         issues: undefined,
//       },
//     };
//   } else {
//     return {
//       status: "error",
//       data: {
//         message: parsed.error.issues.map((issue) => issue.message),
//         issues: parsed.error.issues.map((issue) => issue.message),
//         user: undefined,
//       },
//     };
//   }
// };

// // Helper functions to detect spam
// function isSpamMessage(message: string): boolean {
//   // Check for spam patterns in the message
//   const spamPatterns = [
//     /buy viagra/i,
//     /casino/i,
//     /\bloan\b/i,
//     /\bcheap\b.*\bmedication\b/i,
//     /\bmake money fast\b/i,
//     /https?:\/\/(?!.*mohankumar\.dev)/i, // Links to external domains (adjust with your domain)
//   ];
  
//   return spamPatterns.some(pattern => pattern.test(message));
// }

// function isSpamEmail(email: string): boolean {
//   // Check for known spam email domains
//   const spamDomains = [
//     /\.xyz$/i,
//     /\.top$/i,
//     /temporary-mail\.net/i,
//     /disposable-email\.com/i,
//     /temp-mail\./i,
//     /10minutemail\./i,
//   ];
  
//   return spamDomains.some(pattern => pattern.test(email));
// }


// // import { ContactFormEmailTemplate } from "@/components/emails/contact-form-email-template";
// // import { formSchema } from "@/lib/formValidation";
// // import { ActionState } from "@/types";
// // import { Resend } from "resend";

// // const resend = new Resend(process.env.RESEND_API_KEY);

// // export const onFormAction = async (
// //   prevState: ActionState,
// //   formData: FormData
// // ): Promise<ActionState> => {
// //   "use server";
// //   const data = Object.fromEntries(formData);
// //   const parsed = formSchema.safeParse(data);

// //   if (parsed.success) {
// //     await resend.emails.send({
// //       from: "MK <mail@mohankumar.dev>",
// //       to: "mohansky@gmail.com",
// //       subject: `Enquiry from ${parsed.data.senderName}`,
// //       replyTo: parsed.data.email as string,
// //       react: ContactFormEmailTemplate({
// //         senderName: parsed.data.senderName as string,
// //         phone: parsed.data.phone as string,
// //         email: parsed.data.email as string,
// //         message: parsed.data.message as string,
// //       }),
// //     });
// //     return {
// //       status: "success",
// //       data: {
// //         message: "Form submitted. Thank you for your interest.",
// //         user: parsed.data,
// //         issues: undefined,
// //       },
// //     };
// //   } else {
// //     return {
// //       status: "error",
// //       data: {
// //         message: parsed.error.issues.map((issue) => issue.message),
// //         issues: parsed.error.issues.map((issue) => issue.message),
// //         user: undefined,
// //       },
// //     };
// //   }
// // };
