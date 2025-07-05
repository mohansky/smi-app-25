import { options } from "@/.velite";
import { MetadataRoute } from "next";

// Define your pages structure
const pages = [
  { 
    path: '', 
    priority: 1, 
    changeFrequency: 'monthly' as const 
  },
  { 
    path: '/about', 
    priority: 0.7, 
    changeFrequency: 'yearly' as const 
  },
  { 
    path: '/classes', 
    priority: 0.9, 
    changeFrequency: 'monthly' as const 
  },
  { 
    path: '/classes/guitar', 
    priority: 0.8, 
    changeFrequency: 'monthly' as const 
  },
  { 
    path: '/classes/drums', 
    priority: 0.8, 
    changeFrequency: 'monthly' as const 
  },
  { 
    path: '/classes/keyboard', 
    priority: 0.8, 
    changeFrequency: 'monthly' as const 
  },
  { 
    path: '/gallery', 
    priority: 0.6, 
    changeFrequency: 'weekly' as const 
  },
  { 
    path: '/contact', 
    priority: 0.5, 
    changeFrequency: 'yearly' as const 
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = options.basepath;
  
  return pages.map(page => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}