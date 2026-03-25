import Link from "next/link";
import Image from "next/image";
import { Wine, Star, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Bottle Service",
  description: "Premium bottle service at Zanzi Oakland. Browse our selection of champagne, vodka, whiskey, tequila, and more.",
};

async function getBottleCategories() {
  return db.bottleCategory.findMany({
    include: {
      bottles: {
        where: { isAvailable: true },
        orderBy: [{ isFeatured: "desc" }, { price: "asc" }],
      },
    },
    orderBy: { order: "asc" },
  });
}

async function getBottlePackages() {
  return db.bottlePackage.findMany({
    where: { isAvailable: true },
    orderBy: { isFeatured: "desc" },
  });
}

export default async function BottleServicePage() {
  const [categories, packages] = await Promise.all([
    getBottleCategories(),
    getBottlePackages(),
  ]);

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <Badge variant="outline" className="mb-4">
            <Wine className="h-3 w-3 mr-1" />
            VIP Experience
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
            Bottle Service
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            Elevate your night with premium spirits, dedicated service, and the best tables in the house.
          </p>
          <Button asChild size="lg">
            <Link href="/reservations">
              Reserve a Table
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* VIP Benefits */}
      <section className="py-16 bg-navy-800/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: "Skip the line", text: "Priority Entry" },
              { icon: "Personal host", text: "Dedicated Service" },
              { icon: "Best seats", text: "Premium Seating" },
              { icon: "Full service", text: "Bottle Service" },
            ].map((benefit, i) => (
              <Card key={i} glass className="text-center p-6">
                <CardContent className="pt-4">
                  <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-gold-500" />
                  </div>
                  <p className="text-white font-medium">{benefit.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottle Menu */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Our Selection
          </h2>

          <Tabs defaultValue={categories[0]?.name} className="w-full">
            <TabsList className="flex flex-wrap justify-center mb-8 gap-2">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.name}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.name}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.bottles.map((bottle) => (
                    <Card key={bottle.id} glass className="overflow-hidden card-hover">
                      <div className="aspect-square relative bg-gradient-to-br from-white/5 to-white/0 p-8">
                        {bottle.image ? (
                          <Image
                            src={bottle.image}
                            alt={bottle.name}
                            fill
                            className="object-contain p-4"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Wine className="h-20 w-20 text-gold-500/30" />
                          </div>
                        )}
                        {bottle.isFeatured && (
                          <Badge className="absolute top-4 left-4">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-white mb-1">
                          {bottle.name}
                        </h3>
                        {bottle.size && (
                          <p className="text-sm text-white/50 mb-2">{bottle.size}</p>
                        )}
                        {bottle.description && (
                          <p className="text-sm text-white/60 mb-4 line-clamp-2">
                            {bottle.description}
                          </p>
                        )}
                        <p className="text-xl font-bold text-gold-500">
                          {formatCurrency(Number(bottle.price))}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {category.bottles.length === 0 && (
                  <Card glass className="p-12 text-center">
                    <Wine className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">No bottles available in this category.</p>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Packages */}
      {packages.length > 0 && (
        <section className="py-16 bg-navy-800/50">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white text-center mb-4">
              VIP Packages
            </h2>
            <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
              Save with our curated bottle packages. Perfect for celebrations and groups.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  glass
                  className={`overflow-hidden ${pkg.isFeatured ? "ring-2 ring-gold-500" : ""}`}
                >
                  {pkg.image && (
                    <div className="aspect-video relative">
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    {pkg.isFeatured && (
                      <Badge className="mb-4">Most Popular</Badge>
                    )}
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="text-white/60 mb-4">{pkg.description}</p>
                    )}
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-3xl font-bold text-gold-500">
                        {formatCurrency(Number(pkg.price))}
                      </span>
                      {pkg.savings && (
                        <Badge variant="success">
                          Save {formatCurrency(Number(pkg.savings))}
                        </Badge>
                      )}
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/reservations">Book This Package</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for VIP Treatment?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Contact us for custom packages, large groups, or special requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/reservations">Reserve Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
