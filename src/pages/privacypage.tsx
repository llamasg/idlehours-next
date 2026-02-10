import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { motion } from "framer-motion";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              How we handle your data.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 rounded-2xl border border-border/40 bg-card p-6 md:p-10">
            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Information We Collect
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Idle Hours is a content-first site. We collect minimal personal information and only what's
                necessary to provide our services:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Contact forms:</strong> If you reach out via our
                    contact page, we collect your name and email address to respond to your message.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Quiz results:</strong> Quiz results may be stored
                    locally in your browser (localStorage) for your convenience. We don't collect or store
                    quiz data on our servers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Preferences:</strong> Game browsing preferences and quiz results may be stored locally in your browser for your convenience. No personal data is associated with these.
                  </span>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Cookies & Local Storage
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We use browser localStorage (not cookies) to store non-personal data like quiz results
                and voting status. This data stays on your device and is never sent to our servers. You
                can clear this data at any time through your browser settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Third-Party Services
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We use the following third-party services:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Sanity CMS:</strong> Our content management system.
                    No personal user data is stored in Sanity.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Etsy:</strong> When you click through to our Etsy
                    shop, you're subject to Etsy's privacy policy, not ours.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Affiliate partners:</strong> Affiliate links may
                    track clicks for commission purposes. We don't receive personal data from these clicks.
                  </span>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Data Security
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We take reasonable measures to protect any data we collect. However, no method of
                transmission or storage is 100% secure. We do our best, but we can't guarantee absolute
                security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Your Rights
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                You have the right to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Request deletion of any personal data we've collected</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Opt out of data collection by not using interactive features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Clear localStorage data through your browser settings</span>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Contact
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                If you have questions about this privacy policy, reach out via our{" "}
                <a href="/contact" className="text-primary hover:underline">
                  contact page
                </a>
                .
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
