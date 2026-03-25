import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { name: "Events", href: "/events" },
  { name: "Reservations", href: "/reservations" },
  { name: "Bottle Service", href: "/bottle-service" },
  { name: "Gallery", href: "/gallery" },
];

const infoLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Careers", href: "/careers" },
];

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/zanzioakland", icon: Instagram },
  { name: "Facebook", href: "https://facebook.com/zanzioakland", icon: Facebook },
  { name: "Twitter", href: "https://twitter.com/zanzioakland", icon: Twitter },
];

export function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative w-24 h-24">
                <Image
                  src="/logo.gif"
                  alt="Zanzi Oakland"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-white/60 text-sm">
              Oakland&apos;s premier international nightclub experience. Where diverse cultures unite under one roof.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 hover:bg-gold-500/20 transition-colors text-white/60 hover:text-gold-500"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-gold-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Information</h3>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-gold-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>123 Broadway<br />Oakland, CA 94607</span>
              </li>
              <li>
                <a
                  href="tel:+15105550123"
                  className="flex items-center gap-3 text-white/60 hover:text-gold-500 transition-colors text-sm"
                >
                  <Phone className="h-4 w-4" />
                  (510) 555-0123
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@zanzioakland.com"
                  className="flex items-center gap-3 text-white/60 hover:text-gold-500 transition-colors text-sm"
                >
                  <Mail className="h-4 w-4" />
                  info@zanzioakland.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} Zanzi Oakland. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gold-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold-500 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
