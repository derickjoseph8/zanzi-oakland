"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
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

// Marquee text component
function MarqueeText({ text, speed = 30 }: { text: string; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-block"
        animate={{ x: [0, -1000] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="inline-block mx-8 text-gold-500/20 text-2xl font-bold uppercase tracking-[0.3em]">
            {text} <span className="text-gold-500/40">★</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const textY = useTransform(scrollY, [0, 500], [0, 100]);

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
      description: "Afrobeats, Latin, Hip-Hop, R&B, House and more.",
    },
    {
      icon: Wine,
      title: "Premium Service",
      description: "VIP tables, top-shelf spirits, dedicated hosts.",
    },
    {
      icon: Users,
      title: "Inclusive Space",
      description: "All cultures, all backgrounds, one dance floor.",
    },
  ];

  return (
    <>
      {/* Hero Section - Full Impact */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(212,175,55,0.15) 0%, transparent 50%)`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gold-900/20 via-transparent to-transparent" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        {/* Decorative lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/10 to-transparent" />
          <div className="absolute top-0 left-1/4 h-full w-px bg-gradient-to-b from-transparent via-gold-500/10 to-transparent" />
          <div className="absolute top-0 right-1/4 h-full w-px bg-gradient-to-b from-transparent via-gold-500/10 to-transparent" />
        </div>

        {/* Main content */}
        <motion.div
          style={{ opacity: heroOpacity, y: textY }}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          {/* Small badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-8 border-gold-500/30 text-gold-400 px-4 py-1.5">
              <Sparkles className="h-3 w-3 mr-2" />
              Oakland&apos;s Premier International Nightclub
            </Badge>
          </motion.div>

          {/* Giant Typography */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
              className="font-serif text-[15vw] md:text-[12vw] lg:text-[10vw] font-black leading-[0.85] tracking-tighter"
            >
              <span className="block text-white">ZANZI</span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-4 mb-12"
          >
            <span className="text-2xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 font-light tracking-[0.3em] uppercase">
              Oakland
            </span>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto font-light"
          >
            Where cultures collide and nights come alive
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-10 py-6 text-lg rounded-none group"
            >
              <Link href="/reservations">
                RESERVE A TABLE
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 hover:bg-white/5 px-10 py-6 text-lg rounded-none"
            >
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                VIEW EVENTS
              </Link>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-24 flex flex-wrap justify-center gap-12 md:gap-20"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gold-500">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/40 uppercase tracking-[0.2em] mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-px h-16 bg-gradient-to-b from-gold-500/50 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <section className="py-8 bg-black border-y border-white/5 overflow-hidden">
        <MarqueeText text="NIGHTLIFE • CULTURE • MUSIC • VIBES • ENERGY" />
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 bg-black relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              The <span className="text-gold-500">Experience</span>
            </h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto">
              More than a nightclub. A celebration of music, culture, and community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <Card className="bg-white/[0.03] border-white/10 hover:border-gold-500/30 transition-all duration-500 group h-full rounded-none">
                  <CardContent className="p-10">
                    <div className="w-16 h-16 border border-gold-500/30 flex items-center justify-center mb-6 group-hover:bg-gold-500/10 transition-colors">
                      <feature.icon className="h-8 w-8 text-gold-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/50">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-900/10 via-transparent to-gold-900/10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-transparent text-gold-400 border-gold-500/30 rounded-none">
                <Wine className="h-3 w-3 mr-2" />
                VIP EXPERIENCE
              </Badge>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                Bottle Service
                <span className="block text-gold-500">Like No Other</span>
              </h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Reserve a private table, enjoy premium spirits, and receive VIP treatment all night.
                Your dedicated host ensures perfection.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {["Priority Entry", "Private Tables", "Premium Bottles", "VIP Hosts"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/70">
                    <div className="w-2 h-2 bg-gold-500" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button asChild className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-8 rounded-none">
                  <Link href="/bottle-service">View Packages</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/20 hover:bg-white/5 px-8 rounded-none">
                  <Link href="/reservations">Reserve Now</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 border border-gold-500/20" />
              <div className="absolute inset-4 border border-gold-500/10" />
              <div className="absolute inset-8 bg-gradient-to-br from-gold-900/30 to-black flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl font-serif font-bold text-gold-500 mb-2">VIP</div>
                  <p className="text-white/40 tracking-[0.3em] uppercase text-sm">Experience Excellence</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4">
              What They Say
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gold-500 fill-gold-500 mx-0.5" />
                  ))}
                </div>
                <p className="text-2xl md:text-3xl text-white/90 mb-8 font-light italic">
                  &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                </p>
                <p className="text-gold-500 font-semibold">{testimonials[currentTestimonial].name}</p>
                <p className="text-white/40 text-sm">{testimonials[currentTestimonial].location}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-3 mt-10">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 transition-all ${
                    i === currentTestimonial ? "bg-gold-500 w-8" : "bg-white/20"
                  }`}
                  onClick={() => setCurrentTestimonial(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location & Info */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/[0.02] border-white/10 rounded-none p-8">
                <div className="flex items-start gap-4 mb-6">
                  <MapPin className="h-6 w-6 text-gold-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Location</h3>
                    <p className="text-white/50">
                      19 Grand Avenue<br />
                      Oakland, CA 94612
                    </p>
                  </div>
                </div>
                <div className="aspect-video bg-white/5 border border-white/10">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977456894867!2d-122.27085!3d37.80483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ4JzE3LjQiTiAxMjLCsDE2JzE1LjEiVw!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/[0.02] border-white/10 rounded-none p-8 h-full">
                <div className="flex items-start gap-4 mb-8">
                  <Clock className="h-6 w-6 text-gold-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Hours</h3>
                    <p className="text-white/50">
                      Friday: 9PM - 2AM<br />
                      Saturday: 10PM - 3AM
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/50">
                    <Users className="h-5 w-5 text-gold-500" />
                    21+ with valid ID
                  </div>
                  <div className="flex items-center gap-3 text-white/50">
                    <Wine className="h-5 w-5 text-gold-500" />
                    Dress code: Upscale casual
                  </div>
                </div>

                <Button asChild className="w-full mt-8 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-none">
                  <Link href="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-gradient-to-b from-black to-gold-900/10 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Join the List</h2>
            <p className="text-white/50 mb-8">Get exclusive access to events and VIP offers.</p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-14 px-6 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold-500"
              />
              <Button type="submit" className="h-14 px-8 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-none">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-serif font-bold text-white mb-8">
              Your Table
              <span className="block text-gold-500">Awaits</span>
            </h2>
            <p className="text-white/50 text-xl mb-12 max-w-lg mx-auto">
              Book now and experience Oakland&apos;s finest nightlife destination.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gold-500 hover:bg-gold-600 text-black font-black px-16 py-8 text-xl rounded-none"
            >
              <Link href="/reservations">
                RESERVE NOW
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
