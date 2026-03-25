"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  Instagram,
  Facebook,
  Twitter,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { contactSchema, type ContactFormData } from "@/lib/validations";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll get back to you soon!",
        variant: "success",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <Badge variant="outline" className="mb-4">
            <MessageSquare className="h-3 w-3 mr-1" />
            Get in Touch
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Have questions about reservations, events, or VIP services? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <Card glass className="p-6">
                <CardContent className="space-y-6 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-gold-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Address</h3>
                      <p className="text-white/60">
                        123 Broadway<br />
                        Oakland, CA 94607
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0">
                      <Phone className="h-6 w-6 text-gold-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Phone</h3>
                      <a
                        href="tel:+15105550123"
                        className="text-white/60 hover:text-gold-500 transition-colors"
                      >
                        (510) 555-0123
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-gold-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <a
                        href="mailto:info@zanzioakland.com"
                        className="text-white/60 hover:text-gold-500 transition-colors"
                      >
                        info@zanzioakland.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-gold-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Hours</h3>
                      <p className="text-white/60">
                        Friday: 9:00 PM - 2:00 AM<br />
                        Saturday: 10:00 PM - 3:00 AM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card glass className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg">Follow Us</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex gap-4">
                  {[
                    { icon: Instagram, href: "https://instagram.com/zanzioakland", label: "Instagram" },
                    { icon: Facebook, href: "https://facebook.com/zanzioakland", label: "Facebook" },
                    { icon: Twitter, href: "https://twitter.com/zanzioakland", label: "Twitter" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-white/5 hover:bg-gold-500/20 flex items-center justify-center transition-colors text-white/60 hover:text-gold-500"
                    >
                      <social.icon className="h-5 w-5" />
                      <span className="sr-only">{social.label}</span>
                    </a>
                  ))}
                </CardContent>
              </Card>

              {/* FAQ Preview */}
              <Card glass className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg">Frequently Asked</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-1">What&apos;s the dress code?</h4>
                    <p className="text-sm text-white/60">
                      Upscale casual. No athletic wear, excessive jewelry, or baggy clothing.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Do I need a reservation?</h4>
                    <p className="text-sm text-white/60">
                      Reservations are recommended for VIP tables but not required for general admission.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">What&apos;s the age requirement?</h4>
                    <p className="text-sm text-white/60">
                      All guests must be 21+ with valid government-issued ID.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card glass className="p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle>Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(510) 555-0123"
                      {...register("phone")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select onValueChange={(value) => setValue("subject", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reservation Inquiry">Reservation Inquiry</SelectItem>
                        <SelectItem value="VIP/Bottle Service">VIP/Bottle Service</SelectItem>
                        <SelectItem value="Event Booking">Event Booking</SelectItem>
                        <SelectItem value="Private Events">Private Events</SelectItem>
                        <SelectItem value="Careers">Careers</SelectItem>
                        <SelectItem value="General Question">General Question</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p className="text-sm text-red-500">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      rows={5}
                      {...register("message")}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card glass className="overflow-hidden">
            <div className="aspect-[2/1] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977456894867!2d-122.27085!3d37.80483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ4JzE3LjQiTiAxMjLCsDE2JzE1LjEiVw!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
