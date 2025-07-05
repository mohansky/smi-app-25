// app/classes/[...slug]/page.tsx
import { classes, options } from "#site/content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { Heading } from "@/components/custom-ui/heading";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DemoClassForm } from "@/components/forms/demo-class-form";
import { Button } from "@/components/ui/button";
import { onDemoFormAction } from "@/app/actions/demoFormAction";
import { Container } from "@/components/custom-ui/container";
import { Schema } from "@/components/seo/schema";
import { SchemaData } from "@/lib/schema";

interface ClassesPageProps {
  params: {
    slug: string[];
  };
}

async function getClassesFromParams(params: ClassesPageProps["params"]) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.join("/");
  const classe = classes.find((classe) => classe.slugAsParams === slug);
  return classe;
}

export async function generateMetadata({
  params,
}: ClassesPageProps): Promise<Metadata> {
  const classe = await getClassesFromParams(params);

  if (!classe) {
    return {};
  }

  return {
    title: `${classe.title} | ${options.name}`,
    description: `Learn to play ${classe.title} from ${options.name}. Book a demo class today or visit our institute in Ulsoor, Bangalore.`,
    authors: { name: options.author.name },
    openGraph: {
      title: classe.title,
      description: classe.description,
      type: "article",
      url: `${options.basepath}/classes/${classe.slugAsParams}`,
      images: [
        {
          url: classe.img || "",
          width: 1200,
          height: 630,
          alt: classe.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: classe.title,
      description: classe.description,
    },
    alternates: {
      canonical: `${options.basepath}/classes/${classe.slugAsParams}`,
    },
  };
}

export async function generateStaticParams(): Promise<
  ClassesPageProps["params"][]
> {
  return classes.map((classe) => ({ slug: classe.slugAsParams.split("/") }));
}

export default async function ClassePage({ params }: ClassesPageProps) {
  const classe = await getClassesFromParams(params);

  if (!classe || !classe.published) {
    notFound();
  }

  // Generate comprehensive schema for the class page
  const generateClassSchemas = (): SchemaData[] => {
    const baseUrl = `${options.basepath}/classes/${classe.slugAsParams}`;
    
    // Main course schema for regular classes
    const regularCourseSchema: SchemaData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": `${baseUrl}#regular`,
      name: `${classe.title} - Regular Course`,
      description: classe.description || `Learn ${classe.title} with comprehensive instruction`,
      image: classe.img ? {
        "@type": "ImageObject",
        url: classe.img,
        description: `${classe.title} course image`,
      } : undefined,
      provider: {
        "@type": "Organization",
        "@id": `${options.basepath}#organization`,
        name: options.name,
        url: options.basepath,
        logo: {
          "@type": "ImageObject",
          url: "https://sridharmusicalinstitute.com/images/smilogo.png",
        },
      },
      url: baseUrl,
      courseMode: "in-person",
      educationalLevel: "Beginner to Advanced",
      timeRequired: classe.duration,
      coursePrerequisites: "No prior experience required",
      teaches: classe.overview?.join(", ") || `${classe.title} fundamentals and techniques`,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "in-person",
        location: {
          "@type": "Place",
          name: options.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Bangalore",
            addressRegion: "Karnataka",
            addressCountry: "India",
          },
        },
        instructor: {
          "@type": "Person",
          name: options.author.name,
          worksFor: {
            "@type": "Organization",
            name: options.name,
          },
        },
      },
      offers: classe.fees ? {
        "@type": "Offer",
        description: `Regular ${classe.title} classes`,
        price: classe.fees.replace(/[^0-9]/g, ''), // Extract numeric price
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      } : undefined,
    };

    // Crash course schema
    const crashCourseSchema: SchemaData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": `${baseUrl}#crash`,
      name: `${classe.title} - Crash Course`,
      description: classe.crashCourse || `Intensive ${classe.title} crash course`,
      image: classe.img ? {
        "@type": "ImageObject",
        url: classe.img,
        description: `${classe.title} crash course image`,
      } : undefined,
      provider: {
        "@type": "Organization",
        "@id": `${options.basepath}#organization`,
        name: options.name,
        url: options.basepath,
      },
      url: baseUrl,
      courseMode: "in-person",
      educationalLevel: "Intensive",
      coursePrerequisites: "Accelerated learning format",
      teaches: `Intensive ${classe.title} training`,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "in-person",
        location: {
          "@type": "Place",
          name: options.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Bangalore",
            addressRegion: "Karnataka", 
            addressCountry: "India",
          },
        },
        instructor: {
          "@type": "Person",
          name: options.author.name,
        },
      },
    };

    // WebPage schema
    const webPageSchema: SchemaData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": baseUrl,
      name: `${classe.title} Classes - ${options.name}`,
      description: `Learn ${classe.title} with our regular and crash course options`,
      url: baseUrl,
      mainEntity: {
        "@type": "Course",
        name: classe.title,
        description: classe.description,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: options.basepath,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Classes",
            item: `${options.basepath}/classes`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: classe.title,
            item: baseUrl,
          },
        ],
      },
      publisher: {
        "@type": "Organization",
        name: options.name,
        logo: {
          "@type": "ImageObject",
          url: "https://sridharmusicalinstitute.com/images/smilogo.png",
        },
      },
    };

    // Service schema for demo class booking
    const serviceSchema: SchemaData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${baseUrl}#demo`,
      name: `${classe.title} Demo Class`,
      description: `Free demo class for ${classe.title}`,
      provider: {
        "@type": "Organization",
        name: options.name,
        url: options.basepath,
      },
      serviceType: "Music Education Demo",
      areaServed: {
        "@type": "Place",
        name: "Bangalore",
      },
      offers: {
        "@type": "Offer",
        description: "Free demo class",
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    };

    return [webPageSchema, regularCourseSchema, crashCourseSchema, serviceSchema];
  };

  const allSchemas = generateClassSchemas();

  return (
    <Container width="marginy">
      {/* Add structured data */}
      <Schema schema={allSchemas} />
      
      <Heading className="text-center mb-10" asChild={true}>
        <h1>{classe.title}</h1>
      </Heading>
      
      <article className="flex flex-wrap gap-8">
        <Image
          src={classe.img!}
          className="lg:w-1/2 h-auto object-cover"
          alt={classe.title}
          title={classe.title}
          width={640}
          height={480}
        />
        <div>
          <Heading size="sm" className="mb-5">
            Course Overview
          </Heading>
          <ul className="mb-10 list-inside list-decimal">
            {classe.overview?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <Card>
            <CardContent className="p-5 flex flex-wrap gap-5">
              <div>
                <Heading size="sm">Details</Heading>
                <p className="mt-5 font-semibold">Regular Classes:</p>
                <p>{classe.fees}</p>
                <p>{classe.duration}</p>
                <p className="mt-5 font-semibold">Crash Course:</p>
                <p>{classe.crashCourse}</p>
                <p className="mt-5 font-semibold">{classe.admission}</p>
              </div>
              <div>
                <Heading size="xs" className="mb-5">
                  Register for a demo class.
                </Heading>
                <div className="flex place-content-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Book Demo</Button>
                    </DialogTrigger>
                    <DialogContent
                      className="sm:max-w-md"
                      aria-describedby={undefined}
                    >
                      <DialogHeader>
                        <DialogTitle>Register for a demo class.</DialogTitle>
                      </DialogHeader>
                      <DemoClassForm
                        fetchTitle={classe.title}
                        onDemoFormAction={onDemoFormAction}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>
    </Container>
  );
}


