import { and, asc, desc, eq, getTableColumns } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getDb } from '@/infrastructure/db/client';
import {
  awards,
  categories,
  clients,
  faqs,
  heroSlides,
  mediaAssets,
  members,
  posts,
  projects,
  services,
  siteSettings,
  stats,
  testimonials,
  values,
} from '@/infrastructure/db/schema';

/**
 * Read models for the public site. These are denormalised, media-resolved views built
 * for server components — no N+1: media is joined, not fetched per row.
 */

export interface HeroSlideView {
  id: string;
  eyebrow: string | null;
  headline: string;
  kickerWord: string | null;
  body: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
}

export interface ProjectCardView {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  categoryName: string | null;
  coverUrl: string | null;
  coverBlurhash: string | null;
  year: number | null;
  location: string | null;
}

export async function getSiteSettings(tenantId: string) {
  const logoLight = alias(mediaAssets, 'logo_light');
  const logoDark = alias(mediaAssets, 'logo_dark');
  const [row] = await getDb()
    .select({
      ...getTableColumns(siteSettings),
      logoLightUrl: logoLight.url,
      logoDarkUrl: logoDark.url,
    })
    .from(siteSettings)
    .leftJoin(logoLight, eq(logoLight.id, siteSettings.logoLightMediaId))
    .leftJoin(logoDark, eq(logoDark.id, siteSettings.logoDarkMediaId))
    .where(eq(siteSettings.tenantId, tenantId))
    .limit(1);
  return row ?? null;
}

export async function getActiveHeroSlides(tenantId: string): Promise<HeroSlideView[]> {
  const image = mediaAssets;
  const rows = await getDb()
    .select({
      id: heroSlides.id,
      eyebrow: heroSlides.eyebrow,
      headline: heroSlides.headline,
      kickerWord: heroSlides.kickerWord,
      body: heroSlides.body,
      ctaLabel: heroSlides.ctaLabel,
      ctaHref: heroSlides.ctaHref,
      imageUrl: image.url,
      imageId: heroSlides.imageMediaId,
      videoId: heroSlides.videoMediaId,
    })
    .from(heroSlides)
    .leftJoin(image, eq(image.id, heroSlides.imageMediaId))
    .where(and(eq(heroSlides.tenantId, tenantId), eq(heroSlides.isActive, true)))
    .orderBy(asc(heroSlides.sortOrder));

  // Resolve video URLs in one extra query keyed by id (kept O(1) round-trips).
  const videoIds = rows.map((r) => r.videoId).filter((v): v is string => Boolean(v));
  const videoMap = new Map<string, string>();
  if (videoIds.length) {
    const vids = await getDb()
      .select({ id: mediaAssets.id, url: mediaAssets.url })
      .from(mediaAssets)
      .where(eq(mediaAssets.tenantId, tenantId));
    for (const v of vids) videoMap.set(v.id, v.url);
  }

  return rows.map((r) => ({
    id: r.id,
    eyebrow: r.eyebrow,
    headline: r.headline,
    kickerWord: r.kickerWord,
    body: r.body,
    imageUrl: r.imageUrl,
    videoUrl: r.videoId ? (videoMap.get(r.videoId) ?? null) : null,
    ctaLabel: r.ctaLabel,
    ctaHref: r.ctaHref,
  }));
}

function projectCardSelect() {
  return {
    id: projects.id,
    slug: projects.slug,
    title: projects.title,
    summary: projects.summary,
    completedAt: projects.completedAt,
    location: projects.location,
    categoryName: categories.name,
    coverUrl: mediaAssets.url,
    coverBlurhash: mediaAssets.blurhash,
  };
}

function toCard(r: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  completedAt: Date | null;
  location: string | null;
  categoryName: string | null;
  coverUrl: string | null;
  coverBlurhash: string | null;
}): ProjectCardView {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    categoryName: r.categoryName,
    coverUrl: r.coverUrl,
    coverBlurhash: r.coverBlurhash,
    year: r.completedAt ? r.completedAt.getFullYear() : null,
    location: r.location,
  };
}

