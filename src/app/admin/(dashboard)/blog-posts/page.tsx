import type { Metadata } from "next";
import { BlogPostsAdminPanel } from "@/components/admin/BlogPostsAdminPanel";
import { getBlogPostsForAdmin } from "@/app/actions/blog-posts-admin";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("blog");
}

export default async function AdminBlogPostsPage() {
  const posts = await getBlogPostsForAdmin();

  return <BlogPostsAdminPanel initialPosts={posts} />;
}
