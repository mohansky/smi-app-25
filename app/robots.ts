import { MetadataRoute } from 'next'
import { options } from "@/.velite";
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/dashboard/*',
        '/login',
        '/register',
        '/private/',
        '/api/',
        '/_next/',
        '/admin/',
      ],
    },
    sitemap: `${options.basepath}/sitemap.xml`,
  }
}