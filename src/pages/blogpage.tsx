import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { getAllPosts } from "@/lib/queries";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  subheader: string;
  publishedAt: string;
  author: string;
  headerImage: string;
  categories: string[];
}

const categories = ["All", "Lists", "Opinions", "Recommendations"];
const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [visiblePosts, setVisiblePosts] = useState(POSTS_PER_PAGE);

  useEffect(() => {
    getAllPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, setSearchParams]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((post) => post.categories?.includes(selectedCategory));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.subheader.toLowerCase().includes(query) ||
          post.categories?.some((cat) => cat.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [posts, selectedCategory, searchQuery]);

  const displayedPosts = filteredPosts.slice(0, visiblePosts);
  const hasMore = displayedPosts.length < filteredPosts.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-64 animate-pulse rounded-3xl bg-muted/40" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 font-heading text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
            Posts
          </h1>
          <p className="text-lg text-muted-foreground">
            Tips, reviews, and thoughtful takes on the cozy gaming life
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-full border-border/60 bg-muted/40 pl-12 pr-4"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setVisiblePosts(POSTS_PER_PAGE);
                }}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {(searchQuery || selectedCategory !== "All") && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Found {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
          </p>
        )}

        {/* Blog Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedPosts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link to={`/blog/${post.slug.current}`}>
                <motion.article
                  whileHover={{ y: -4, boxShadow: "0 8px 30px hsl(210 100% 50% / 0.15)" }}
                  transition={{ duration: 0.2 }}
                  className="group h-full overflow-hidden rounded-2xl border border-border/40 bg-card"
                >
                  {/* Image */}
                  <div className="aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-secondary via-card to-secondary">
                    {post.headerImage && (
                      <img
                        src={post.headerImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Categories */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {post.categories.slice(0, 2).map((cat) => (
                          <Badge
                            key={cat}
                            className="rounded-full bg-primary/20 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-primary"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="mb-2 font-heading text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary">
                      {post.title}
                    </h2>

                    {/* Subheader */}
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {post.subheader}
                    </p>

                    {/* Meta */}
                    <div className="mt-auto text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {post.author}
                    </div>
                  </div>
                </motion.article>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-border/40 bg-card p-12 text-center">
            <p className="mb-2 text-lg text-foreground">No posts found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-12 text-center">
            <Button
              onClick={() => setVisiblePosts((prev) => prev + POSTS_PER_PAGE)}
              className="rounded-full px-8 font-heading text-xs uppercase tracking-wider"
            >
              Load More
            </Button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}