export async function getFeaturedProjects(tenantId: string, limit = 6): Promise<ProjectCardView[]> {
  const rows = await getDb()
    .select(projectCardSelect())
    .from(projects)
    .leftJoin(categories, eq(categories.id, projects.categoryId))
    .leftJoin(mediaAssets, eq(mediaAssets.id, projects.coverMediaId))
    .where(
      and(
        eq(projects.tenantId, tenantId),
        eq(projects.status, 'published'),
        eq(projects.isFeatured, true),
      ),
    )
    .orderBy(asc(projects.sortOrder))
    .limit(limit);
  return rows.map(toCard);
}

export async function getPublishedProjects(tenantId: string): Promise<ProjectCardView[]> {
  const rows = await getDb()
    .select(projectCardSelect())
    .from(projects)
    .leftJoin(categories, eq(categories.id, projects.categoryId))
    .leftJoin(mediaAssets, eq(mediaAssets.id, projects.coverMediaId))
    .where(and(eq(projects.tenantId, tenantId), eq(projects.status, 'published')))
    .orderBy(asc(projects.sortOrder));
  return rows.map(toCard);
}

export interface ServiceFlatView {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  parentId: string | null;
  iconUrl: string | null;
}

export async function getServices(tenantId: string): Promise<ServiceFlatView[]> {
  return getDb()
    .select({
      id: services.id,
      title: services.title,
      slug: services.slug,
      excerpt: services.excerpt,
      parentId: services.parentId,
      iconUrl: mediaAssets.url,
    })
    .from(services)
    .leftJoin(mediaAssets, eq(mediaAssets.id, services.iconMediaId))
    .where(and(eq(services.tenantId, tenantId), eq(services.status, 'published')))
    .orderBy(asc(services.sortOrder));
}

export interface ServiceCategoryView {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  iconUrl: string | null;
  children: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    iconUrl: string | null;
  }[];
}

/** Nests flat services into top-level categories with their sub-services. */
export function groupServicesByCategory(flat: ServiceFlatView[]): ServiceCategoryView[] {
  const topLevel = flat.filter((s) => !s.parentId);
  return topLevel.map((top) => ({
    ...top,
    children: flat.filter((s) => s.parentId === top.id),
  }));
}

export async function getStats(tenantId: string) {
  return getDb()
    .select({ id: stats.id, label: stats.label, value: stats.valueNumber, suffix: stats.suffix })
    .from(stats)
    .where(eq(stats.tenantId, tenantId))
    .orderBy(asc(stats.sortOrder));
}

export async function getPublishedMembers(tenantId: string) {
  return getDb()
    .select({
      id: members.id,
      name: members.name,
      roleTitle: members.roleTitle,
      bio: members.bio,
      photoUrl: mediaAssets.url,
      socials: members.socials,
    })
    .from(members)
    .leftJoin(mediaAssets, eq(mediaAssets.id, members.photoMediaId))
    .where(and(eq(members.tenantId, tenantId), eq(members.status, 'published')))
    .orderBy(asc(members.sortOrder));
}

export async function getTestimonials(tenantId: string) {
  return getDb()
    .select({
      id: testimonials.id,
      authorName: testimonials.authorName,
      authorRole: testimonials.authorRole,
      company: testimonials.company,
      quote: testimonials.quote,
      rating: testimonials.rating,
      avatarUrl: mediaAssets.url,
    })
    .from(testimonials)
    .leftJoin(mediaAssets, eq(mediaAssets.id, testimonials.avatarMediaId))
    .where(and(eq(testimonials.tenantId, tenantId), eq(testimonials.status, 'published')))
    .orderBy(asc(testimonials.sortOrder));
}

export async function getClients(tenantId: string) {
  return getDb()
    .select({
      id: clients.id,
      name: clients.name,
      website: clients.website,
      logoUrl: mediaAssets.url,
    })
    .from(clients)
    .leftJoin(mediaAssets, eq(mediaAssets.id, clients.logoMediaId))
    .where(eq(clients.tenantId, tenantId))
    .orderBy(asc(clients.sortOrder));
}

