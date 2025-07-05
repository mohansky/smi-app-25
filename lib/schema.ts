// lib/schema.ts
import { options } from "#site/content";
// import { SchemaData } from "./schema";

interface ClassData {
  title: string;
  description?: string;
  crashCourse?: string;
  img?: string;
  duration?: string;
  slug: string;
  admission?: string;
}

export interface SchemaData {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

// Organization Schema for Sridhar Musical Institute
export const organizationSchema: SchemaData = {
  "@context": "https://schema.org",
  "@type": "MusicSchool",
  name: options.name,
  description: options.description,
  url: options.basepath,
  logo: {
    "@type": "ImageObject",
    url: "https://sridharmusicalinstitute.com/images/smilogo.png",
    width: 720,
    height: 230,
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: `${options.address.name[1]}`,
    addressLocality: `${options.address.name[1]}`,
    addressRegion: `${options.address.name[2]}`,
    postalCode: "560075",
    addressCountry: "India",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `${options.contact[1].name}`,
    contactType: "customer service",
    email: `${options.contact[0].name}`,
  },
  sameAs: [
    `${options.socials[0].link}`,
    `${options.socials[1].link}`,
    `${options.socials[2].link}`,
  ],
  founder: {
    "@type": "Person",
    name: options.author.name,
    url: options.author.url,
  },
  offers: {
    "@type": "Offer",
    category: "Music Education",
    description: "Professional music instruction and courses",
  },
};

// Website Schema
export const websiteSchema: SchemaData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: options.title,
  url: options.basepath,
  description: options.description,
  publisher: {
    "@type": "Organization",
    name: options.name,
    logo: {
      "@type": "ImageObject",
      url: "https://sridharmusicalinstitute.com/images/smilogo.png",
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${options.basepath}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// Course Schema Generator
export const generateCourseSchema = (course: {
  name: string;
  description: string;
  price?: number;
  duration?: string;
  instructor?: string;
}): SchemaData => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course.name,
  description: course.description,
  provider: {
    "@type": "Organization",
    name: options.name,
    url: options.basepath,
  },
  instructor: course.instructor
    ? {
        "@type": "Person",
        name: course.instructor,
      }
    : undefined,
  offers: course.price
    ? {
        "@type": "Offer",
        price: "Rs. 3000",
        priceCurrency: "INR",
      }
    : undefined,
  timeRequired: course.duration,
  courseMode: "in-person",
  educationalLevel: "Beginner to Advanced",
});

// Event Schema Generator
export const generateEventSchema = (event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  price?: number;
}): SchemaData => ({
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: event.name,
  description: event.description,
  startDate: event.startDate,
  endDate: event.endDate,
  location: {
    "@type": "Place",
    name: event.location,
    address: {
      "@type": "PostalAddress",
      addressLocality: `${options.address.name[2]}`,
      addressRegion: "Karnataka",
      addressCountry: "India",
    },
  },
  organizer: {
    "@type": "Organization",
    name: options.name,
    url: options.basepath,
  },
  offers: event.price
    ? {
        "@type": "Offer",
        price: event.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      }
    : undefined,
});

// FAQ Schema Generator
export const generateFAQSchema = (
  faqs: Array<{
    question: string;
    answer: string;
  }>
): SchemaData => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

// Article/Blog Post Schema Generator
export const generateArticleSchema = (article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
}): SchemaData => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  author: {
    "@type": "Person",
    name: article.author,
  },
  publisher: {
    "@type": "Organization",
    name: options.name,
    logo: {
      "@type": "ImageObject",
      url: "https://sridharmusicalinstitute.com/images/smilogo.png",
    },
  },
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  url: article.url,
  image: article.image
    ? {
        "@type": "ImageObject",
        url: article.image,
      }
    : undefined,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": article.url,
  },
});

// Local Business Schema (if applicable)
export const localBusinessSchema: SchemaData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${options.basepath}#organization`,
  name: options.name,
  description: options.description,
  url: options.basepath,
  telephone: `${options.contact[1].name}`,
  email: `${options.contact[0].name}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${options.address.name[1]}`,
    addressLocality: `${options.address.name[1]}`,
    addressRegion: "Karnataka",
    postalCode: "560075",
    addressCountry: "India",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "12.9708658",
    longitude: "77.6278365",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "10:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "20:00",
    },
  ],
  priceRange: "$$",
  image: "https://sridharmusicalinstitute.com/images/smilogo.png",
  logo: "https://sridharmusicalinstitute.com/images/smilogo.png",
  sameAs: [
    `${options.socials[0].link}`,
    `${options.socials[1].link}`,
    `${options.socials[2].link}`,
  ],
};



// Enhanced course schema generator for classes with both regular and crash courses
export const generateClassSchema = (classData: ClassData): SchemaData[] => {
  const baseUrl = `${options.basepath}/classes/${classData.slug}`;
  
  const schemas: SchemaData[] = [];

  // Main course schema (regular class)
  const mainCourseSchema: SchemaData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${baseUrl}#regular`,
    name: `${classData.title} - Regular Course`,
    description: classData.description || `Learn ${classData.title} with comprehensive instruction`,
    image: classData.img ? {
      "@type": "ImageObject",
      url: classData.img,
      description: `${classData.title} course image`,
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
    timeRequired: classData.duration,
    coursePrerequisites: "No prior experience required",
    teaches: `${classData.title} fundamentals and advanced techniques`,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "in-person",
      instructor: {
        "@type": "Person",
        name: options.author.name,
        worksFor: {
          "@type": "Organization",
          name: options.name,
        },
      },
    },
  };

  schemas.push(mainCourseSchema);

  // Crash course schema (if available)
  if (classData.crashCourse) {
    const crashCourseSchema: SchemaData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": `${baseUrl}#crash`,
      name: `${classData.title} - Crash Course`,
      description: classData.crashCourse,
      image: classData.img ? {
        "@type": "ImageObject",
        url: classData.img,
        description: `${classData.title} crash course image`,
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
      teaches: `Intensive ${classData.title} training`,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "in-person",
        instructor: {
          "@type": "Person",
          name: options.author.name,
        },
      },
    };

    schemas.push(crashCourseSchema);
  }

  return schemas;
};

// Individual class page schema (for /classes/[slug] pages)
export const generateClassPageSchema = (classData: ClassData): SchemaData => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${options.basepath}/classes/${classData.slug}`,
    name: `${classData.title} Classes - ${options.name}`,
    description: `Learn ${classData.title} with our regular and crash course options`,
    url: `${options.basepath}/classes/${classData.slug}`,
    mainEntity: {
      "@type": "Course",
      name: classData.title,
      description: classData.description,
      provider: {
        "@type": "Organization",
        name: options.name,
      },
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
          name: classData.title,
          item: `${options.basepath}/classes/${classData.slug}`,
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
};