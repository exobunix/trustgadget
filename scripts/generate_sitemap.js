const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function generateSitemap() {
  const dbPath = path.join(__dirname, '..', 'trustmygadget.db');
  const db = new Database(dbPath);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trustmygadget.com';
  const today = new Date().toISOString().split('T')[0];

  console.log(`Generating sitemap with baseUrl: ${baseUrl}, date: ${today}`);

  const urls = [];

  // 1. Static Core Routes
  const staticRoutes = [
    { loc: `${baseUrl}`, lastmod: today, changefreq: 'daily', priority: '1.0' },
    { loc: `${baseUrl}/sell`, lastmod: today, changefreq: 'daily', priority: '0.9' },
    { loc: `${baseUrl}/how-it-works`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/why-us`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/about`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
    { loc: `${baseUrl}/faqs`, lastmod: today, changefreq: 'weekly', priority: '0.7' },
    { loc: `${baseUrl}/blog`, lastmod: today, changefreq: 'daily', priority: '0.7' },
    { loc: `${baseUrl}/contact`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
    { loc: `${baseUrl}/terms`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
    { loc: `${baseUrl}/privacy`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
    { loc: `${baseUrl}/support`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
    { loc: `${baseUrl}/track-order`, lastmod: today, changefreq: 'daily', priority: '0.7' },
  ];
  urls.push(...staticRoutes);

  // 2. Blog Posts
  try {
    const blogs = db.prepare('SELECT slug, updatedAt, publishedAt FROM blogs WHERE isPublished = 1').all();
    for (const b of blogs) {
      const dateVal = b.updatedAt || b.publishedAt;
      const lastmod = dateVal ? new Date(dateVal).toISOString().split('T')[0] : today;
      urls.push({
        loc: `${baseUrl}/blog/${b.slug}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.7',
      });
    }
    console.log(`Added ${blogs.length} blog posts`);
  } catch (err) {
    console.error('Error fetching blogs:', err.message);
  }

  // 3. Category Routes
  try {
    const categories = db.prepare('SELECT id, slug FROM categories WHERE isActive = 1 ORDER BY displayOrder ASC, name ASC').all();
    for (const c of categories) {
      urls.push({
        loc: `${baseUrl}/sell/${c.slug}`,
        lastmod: today,
        changefreq: 'daily',
        priority: '0.9',
      });
    }
    console.log(`Added ${categories.length} categories`);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
  }

  // 4. Brand Routes
  try {
    const brands = db.prepare(`
      SELECT b.slug as brandSlug, c.slug as categorySlug
      FROM brands b
      JOIN categories c ON b.categoryId = c.id
      WHERE b.isActive = 1
      ORDER BY c.slug ASC, b.name ASC
    `).all();
    for (const b of brands) {
      urls.push({
        loc: `${baseUrl}/sell/${b.categorySlug}/${b.brandSlug}`,
        lastmod: today,
        changefreq: 'daily',
        priority: '0.8',
      });
    }
    console.log(`Added ${brands.length} brand pages`);
  } catch (err) {
    console.error('Error fetching brands:', err.message);
  }

  // 5. Model Routes
  try {
    const models = db.prepare(`
      SELECT m.slug as modelSlug, b.slug as brandSlug, c.slug as categorySlug, m.updatedAt
      FROM models m
      JOIN brands b ON m.brandId = b.id
      JOIN categories c ON m.categoryId = c.id
      WHERE m.isActive = 1
      ORDER BY c.slug ASC, b.slug ASC, m.name ASC
    `).all();
    for (const m of models) {
      const lastmod = m.updatedAt ? new Date(m.updatedAt).toISOString().split('T')[0] : today;
      urls.push({
        loc: `${baseUrl}/sell/${m.categorySlug}/${m.brandSlug}/${m.modelSlug}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.7',
      });
    }
    console.log(`Added ${models.length} model pages`);
  } catch (err) {
    console.error('Error fetching models:', err.message);
  }

  // Generate XML
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const xmlBody = urls.map((u) => {
    return `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`;
  }).join('\n');
  const xmlFooter = '\n</urlset>\n';

  const sitemapXml = xmlHeader + xmlBody + xmlFooter;

  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXml, 'utf8');
  console.log(`Successfully generated public/sitemap.xml with ${urls.length} URLs! Size: ${(Buffer.byteLength(sitemapXml, 'utf8') / 1024).toFixed(1)} KB`);
}

generateSitemap();
