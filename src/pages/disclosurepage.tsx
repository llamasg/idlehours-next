import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { motion } from "framer-motion";

export default function DisclosurePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <h1 className="font-heading text-4xl font-black text-foreground md:text-5xl">
              Affiliate Disclosure
            </h1>
            <p className="text-xl text-muted-foreground">
              Full transparency on how we make money.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 rounded-2xl border border-border/40 bg-card p-6 md:p-10">
            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Affiliate Links
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Some links on this site are affiliate links. This means if you click through and make
                a purchase, we may earn a small commission at no extra cost to you. These commissions
                help us keep the site running and allow us to continue creating free content.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                We only recommend products and services we genuinely use, trust, or think would be
                valuable to our readers. Our editorial opinions are never influenced by affiliate
                partnerships — if we think something is bad, we'll say so, even if there's a potential
                commission attached.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Our Shop
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We also sell our own handmade products through our Etsy shop. When we link to our own
                products, we're transparent about it. These aren't affiliate links — they're direct
                links to items we design and create ourselves.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Product Reviews
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                When we review or recommend products:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    We only feature products we've personally used or thoroughly researched.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    If a product was gifted or provided for review, we'll clearly disclose that.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Our opinions are always honest, even if we received the product for free.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Questions?
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                If you have any questions about our affiliate relationships or product recommendations,
                feel free to reach out via our <a href="/contact" className="text-primary hover:underline">contact page</a>.
              </p>
            </section>

            <div className="border-t border-border/40 pt-6">
              <p className="text-sm text-muted-foreground/60">
                Last updated: February 2026
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
