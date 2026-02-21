'use client'
import Link from 'next/link'
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "@/components/ContactForm";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="font-heading text-4xl font-black text-foreground md:text-5xl">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground">
              Questions, feedback, or just want to say hi? We'd love to hear from you.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-10">
            <ContactForm />
          </div>

          {/* Additional Info */}
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              For business inquiries, product feedback, or collaboration opportunities
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/about"
                className="text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                About Us
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
