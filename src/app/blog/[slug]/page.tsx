'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, User, Calendar, Share2, Zap, ArrowRight } from 'lucide-react';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/cms/blogs?slug=${slug}`);
        const data = await res.json();
        if (data.success) setBlog(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return <div className="py-24 text-center text-slate-500 text-sm">Loading article...</div>;
  }

  if (!blog) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white">Article Not Found</h2>
        <Link href="/blog" className="mt-4 inline-block text-xs font-bold text-cyan-400">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Knowledge Center
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
          {blog.category}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          {blog.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-b border-slate-800 pb-6">
          <span>By {blog.author}</span>
          <span>•</span>
          <span>{blog.readTime}</span>
          <span>•</span>
          <span>Published {new Date(blog.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert prose-cyan max-w-none text-slate-300 text-sm leading-relaxed space-y-4 whitespace-pre-line">
        {blog.content}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 neon-glow-cyan">
        <div>
          <h3 className="text-lg font-bold text-white">Ready to sell your device?</h3>
          <p className="text-xs text-slate-400 mt-1">Get an instant guaranteed valuation quote in 60 seconds.</p>
        </div>
        <Link
          href="/sell"
          className="px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-2"
        >
          <span>Calculate Price</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
