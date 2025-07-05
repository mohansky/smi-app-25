// components/seo/schema.tsx
import Script from "next/script";
import { SchemaData } from "@/lib/schema";

interface SchemaProps {
  schema: SchemaData | SchemaData[];
}

export function Schema({ schema }: SchemaProps) {
  const schemaArray = Array.isArray(schema) ? schema : [schema];
  
  return (
    <>
      {schemaArray.map((schemaItem, index) => (
        <Script
          key={index}
          id={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaItem),
          }}
        />
      ))}
    </>
  );
}