// // app/classes/[...slug]/page.tsx
// import { classes, options } from "#site/content";
// import { notFound } from "next/navigation";
// import { Metadata } from "next";
// import Image from "next/image";
// import { Heading } from "@/components/custom-ui/heading";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { DemoClassForm } from "@/components/forms/demo-class-form";
// import { Button } from "@/components/ui/button";
// import { onDemoFormAction } from "@/app/actions/demoFormAction";
// import { Container } from "@/components/custom-ui/container";

// interface ClassesPageProps {
//   params: {
//     slug: string[];
//   };
// }

// async function getClassesFromParams(params: ClassesPageProps["params"]) {
//   const resolvedParams = await params;
//   const slug = resolvedParams?.slug?.join("/");
//   const classe = classes.find((classe) => classe.slugAsParams === slug);
//   return classe;
// }

// export async function generateMetadata({
//   params,
// }: ClassesPageProps): Promise<Metadata> {
//   const classe = await getClassesFromParams(params);

//   if (!classe) {
//     return {};
//   }

//   const ogSearchParams = new URLSearchParams();
//   ogSearchParams.set("title", classe.title);

//   return {
//     title: `${classe.title} | Sridhar Musical Institute`,
//     description: `Learn to play ${classe.title} from Sridhar Musical Institute. Book a demo class today or visit our institute in Ulsoor,Bangalore.`,
//     authors: { name: options.author.name },
//     openGraph: {
//       title: classe.title,
//       description: classe.description,
//       type: "article",
//       url: classe.slug,
//       images: [
//         {
//           url: classe.img || " ",
//           width: 1200,
//           height: 630,
//           alt: classe.title,
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: classe.title,
//       description: classe.description,
//     },
//   };
// }

