// app/classes/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/custom-ui/heading";
import { Container } from "@/components/custom-ui/container";
import { Schema } from "@/components/seo/schema";
import { generateCourseSchema } from "@/lib/schema";
import { classes, options } from "@/.velite";

interface ClassProps {
  title: string;
  description?: string | undefined;
  crashCourse?: string | undefined;
  img?: string | undefined;
  duration?: string | undefined;
  slug: string;
  weight: number;
  published: boolean;
  admission?: string | undefined;
}

// Generate metadata for the classes page
export const metadata: Metadata = {
  title: `${options.classesTitle} - ${options.name}`,
  description: `${options.description}`,
  openGraph: {
    title: `${options.classesTitle} - ${options.name}`,
    description: `${options.description}`,
    type: "website",
    url: `${options.basepath}/classes`,
  },
  alternates: {
    canonical: `${options.basepath}/classes`,
  },
};

export default async function ClassesPage() {
  const orderedProducts = classes.sort((classe1, classe2) =>
    classe1.weight > classe2.weight ? 1 : -1
  );
  const displayClasses = orderedProducts.filter((classe) => classe.published);

  // Generate course schemas for all published classes
  const courseSchemas = displayClasses.map((classe) => 
    generateCourseSchema({
      name: classe.title,
      description: classe.description || `Learn ${classe.title} with professional instruction`,
      duration: classe.duration,
      instructor: options.author.name, // You can customize this per class if needed
    })
  );

  // Create a CollectionPage schema for the classes listing
  const classesCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.classesTitle,
    description: "Complete listing of music classes and courses offered",
    url: `${options.basepath}/classes`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: displayClasses.length,
      itemListElement: displayClasses.map((classe, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Course",
          "@id": `${options.basepath}/classes/${classe.slug}`,
          name: classe.title,
          description: classe.description,
          image: classe.img,
          url: `${options.basepath}/classes/${classe.slug}`,
          provider: {
            "@type": "Organization",
            name: options.name,
            url: options.basepath,
          },
          courseMode: "in-person",
          educationalLevel: "Beginner to Advanced",
        },
      })),
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

  // Combine all schemas
  const allSchemas = [
    classesCollectionSchema,
    ...courseSchemas,
  ];

  return (
    <>
      {/* Add structured data */}
      <Schema schema={allSchemas} />
      
      <Container width="marginy">
        <Heading
          className="w-5/6 text-center text-balance mx-auto my-10"
          size="md"
          fontweight="medium"
        >
          {options.classesTitle}
        </Heading>
        
        {displayClasses?.length > 0 ? (
          <ul className="mt-20">
            {displayClasses.map((classe: ClassProps) => (
              <Card
                key={classe.slug}
                className="border-0 rounded-none flex flex-row flex-wrap even:flex-row-reverse"
              >
                <Image
                  className="lg:w-1/2"
                  src={classe.img || ""}
                  alt={classe.title}
                  title={classe.title}
                  width={720}
                  height={480}
                />
                <div className="p-10 lg:w-1/2">
                  <h2 className="font-bold text-3xl mb-10">{classe.title}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="col-span-2 md:col-span-1 p-5">
                      <Heading size="sm">Regular class</Heading>
                      <p>{classe.description}</p>
                    </Card>
                    <Card className="col-span-2 md:col-span-1 p-5">
                      <Heading size="sm">Crash Course</Heading>
                      <p>{classe.crashCourse}</p>
                    </Card>
                    <Card className="col-span-2 p-5">
                      <p className="font-semibold">{classe.admission}</p>
                    </Card>
                  </div>
                  <Link href={`${classe.slug}`}  title={classe.title}>
                    <Button className="my-5">Learn more</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </ul>
        ) : (
          <p>No classes available</p>
        )}
      </Container>
    </>
  );
}

// // app/classes/page.tsx
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Heading } from "@/components/custom-ui/heading";
// import { Container } from "@/components/custom-ui/container";
// import { classes, options } from "@/.velite";


// interface ClassProps {
//   title: string;
//   description?: string | undefined;
//   crashCourse?: string | undefined;
//   img?: string | undefined;
//   duration?: string | undefined;
//   slug: string;
//   weight: number;
//   published: boolean;
//   admission?: string | undefined;
// }

// export default async function ClassesPage() {
//   const orderedProducts = classes.sort((classe1, classe2) =>
//     classe1.weight > classe2.weight ? 1 : -1
//   );
//   const displayClasses = orderedProducts.filter((classe) => classe.published);

//   return (
//     <Container width="marginy">
//       <Heading
//         className="w-5/6 text-center text-balance mx-auto my-10"
//         size="md"
//         fontweight="medium"
//       >
//         {options.classesTitle}
//       </Heading>

//       {displayClasses?.length > 0 ? (
//         <ul className="mt-20">
//           {displayClasses.map((classe: ClassProps) => (
//             <Card
//               key={classe.slug}
//               className="border-0 rounded-none flex flex-row flex-wrap even:flex-row-reverse"
//             >
//               <Image
//                 className="lg:w-1/2 "
//                 src={classe.img || ""}
//                 alt={classe.title}
//                 title={classe.title}
//                 width={720}
//                 height={480}
//               />

//               <div className="p-10 lg:w-1/2 ">
//                 <h2 className="font-bold text-3xl mb-10">{classe.title}</h2>
//                 <div className="grid grid-cols-2 gap-4">
//                   <Card className="col-span-2 md:col-span-1 p-5">
//                     <Heading size="sm">Regular class</Heading>
//                     <p>{classe.description}</p>
//                   </Card>
//                   <Card className="col-span-2 md:col-span-1 p-5">
//                     <Heading size="sm">Crash Course</Heading>
//                     <p>{classe.crashCourse}</p>
//                   </Card>
//                   <Card className="col-span-2 p-5">
//                     <p className="font-semibold">{classe.admission}</p>
//                   </Card>
//                 </div>
//                 <Link href={`${classe.slug}`} title={classe.title}>
//                   <Button className="my-5">Learn more</Button>
//                 </Link>
//               </div>
//             </Card>
//           ))}
//         </ul>
//       ) : (
//         <p> No posts</p>
//       )}
//     </Container>
//   );
// }
