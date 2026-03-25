"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
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
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Cursor trail effect
function CursorGlow() {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-50 hidden md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <div className="w-96 h-96 rounded-full bg-gradient-radial from-gold-500/10 via-gold-500/5 to-transparent blur-3xl" />
    </motion.div>
  );
}

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
function ParticlesBackground({ density = 30 }: { density?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(density)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            background: `rgba(212, 175, 55, ${Math.random() * 0.5 + 0.1})`,
          }}
          initial={{
            x: `${Math.random() * 100}%`,
            y: "110%",
            opacity: 0,
          }}
          animate={{
            y: "-10%",
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Text reveal animation
function TextReveal({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <span className="overflow-hidden inline-block">
      <motion.span
        className="inline-block"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.33, 1, 0.68, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Glowing orb decoration
function GlowingOrb({ className, color = "gold" }: { className: string; color?: "gold" | "white" }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <motion.div
        className={`w-64 h-64 rounded-full blur-3xl ${
          color === "gold" ? "bg-gold-500/20" : "bg-white/10"
        }`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Animated line
function AnimatedLine({ direction = "horizontal" }: { direction?: "horizontal" | "vertical" }) {
  return (
    <motion.div
      className={`absolute ${
        direction === "horizontal" ? "h-px left-0 right-0" : "w-px top-0 bottom-0"
      }`}
      style={{
        background: direction === "horizontal"
          ? "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)"
          : "linear-gradient(180deg, transparent, rgba(212,175,55,0.3), transparent)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    />
  );
}

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.15]);
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    // Auto-rotate testimonials
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
      <CursorGlow />

      {/* Loading Screen */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image src="/logo.png" unoptimized alt="Zanzi" width={120} height={120} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Video/Animation */}
      <motion.section
        style={{ opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background Layers */}
        <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-black" />

          {/* Animated gradient orbs */}
          <GlowingOrb className="-top-32 -left-32" />
          <GlowingOrb className="-bottom-32 -right-32" />
          <GlowingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color="white" />

          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
        </motion.div>

        <ParticlesBackground density={40} />

        {/* Animated Lines */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-[20%] w-px h-full"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.15), transparent)",
            }}
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
          <motion.div
            className="absolute top-0 right-[20%] w-px h-full"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.15), transparent)",
            }}
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 2, delay: 0.7 }}
          />
          <motion.div
            className="absolute top-1/3 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.1), transparent)",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            {/* Logo with glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
              className="relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-8"
            >
              <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-3xl animate-pulse" />
              <Image
                src="/logo.png"
                unoptimized
                alt="Zanzi Oakland"
                fill
                className="object-contain relative z-10"
                priority
              />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Badge variant="outline" className="mb-8 border-gold-500/50 text-gold-400 px-6 py-2 text-sm backdrop-blur-sm">
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="inline-block mr-2"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.span>
                Oakland&apos;s Premier International Nightclub
              </Badge>
            </motion.div>

            {/* Main heading with stagger animation */}
            <div className="overflow-hidden mb-8">
              <motion.h1
                className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <motion.span
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 bg-[length:200%_auto]"
                  animate={{ backgroundPosition: ["0%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  initial={{ y: 100, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                >
                  Experience
                </motion.span>
                <br />
                <motion.span
                  className="inline-block text-white"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  The Night
                </motion.span>
              </motion.h1>
            </div>

            {/* Tagline with typing effect */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="text-lg md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Where diverse cultures unite under one roof. World-class DJs, premium bottle service,
              and an atmosphere unlike any other.
            </motion.p>

            {/* CTA Buttons with hover effects */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="xl"
                  className="relative overflow-hidden bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 bg-[length:200%_auto] hover:bg-right text-black font-bold px-10 py-7 text-lg rounded-full shadow-lg shadow-gold-500/30 transition-all duration-500 group"
                >
                  <Link href="/reservations">
                    <span className="relative z-10 flex items-center">
                      Reserve a Table
                      <motion.span
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="border-2 border-white/30 hover:border-gold-500/50 hover:bg-gold-500/10 px-10 py-7 text-lg rounded-full backdrop-blur-sm transition-all duration-300"
                >
                  <Link href="/events">
                    <Calendar className="mr-2 h-5 w-5" />
                    View Events
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + i * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gold-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-center p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-400 to-gold-600 mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/40 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-white/30 uppercase tracking-[0.3em]">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-gold-500/30 flex items-start justify-center pt-2">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-3 bg-gold-500/60 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-6 border-gold-500/30 px-4 py-1.5">
              <Star className="h-3 w-3 mr-2 text-gold-500" />
              Why Choose Us
            </Badge>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">Zanzi</span> Difference
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-xl">
              More than a nightclub. An experience that celebrates music, culture, and community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/10 backdrop-blur-xl hover:border-gold-500/30 transition-all duration-500 group h-full overflow-hidden">
                    <CardContent className="p-10 text-center relative">
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-b from-gold-500/0 to-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <motion.div
                        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center mx-auto mb-8 relative"
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="absolute inset-0 rounded-3xl bg-gold-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <feature.icon className="h-12 w-12 text-gold-500 relative z-10" />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gold-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-white/50 leading-relaxed text-lg">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Section with Parallax */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-black" />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 border border-gold-500/20 rounded-full"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 border border-gold-500/10"
          animate={{ y: [0, 20, 0], rotate: [0, -90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring" }}
            >
              <Badge className="mb-8 bg-gold-500/10 text-gold-400 border-gold-500/30 px-4 py-1.5">
                <Wine className="h-3 w-3 mr-2" />
                VIP Experience
              </Badge>
              <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1]">
                Elevate Your Night with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400">
                  Bottle Service
                </span>
              </h2>
              <p className="text-white/60 text-xl mb-10 leading-relaxed">
                Reserve a private table, enjoy premium spirits, and receive VIP treatment all night long.
                Our dedicated hosts ensure your experience is nothing short of exceptional.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-12">
                {[
                  { text: "Priority entry" },
                  { text: "Dedicated VIP host" },
                  { text: "Premium spirits" },
                  { text: "Best seating" },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 text-white/80"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/20 flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-gold-500" />
                    </div>
                    <span className="text-lg">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold px-8 rounded-full"
                  >
                    <Link href="/bottle-service">View Packages</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-gold-500/30 hover:bg-gold-500/10 px-8 rounded-full"
                  >
                    <Link href="/reservations">Reserve Now</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring" }}
              className="relative"
            >
              <div className="relative aspect-square">
                {/* Decorative frame */}
                <div className="absolute inset-8 border-2 border-gold-500/20 rounded-3xl" />
                <div className="absolute inset-4 border border-gold-500/10 rounded-3xl" />

                {/* Main content area */}
                <div className="absolute inset-12 rounded-2xl overflow-hidden bg-gradient-to-br from-gold-900/40 to-black">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="text-center"
                    >
                      <Image
                        src="/logo.png"
                        unoptimized
                        alt="Zanzi VIP"
                        width={180}
                        height={180}
                        className="mx-auto mb-6"
                      />
                      <p className="text-white/50 text-xl tracking-wider">Experience Excellence</p>
                    </motion.div>
                  </div>
                </div>

                {/* Animated corner accents */}
                <motion.div
                  className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-gold-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-gold-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-gold-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-gold-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-6 border-gold-500/30">
              <Star className="h-3 w-3 mr-2 text-gold-500" />
              Testimonials
            </Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
              What Our Guests Say
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Card className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/10 backdrop-blur-xl p-12 md:p-16">
                  <div className="flex justify-center mb-8">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="h-7 w-7 text-gold-500 fill-gold-500 mx-1" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-2xl md:text-3xl text-white/90 mb-10 italic leading-relaxed font-light">
                    &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                  </p>
                  <div>
                    <p className="text-white font-semibold text-xl">{testimonials[currentTestimonial].name}</p>
                    <p className="text-white/40">{testimonials[currentTestimonial].location}</p>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-6 mt-10">
              <Button
                variant="outline"
                size="icon"
                className="border-gold-500/30 hover:bg-gold-500/10 w-12 h-12 rounded-full"
                onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentTestimonial ? "bg-gold-500 w-8" : "bg-white/20 w-2 hover:bg-white/40"
                    }`}
                    onClick={() => setCurrentTestimonial(i)}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-gold-500/30 hover:bg-gold-500/10 w-12 h-12 rounded-full"
                onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-32 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/10 backdrop-blur-xl p-8 h-full hover:border-gold-500/30 transition-colors">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/30 to-gold-600/20 flex items-center justify-center">
                    <MapPin className="h-7 w-7 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Location</h3>
                    <p className="text-white/50 text-lg">
                      19 Grand Avenue<br />
                      Oakland, CA 94612
                    </p>
                  </div>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977456894867!2d-122.27085!3d37.80483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ4JzE3LjQiTiAxMjLCsDE2JzE1LjEiVw!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
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
              <Card className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/10 backdrop-blur-xl p-8 h-full hover:border-gold-500/30 transition-colors">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/30 to-gold-600/20 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Hours</h3>
                    <p className="text-white/50 text-lg">
                      Friday: 9:00 PM - 2:00 AM<br />
                      Saturday: 10:00 PM - 3:00 AM
                    </p>
                  </div>
                </div>
                <div className="space-y-6 mt-6">
                  <div className="flex items-center gap-4 text-white/60 text-lg">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gold-500" />
                    </div>
                    <span>21+ with valid ID</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/60 text-lg">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                      <Wine className="h-5 w-5 text-gold-500" />
                    </div>
                    <span>Dress code: Upscale casual</span>
                  </div>
                </div>
                <div className="mt-10">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold py-6 text-lg rounded-xl"
                  >
                    <Link href="/contact">
                      Contact Us
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gold-900/10 to-black" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

        <ParticlesBackground density={20} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-8 border-gold-500/30 px-4 py-1.5">
              <Sparkles className="h-3 w-3 mr-2 text-gold-500" />
              Stay Connected
            </Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">
              Join the VIP List
            </h2>
            <p className="text-white/50 text-xl mb-10">
              Get exclusive access to event announcements, VIP offers, and special promotions.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-16 px-8 rounded-full border-2 border-gold-500/30 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent backdrop-blur-xl text-lg"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  size="lg"
                  className="h-16 px-10 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold rounded-full text-lg"
                >
                  Subscribe
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <ParticlesBackground density={50} />

        {/* Large glowing orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[150px]" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-[0.9]">
              Ready to Experience
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300">
                Zanzi?
              </span>
            </h2>
            <p className="text-white/50 text-2xl mb-14 max-w-2xl mx-auto">
              Book your table now and secure your spot for an unforgettable night.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                size="xl"
                className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 bg-[length:200%_auto] hover:bg-right text-black font-black px-16 py-8 text-xl rounded-full shadow-2xl shadow-gold-500/30 transition-all duration-500"
              >
                <Link href="/reservations">
                  Reserve Your Table
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
