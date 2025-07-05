// components/seo/seo-head.tsx
import Head from "next/head"; 
import { organizationSchema, SchemaData, websiteSchema } from "@/lib/schema";
import { Schema } from "./schema";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  additionalSchema?: SchemaData[];
}

export function SEOHead({
  title,
  description,
  canonical,
  image,
  additionalSchema = [],
}: SEOHeadProps) {
  const allSchemas = [
    organizationSchema,
    websiteSchema,
    ...additionalSchema,
  ];

  return (
    <>
      <Head>
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        {canonical && <link rel="canonical" href={canonical} />}
        {image && <meta property="og:image" content={image} />}
      </Head>
      <Schema schema={allSchemas} />
    </>
  );
}