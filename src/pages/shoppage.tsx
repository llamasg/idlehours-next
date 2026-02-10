import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { getAllProducts } from "@/lib/queries";
import type { Product } from "@/data/mock-data";

const categories = ["All", "Displays", "Holders", "Storage", "Accessories"];

const sectionVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        // Map Sanity data to Product interface
        const mappedProducts = data.map((p: any) => ({
          id: p._id,
          name: p.name,
          slug: p.slug.current,
          shortBlurb: p.shortBlurb,
          etsyUrl: p.etsyUrl,
          badge: p.badge,
          priceNote: p.priceNote,
          category: p.category,
          coverImageUrl: p.image,
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 font-heading text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
            Desk Setup
          </h1>
          <p className="mx-auto mb-2 max-w-2xl text-lg text-muted-foreground">
            Gear for cozy gamers. Quiet keyboards, warm lighting, and everything you need for the perfect gaming corner.
          </p>
          <p className="text-sm text-muted-foreground/60">
            Affiliate links — we earn a small commission at no extra cost to you.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
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
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-2xl bg-muted/40"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-card p-12 text-center">
              <p className="text-lg text-muted-foreground">
                No products found in this category.
              </p>
              <button
                onClick={() => setSelectedCategory("All")}
                className="mt-4 text-sm text-primary hover:underline"
              >
                View all products
              </button>
            </div>
          )}
        </motion.div>

        {/* Info Banner */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 rounded-2xl border border-border/40 bg-card p-8 text-center"
        >
          <h2 className="mb-2 font-heading text-xl font-bold text-foreground">
            Why We Recommend These
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every product here is something we actually use or would buy ourselves. We focus on comfort, quiet, and creating the kind of setup that makes you want to sit down and play for just one more hour.
          </p>
          <a
            href="/about"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Learn more about us →
          </a>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
