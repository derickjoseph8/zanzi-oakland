"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Sparkles,
  Users,
  Wine,
  Music,
  Star,
  MapPin,
  Clock,
  Play,
  Instagram,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Animated counter component
function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/\D/g, ""));

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, numericValue]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// Floating particles background
function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold-500/30 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: "100%",
            opacity: 0,
          }}
          animate={{
            y: "-100%",
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Marcus J.",
      location: "San Francisco",
      text: "The best nightclub experience in the Bay Area. The vibe is unmatched!",
      rating: 5,
    },
    {
      name: "Sofia R.",
      location: "Oakland",
      text: "Finally a club that celebrates ALL cultures. The music selection is incredible.",
      rating: 5,
    },
    {
      name: "David K.",
      location: "Los Angeles",
      text: "VIP service was exceptional. Will definitely be back whenever I'm in Oakland.",
      rating: 5,
    },
  ];

  const stats = [
    { label: "Years Open", value: "5", suffix: "+" },
    { label: "Events Hosted", value: "500", suffix: "+" },
    { label: "Happy Guests", value: "100", suffix: "K+" },
    { label: "5-Star Reviews", value: "2", suffix: "K+" },
  ];

  const features = [
    {
      icon: Music,
      title: "World Music",
      description: "Afrobeats, Latin, Hip-Hop, R&B, House and more. Our DJs spin sounds from every corner of the globe.",
    },
    {
      icon: Wine,
      title: "Premium Service",
      description: "VIP tables, top-shelf spirits, and dedicated hosts. Experience luxury nightlife at its finest.",
    },
    {
      icon: Users,
      title: "Inclusive Space",
      description: "A celebration of diversity where everyone belongs. All cultures, all backgrounds, one dance floor.",
    },
  ];

  return (
    <>
      {/* Hero Section with Video/Animation */}
      <motion.section
        style={{ opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-black to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-900/20 via-transparent to-transparent" />
        </motion.div>

        <ParticlesBackground />

        {/* Gold Accent Lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold-500/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8"
            >
              <Image
                src="/logo.gif"
                alt="Zanzi Oakland"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 border-gold-500/50 text-gold-400">
                <Sparkles className="h-3 w-3 mr-2" />
                Oakland&apos;s Premier International Nightclub
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600">
                Experience
              </span>
              <br />
              <span className="text-white">The Night</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Where diverse cultures unite under one roof. World-class DJs, premium bottle service,
              and an atmosphere unlike any other. Welcome to the Bay Area&apos;s most exclusive nightlife destination.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="xl" className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-semibold px-8 group">
                <Link href="/reservations">
                  Reserve a Table
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-white/30 hover:bg-white/10 px-8">
                <Link href="/events">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Events
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                className="text-center p-4"
              >
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/50 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-gold-500/30 flex items-start justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-gold-500/50 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 bg-gradient-to-b from-black to-black/95 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-gold-500/30">
              <Star className="h-3 w-3 mr-2 text-gold-500" />
              Why Choose Us
            </Badge>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              The Zanzi Difference
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">
              More than a nightclub. An experience that celebrates music, culture, and community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:border-gold-500/30 group h-full">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                      <feature.icon className="h-10 w-10 text-gold-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Section with Parallax */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-black to-gold-900/30" />
        <div className="absolute inset-0 bg-[url('/images/vip-bg.jpg')] bg-cover bg-center opacity-10" />

        {/* Animated border lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-gold-500/20 text-gold-400 border-gold-500/30">
                <Wine className="h-3 w-3 mr-2" />
                VIP Experience
              </Badge>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Elevate Your Night with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600"> Bottle Service</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Reserve a private table, enjoy premium spirits, and receive VIP treatment all night long.
                Our dedicated hosts ensure your experience is nothing short of exceptional.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                {[
                  { icon: ChevronRight, text: "Priority entry" },
                  { icon: ChevronRight, text: "Dedicated VIP host" },
                  { icon: ChevronRight, text: "Premium spirits" },
                  { icon: ChevronRight, text: "Best seating" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-white/80">
                    <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-gold-500" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-semibold">
                  <Link href="/bottle-service">View Packages</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-gold-500/30 hover:bg-gold-500/10">
                  <Link href="/reservations">Reserve Now</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-600/30 to-purple-600/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Image
                      src="/logo.gif"
                      alt="Zanzi VIP"
                      width={200}
                      height={200}
                      className="mx-auto mb-4"
                    />
                    <p className="text-white/60 text-lg">Experience Excellence</p>
                  </div>
                </div>
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-gold-500/50" />
                <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-gold-500/50" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-gold-500/50" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-gold-500/50" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 border-gold-500/30">
              <Star className="h-3 w-3 mr-2 text-gold-500" />
              Testimonials
            </Badge>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              What Our Guests Say
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 md:p-12">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-gold-500 fill-gold-500" />
                  ))}
                </div>
                <p className="text-xl md:text-2xl text-white/90 mb-8 italic leading-relaxed">
                  &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                </p>
                <div>
                  <p className="text-white font-semibold">{testimonials[currentTestimonial].name}</p>
                  <p className="text-white/50">{testimonials[currentTestimonial].location}</p>
                </div>
              </Card>
            </motion.div>

            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                className="border-gold-500/30 hover:bg-gold-500/10"
                onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentTestimonial ? "bg-gold-500 w-6" : "bg-white/30"
                    }`}
                    onClick={() => setCurrentTestimonial(i)}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-gold-500/30 hover:bg-gold-500/10"
                onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-24 bg-gradient-to-b from-black to-black/95">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Location</h3>
                    <p className="text-white/60">
                      19 Grand Avenue<br />
                      Oakland, CA 94612
                    </p>
                  </div>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-white/5">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977456894867!2d-122.27085!3d37.80483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ4JzE3LjQiTiAxMjLCsDE2JzE1LjEiVw!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Hours</h3>
                    <p className="text-white/60">
                      Friday: 9:00 PM - 2:00 AM<br />
                      Saturday: 10:00 PM - 3:00 AM
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-3 text-white/70">
                    <Users className="h-5 w-5 text-gold-500" />
                    <span>21+ with valid ID</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <Wine className="h-5 w-5 text-gold-500" />
                    <span>Dress code: Upscale casual</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Button asChild className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-semibold">
                    <Link href="/contact">
                      Contact Us
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-900/20 via-purple-900/20 to-gold-900/20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-6 border-gold-500/30">
              <Sparkles className="h-3 w-3 mr-2 text-gold-500" />
              Stay Connected
            </Badge>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Join the VIP List
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Get exclusive access to event announcements, VIP offers, and special promotions.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-14 px-6 rounded-xl border border-gold-500/30 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent backdrop-blur-xl"
              />
              <Button type="submit" size="lg" className="h-14 px-8 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-semibold">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent" />
        <ParticlesBackground />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6">
              Ready to Experience
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600"> Zanzi</span>?
            </h2>
            <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto">
              Book your table now and secure your spot for an unforgettable night.
            </p>
            <Button asChild size="xl" className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold px-12 py-6 text-lg rounded-xl shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 transition-all">
              <Link href="/reservations">
                Reserve Your Table
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
