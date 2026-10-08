import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trustmygadget.com';
  const currentDate = new Date();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/sell`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/why-us`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faqs`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/support`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/track-order`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
  ];

  let blogRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let brandRoutes: MetadataRoute.Sitemap = [];
  let modelRoutes: MetadataRoute.Sitemap = [];

  try {
    const blogs = db.prepare('SELECT slug, updatedAt, publishedAt FROM blogs WHERE isPublished = 1').all() as any[];
    blogRoutes = blogs.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt || b.publishedAt ? new Date(b.updatedAt || b.publishedAt) : currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const categories = db.prepare('SELECT id, slug FROM categories WHERE isActive = 1').all() as any[];
    categoryRoutes = categories.map((c) => ({
      url: `${baseUrl}/sell/${c.slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    const brands = db.prepare(`
      SELECT b.slug as brandSlug, c.slug as categorySlug
      FROM brands b
      JOIN categories c ON b.categoryId = c.id
      WHERE b.isActive = 1
    `).all() as any[];

    brandRoutes = brands.map((b) => ({
      url: `${baseUrl}/sell/${b.categorySlug}/${b.brandSlug}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    const models = db.prepare(`
      SELECT m.slug as modelSlug, b.slug as brandSlug, c.slug as categorySlug, m.updatedAt
      FROM models m
      JOIN brands b ON m.brandId = b.id
      JOIN categories c ON m.categoryId = c.id
      WHERE m.isActive = 1
    `).all() as any[];

    modelRoutes = models.map((m) => ({
      url: `${baseUrl}/sell/${m.categorySlug}/${m.brandSlug}/${m.modelSlug}`,
      lastModified: m.updatedAt ? new Date(m.updatedAt) : currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Failed to load dynamic sitemap catalog entries:', e);
  }

  return [...staticRoutes, ...blogRoutes, ...categoryRoutes, ...brandRoutes, ...modelRoutes];
}
