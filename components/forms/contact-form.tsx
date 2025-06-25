"use client";
import React, { useEffect, useActionState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formSchema } from "@/lib/formValidation";
import { ActionState } from "@/types";

export const ContactForm = ({
  onFormAction,
}: {
  onFormAction: (
    prevState: ActionState,
    data: FormData
  ) => Promise<ActionState>;
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const [state, formAction, isPending] = useActionState(onFormAction, {
    status: "idle",
    data: {
      message: "",
      user: undefined,
      issues: [],
    },
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderName: "",
      phone: "",
      email: "",
      message: "",
      website: "",
    },
    mode: "onChange",
  });

  // Handle form submission with reCAPTCHA
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Get reCAPTCHA token
    const recaptchaValue = recaptchaRef.current?.getValue();
    
    if (!recaptchaValue) {
      // Show error if reCAPTCHA not completed
      form.setError("root", {
        type: "manual",
        message: "Please complete the reCAPTCHA verification"
      });
      return;
    }
    
    // Create FormData and add reCAPTCHA token
    const formData = new FormData(event.currentTarget);
    formData.append("recaptcha", recaptchaValue);
    
    // Submit the form
    formAction(formData);
  };
 
  useEffect(() => {
    if (state.status === "success" && !state.data?.issues) {
      form.reset();
      // Reset reCAPTCHA
      recaptchaRef.current?.reset();
    }
  }, [state, form]);
  
  useEffect(() => {
    const subscription = form.watch((values) => {
      form.trigger();
      return values;
    });
    return () => subscription.unsubscribe();
  }, [form]);
  
  return (
    <Form {...form}>
      {state?.data?.message && (
        <div
          className={`font-bold mb-10 ${
            state.data.issues ? "text-destructive" : "text-active"
          }`}
        >
          {state.data.issues ? (
            <p>Invalid Fields please check.</p>
          ) : (
            <p>{state.data.message}</p>
          )}
        </div>
      )}
      
      {/* Show reCAPTCHA error */}
      {form.formState.errors.root && (
        <div className="text-destructive font-bold mb-4">
          {form.formState.errors.root.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormField
          control={form.control}
          name="senderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone No.</FormLabel>
                <FormControl>
                  <Input placeholder="Your Phone No." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Honeypot field - keep this as additional protection */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your Website" 
                    {...field} 
                    tabIndex={-1}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your message"
                  {...field}
                  rows={5}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* reCAPTCHA */}
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            theme="light"
          />
        </div>
        
        <Button size="lg" type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};



// "use client";
// import React, { useEffect, useActionState } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { formSchema } from "@/lib/formValidation";
// import { ActionState } from "@/types";

// export const ContactForm = ({
//   onFormAction,
// }: {
//   onFormAction: (
//     prevState: ActionState,
//     data: FormData
//   ) => Promise<ActionState>;
// }) => {
//   const [state, formAction, isPending] = useActionState(onFormAction, {
//     status: "idle",
//     data: {
//       message: "",
//       user: undefined,
//       issues: [],
//     },
//   });
  
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       senderName: "",
//       phone: "",
//       email: "",
//       message: "",
//       website: "",
//     },
//     mode: "onChange",
//   });
 
//   useEffect(() => {
//     if (state.status === "success" && !state.data?.issues) {
//       form.reset();
//     }
//   }, [state, form]);
  
//   useEffect(() => {
//     const subscription = form.watch((values) => {
//       form.trigger();
//       return values;
//     });
//     return () => subscription.unsubscribe();
//   }, [form]);
  
//   return (
//     <Form {...form}>
//       {state?.data?.message && (
//         <div
//           className={`font-bold mb-10 ${
//             state.data.issues ? "text-destructive" : "text-active"
//           }`}
//         >
//           {state.data.issues ? (
//             <p>Invalid Fields please check.</p>
//           ) : (
//             <p>{state.data.message}</p>
//           )}
//         </div>
//       )}
//       <form action={formAction} className="space-y-8">
//         <FormField
//           control={form.control}
//           name="senderName"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="Your Name" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <div className="grid grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="phone"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Phone No.</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Your Phone No." {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="email"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Email</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Your Email" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>
        
//         {/* Honeypot field - hidden from real users but visible to bots */}
//         <div style={{ display: 'none' }} aria-hidden="true">
//           <FormField
//             control={form.control}
//             name="website"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Website</FormLabel>
//                 <FormControl>
//                   <Input 
//                     placeholder="Your Website" 
//                     {...field} 
//                     tabIndex={-1}
//                   />
//                 </FormControl>
//               </FormItem>
//             )}
//           />
//         </div>
        
//         <FormField
//           control={form.control}
//           name="message"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Message</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder="Your message"
//                   {...field}
//                   rows={5}
//                   className="resize-none"
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button size="lg" type="submit" disabled={isPending}>
//           {isPending ? "Submitting..." : "Submit"}
//         </Button>
//       </form>
//     </Form>
//   );
// };