export async function getValues(tenantId: string) {
  return getDb()
    .select({ id: values.id, title: values.title, body: values.body })
    .from(values)
    .where(eq(values.tenantId, tenantId))
    .orderBy(asc(values.sortOrder));
}

export async function getFaqs(tenantId: string) {
  return getDb()
    .select({ id: faqs.id, question: faqs.question, answer: faqs.answer })
    .from(faqs)
    .where(and(eq(faqs.tenantId, tenantId), eq(faqs.status, 'published')))
    .orderBy(asc(faqs.sortOrder));
}

export async function getAwards(tenantId: string) {
  return getDb()
    .select({
      id: awards.id,
      title: awards.title,
      issuer: awards.issuer,
      year: awards.year,
      imageUrl: mediaAssets.url,
    })
    .from(awards)
    .leftJoin(mediaAssets, eq(mediaAssets.id, awards.mediaId))
    .where(eq(awards.tenantId, tenantId))
    .orderBy(desc(awards.year));
}

export async function getCategoriesWithCounts(tenantId: string) {
  const cats = await getDb()
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.tenantId, tenantId))
    .orderBy(asc(categories.sortOrder));
  return cats;
}

export async function getProjectBySlug(tenantId: string, slug: string) {
  const [row] = await getDb()
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      summary: projects.summary,
      body: projects.body,
      location: projects.location,
      clientName: projects.clientName,
      areaSqft: projects.areaSqft,
      completedAt: projects.completedAt,
      categoryName: categories.name,
      coverUrl: mediaAssets.url,
    })
    .from(projects)
    .leftJoin(categories, eq(categories.id, projects.categoryId))
    .leftJoin(mediaAssets, eq(mediaAssets.id, projects.coverMediaId))
    .where(
      and(
        eq(projects.tenantId, tenantId),
        eq(projects.slug, slug),
        eq(projects.status, 'published'),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getProjectGallery(tenantId: string, projectId: string) {
  return getDb()
    .select({
      id: mediaAssets.id,
      url: mediaAssets.url,
      altText: mediaAssets.altText,
      type: mediaAssets.type,
      blurhash: mediaAssets.blurhash,
    })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.tenantId, tenantId), eq(mediaAssets.projectId, projectId)))
    .orderBy(asc(mediaAssets.sortOrder));
}

export async function getRecentProjects(tenantId: string, limit = 8): Promise<ProjectCardView[]> {
  const rows = await getDb()
    .select(projectCardSelect())
    .from(projects)
    .leftJoin(categories, eq(categories.id, projects.categoryId))
    .leftJoin(mediaAssets, eq(mediaAssets.id, projects.coverMediaId))
    .where(and(eq(projects.tenantId, tenantId), eq(projects.status, 'published')))
    .orderBy(desc(projects.createdAt))
    .limit(limit);
  return rows.map(toCard);
}

export interface BlogPostCardView {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  publishedAt: Date | null;
  tags: string[];
}

export async function getPublishedPosts(tenantId: string): Promise<BlogPostCardView[]> {
  const rows = await getDb()
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverUrl: mediaAssets.url,
      publishedAt: posts.publishedAt,
      tags: posts.tags,
    })
    .from(posts)
    .leftJoin(mediaAssets, eq(mediaAssets.id, posts.coverMediaId))
    .where(and(eq(posts.tenantId, tenantId), eq(posts.status, 'published')))
    .orderBy(desc(posts.publishedAt));
  return rows;
}

export interface BlogPostDetailView extends BlogPostCardView {
  body: string | null;
}

export async function getPostBySlug(
  tenantId: string,
  slug: string,
): Promise<BlogPostDetailView | null> {
  const [row] = await getDb()
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      body: posts.body,
      coverUrl: mediaAssets.url,
      publishedAt: posts.publishedAt,
      tags: posts.tags,
    })
    .from(posts)
    .leftJoin(mediaAssets, eq(mediaAssets.id, posts.coverMediaId))
    .where(and(eq(posts.tenantId, tenantId), eq(posts.slug, slug), eq(posts.status, 'published')))
    .limit(1);
  return row ?? null;
}