// export async function generateStaticParams(): Promise<
//   ClassesPageProps["params"][]
// > {
//   return classes.map((classe) => ({ slug: classe.slugAsParams.split("/") }));
// }

// export default async function ClassePage({ params }: ClassesPageProps) {
//   const classe = await getClassesFromParams(params);

//   if (!classe || !classe.published) {
//     notFound();
//   }

//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "TouristTrip",
//     name: classe.title,
//     image: classe.img,
//     description: classe.description,
//   };

//   return (
//     <Container width="marginy">
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />
//       <Heading className="text-center mb-10" asChild={true}>
//         <h1> {classe.title} </h1>
//       </Heading>
//       <article className="flex flex-wrap gap-8">
//         <Image
//           src={classe.img!}
//           className="lg:w-1/2 h-auto object-cover"
//           alt={classe.title}
//           title={classe.title}
//           width={640}
//           height={480}
//         />
//         <div>
//           <Heading size="sm" className="mb-5">
//             Course Overview
//           </Heading>
//           <ul className="mb-10 list-inside list-decimal">
//             {classe.overview.map((item, index) => (
//               <li key={index}>{item}</li>
//             ))}
//           </ul>

//           <Card>
//             <CardContent className="p-5 flex flex-wrap gap-5">
//               <div>
//                 <Heading size="sm">Details</Heading>
//                 <p className="mt-5 font-semibold">Regular Classes:</p>
//                 <p>{classe.fees}</p>
//                 <p>{classe.duration}</p>
//                 <p className="mt-5 font-semibold">Crash Course:</p>
//                 <p>{classe.crashCourse}</p>
//                 <p className="mt-5 font-semibold">{classe.admission}</p>
//               </div>
//               <div>
//                 <Heading size="xs" className="mb-5">
//                   Register for a demo class.
//                 </Heading>
//                 <div className="flex place-content-center">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button>Book Demo</Button>
//                     </DialogTrigger>
//                     <DialogContent
//                       className="sm:max-w-md"
//                       aria-describedby={undefined}
//                     >
//                       <DialogHeader>
//                         <DialogTitle>Register for a demo class.</DialogTitle>
//                       </DialogHeader>
//                       <DemoClassForm
//                         fetchTitle={classe.title}
//                         onDemoFormAction={onDemoFormAction}
//                       />
//                     </DialogContent>
//                   </Dialog>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </article>

//       {/* <MDXContent code={classe.body || " "} /> */}
//     </Container>
//   );
// }
