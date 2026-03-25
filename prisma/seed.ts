import { PrismaClient, Role, TableShape, MenuType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@zanzioakland.com" },
    update: {},
    create: {
      email: "admin@zanzioakland.com",
      name: "Admin",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log("Created admin user:", admin.email);

  // Create sections matching Zanzi floor plan
  const jungleSection = await prisma.section.upsert({
    where: { name: "Jungle" },
    update: {},
    create: {
      name: "Jungle",
      description: "Premium VIP area with lush greenery backdrop",
      color: "#22c55e", // Green
      order: 1,
    },
  });

  const royalSection = await prisma.section.upsert({
    where: { name: "Royal" },
    update: {},
    create: {
      name: "Royal",
      description: "Exclusive Royal VIP booths with intimate seating",
      color: "#dc2626", // Red
      order: 2,
    },
  });

  const balconySection = await prisma.section.upsert({
    where: { name: "Balcony" },
    update: {},
    create: {
      name: "Balcony",
      description: "Elevated VIP balcony with stunning views of the dance floor",
      color: "#d4af37", // Gold
      order: 3,
    },
  });

  const coveSection = await prisma.section.upsert({
    where: { name: "Cove" },
    update: {},
    create: {
      name: "Cove",
      description: "Spacious semi-private alcoves perfect for larger groups",
      color: "#7b2cbf", // Purple
      order: 4,
    },
  });

  const stageSection = await prisma.section.upsert({
    where: { name: "Stage" },
    update: {},
    create: {
      name: "Stage",
      description: "Premium VIP section with direct stage access",
      color: "#f59e0b", // Amber
      order: 5,
    },
  });

  console.log("Created sections");

  // Create Jungle table
  await prisma.table.upsert({
    where: { name_sectionId: { name: "Jungle", sectionId: jungleSection.id } },
    update: {},
    create: {
      name: "Jungle",
      sectionId: jungleSection.id,
      capacity: 10,
      // Suggested min capacity: 8,
      minimumSpend: 1000, // 2 bottles * ~$500
      depositRequired: 300,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 2,
      shape: TableShape.BOOTH,
      position: { x: 300, y: 20, width: 200, height: 100 },
    },
  });

  // Create Royal tables
  await prisma.table.upsert({
    where: { name_sectionId: { name: "Royal 1", sectionId: royalSection.id } },
    update: {},
    create: {
      name: "Royal 1",
      sectionId: royalSection.id,
      capacity: 8,
      // Suggested min capacity: 6,
      minimumSpend: 500,
      depositRequired: 150,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 1,
      shape: TableShape.BOOTH,
      position: { x: 50, y: 150, width: 150, height: 80 },
    },
  });

  await prisma.table.upsert({
    where: { name_sectionId: { name: "Royal 2", sectionId: royalSection.id } },
    update: {},
    create: {
      name: "Royal 2",
      sectionId: royalSection.id,
      capacity: 8,
      // Suggested min capacity: 6,
      minimumSpend: 500,
      depositRequired: 150,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 1,
      shape: TableShape.BOOTH,
      position: { x: 50, y: 250, width: 150, height: 80 },
    },
  });

  // Create Balcony tables
  await prisma.table.upsert({
    where: { name_sectionId: { name: "Mezzanine B", sectionId: balconySection.id } },
    update: {},
    create: {
      name: "Mezzanine B",
      sectionId: balconySection.id,
      capacity: 8,
      // Suggested min capacity: 6,
      minimumSpend: 500,
      depositRequired: 150,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 1,
      shape: TableShape.BOOTH,
      position: { x: 400, y: 200, width: 120, height: 60 },
    },
  });

  await prisma.table.upsert({
    where: { name_sectionId: { name: "Mezzanine A", sectionId: balconySection.id } },
    update: {},
    create: {
      name: "Mezzanine A",
      sectionId: balconySection.id,
      capacity: 8,
      // Suggested min capacity: 6,
      minimumSpend: 500,
      depositRequired: 150,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 1,
      shape: TableShape.BOOTH,
      position: { x: 400, y: 280, width: 120, height: 60 },
    },
  });

  await prisma.table.upsert({
    where: { name_sectionId: { name: "Balcony 1 Suite", sectionId: balconySection.id } },
    update: {},
    create: {
      name: "Balcony 1 Suite",
      sectionId: balconySection.id,
      capacity: 12,
      // Suggested min capacity: 10,
      minimumSpend: 1000,
      depositRequired: 300,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 2,
      shape: TableShape.BOOTH,
      position: { x: 50, y: 400, width: 100, height: 150 },
    },
  });

  await prisma.table.upsert({
    where: { name_sectionId: { name: "Balcony 2", sectionId: balconySection.id } },
    update: {},
    create: {
      name: "Balcony 2",
      sectionId: balconySection.id,
      capacity: 8,
      // Suggested min capacity: 6,
      minimumSpend: 1000,
      depositRequired: 250,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 2,
      shape: TableShape.BOOTH,
      position: { x: 280, y: 450, width: 140, height: 70 },
    },
  });

  await prisma.table.upsert({
    where: { name_sectionId: { name: "Balcony 3", sectionId: balconySection.id } },
    update: {},
    create: {
      name: "Balcony 3",
      sectionId: balconySection.id,
      capacity: 6,
      // Suggested min capacity: 5,
      minimumSpend: 500,
      depositRequired: 150,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 1,
      shape: TableShape.BOOTH,
      position: { x: 480, y: 450, width: 120, height: 70 },
    },
  });

  // Create VIP tables (formerly Cove A, Cove B)
  await prisma.table.upsert({
    where: { name_sectionId: { name: "VIP 2", sectionId: coveSection.id } },
    update: {},
    create: {
      name: "VIP 2",
      sectionId: coveSection.id,
      capacity: 10,
      // Suggested min capacity: 8,
      minimumSpend: 1000,
      depositRequired: 300,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 2,
      shape: TableShape.BOOTH,
      position: { x: 300, y: 560, width: 100, height: 80 },
    },
  });

  await prisma.table.upsert({
    where: { name_sectionId: { name: "VIP 3", sectionId: coveSection.id } },
    update: {},
    create: {
      name: "VIP 3",
      sectionId: coveSection.id,
      capacity: 10,
      // Suggested min capacity: 8,
      minimumSpend: 1000,
      depositRequired: 300,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 2,
      shape: TableShape.BOOTH,
      position: { x: 420, y: 560, width: 100, height: 80 },
    },
  });

  // Create VIP 1 table (formerly The Stage)
  await prisma.table.upsert({
    where: { name_sectionId: { name: "VIP 1", sectionId: stageSection.id } },
    update: {},
    create: {
      name: "VIP 1",
      sectionId: stageSection.id,
      capacity: 12,
      // Suggested min capacity: 10,
      minimumSpend: 1000,
      depositRequired: 300,
      requiresBottle: false, // Bottle minimums are guidelines, not requirements
      // Suggested min bottles: 2,
      shape: TableShape.BOOTH,
      position: { x: 50, y: 600, width: 150, height: 120 },
    },
  });

  console.log("Created tables matching Zanzi floor plan");

  // Create bottle categories
  const champagne = await prisma.bottleCategory.upsert({
    where: { name: "Champagne" },
    update: {},
    create: { name: "Champagne", order: 1 },
  });

  const vodka = await prisma.bottleCategory.upsert({
    where: { name: "Vodka" },
    update: {},
    create: { name: "Vodka", order: 2 },
  });

  const whiskey = await prisma.bottleCategory.upsert({
    where: { name: "Whiskey" },
    update: {},
    create: { name: "Whiskey", order: 3 },
  });

  const tequila = await prisma.bottleCategory.upsert({
    where: { name: "Tequila" },
    update: {},
    create: { name: "Tequila", order: 4 },
  });

  const cognac = await prisma.bottleCategory.upsert({
    where: { name: "Cognac" },
    update: {},
    create: { name: "Cognac", order: 5 },
  });

  console.log("Created bottle categories");

  // Create bottles
  const bottles = [
    { name: "Dom Pérignon", categoryId: champagne.id, price: 600, size: "750ml", isFeatured: true },
    { name: "Moët & Chandon", categoryId: champagne.id, price: 350, size: "750ml" },
    { name: "Veuve Clicquot", categoryId: champagne.id, price: 375, size: "750ml" },
    { name: "Ace of Spades", categoryId: champagne.id, price: 800, size: "750ml", isFeatured: true },
    { name: "Grey Goose", categoryId: vodka.id, price: 400, size: "1L" },
    { name: "Belvedere", categoryId: vodka.id, price: 425, size: "1L" },
    { name: "Ciroc", categoryId: vodka.id, price: 400, size: "1L" },
    { name: "Hennessy VS", categoryId: cognac.id, price: 450, size: "750ml" },
    { name: "Hennessy VSOP", categoryId: cognac.id, price: 550, size: "750ml" },
    { name: "Rémy Martin XO", categoryId: cognac.id, price: 750, size: "750ml", isFeatured: true },
    { name: "Johnnie Walker Blue", categoryId: whiskey.id, price: 700, size: "750ml", isFeatured: true },
    { name: "Johnnie Walker Black", categoryId: whiskey.id, price: 350, size: "750ml" },
    { name: "Don Julio 1942", categoryId: tequila.id, price: 550, size: "750ml", isFeatured: true },
    { name: "Patrón Silver", categoryId: tequila.id, price: 400, size: "1L" },
    { name: "Casamigos Reposado", categoryId: tequila.id, price: 425, size: "750ml" },
  ];

  for (const bottle of bottles) {
    await prisma.bottle.create({
      data: {
        name: bottle.name,
        categoryId: bottle.categoryId,
        price: bottle.price,
        size: bottle.size,
        isFeatured: bottle.isFeatured || false,
        description: `Premium ${bottle.name}`,
      },
    });
  }

  console.log("Created bottles");

  // Create menu categories
  const appetizers = await prisma.menuCategory.upsert({
    where: { name: "Appetizers" },
    update: {},
    create: { name: "Appetizers", type: MenuType.FOOD, order: 1 },
  });

  const cocktails = await prisma.menuCategory.upsert({
    where: { name: "Signature Cocktails" },
    update: {},
    create: { name: "Signature Cocktails", type: MenuType.DRINK, order: 2 },
  });

  // Create menu items
  const menuItems = [
    { name: "Wings Platter", description: "Crispy wings with house sauce", price: 18, categoryId: appetizers.id },
    { name: "Slider Trio", description: "Three premium beef sliders", price: 22, categoryId: appetizers.id },
    { name: "Loaded Nachos", description: "Tortilla chips with all the fixings", price: 16, categoryId: appetizers.id },
    { name: "Zanzi Sunset", description: "Vodka, passion fruit, lime, prosecco", price: 18, categoryId: cocktails.id, isPopular: true },
    { name: "Oakland Nights", description: "Bourbon, honey, lemon, bitters", price: 16, categoryId: cocktails.id },
    { name: "Purple Haze", description: "Gin, lavender, elderflower, tonic", price: 17, categoryId: cocktails.id, isPopular: true },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }

  console.log("Created menu items");

  // Create sample events
  const today = new Date();
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));

  const nextSaturday = new Date(nextFriday);
  nextSaturday.setDate(nextFriday.getDate() + 1);

  await prisma.event.create({
    data: {
      title: "Friday Night Live",
      slug: "friday-night-live",
      description: "Join us for the hottest Friday night party in Oakland! Featuring DJ sets from top local talent, premium bottle service, and an unmatched atmosphere.",
      shortDesc: "The hottest Friday night party in Oakland",
      date: new Date(nextFriday.setHours(21, 0, 0, 0)),
      endDate: new Date(nextFriday.setHours(26, 0, 0, 0)), // 2 AM next day
      doors: "9:00 PM",
      isTicketed: false,
      isFeatured: true,
      isPublished: true,
      dressCode: "Upscale Casual",
      ageLimit: 21,
      artists: ["DJ Shadow", "MC Thunder"],
      genre: "Hip-Hop / R&B",
    },
  });

  await prisma.event.create({
    data: {
      title: "International Saturdays",
      slug: "international-saturdays",
      description: "Experience music from around the world at our signature Saturday night event. From Afrobeats to Latin rhythms, this is Oakland's most diverse dance party.",
      shortDesc: "Oakland's most diverse dance party",
      date: new Date(nextSaturday.setHours(22, 0, 0, 0)),
      endDate: new Date(nextSaturday.setHours(27, 0, 0, 0)), // 3 AM next day
      doors: "10:00 PM",
      isTicketed: true,
      ticketPrice: 25,
      ticketLimit: 300,
      isFeatured: true,
      isPublished: true,
      dressCode: "Dress to Impress",
      ageLimit: 21,
      artists: ["DJ Global", "Afrobeat Collective"],
      genre: "World / Afrobeats / Latin",
    },
  });

  console.log("Created sample events");

  // Create default settings
  const defaultSettings = [
    { key: "business_name", value: { name: "Zanzi Oakland" } },
    { key: "business_hours", value: {
      friday: "9:00 PM - 2:00 AM",
      saturday: "10:00 PM - 3:00 AM",
      sunday: "Closed",
      monday: "Closed",
      tuesday: "Closed",
      wednesday: "Closed",
      thursday: "Closed"
    }},
    { key: "contact", value: {
      email: "info@zanzioakland.com",
      phone: "(510) 555-0123",
      address: "123 Broadway, Oakland, CA 94607"
    }},
    { key: "social", value: {
      instagram: "https://instagram.com/zanzioakland",
      facebook: "https://facebook.com/zanzioakland",
      twitter: "https://twitter.com/zanzioakland"
    }},
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("Created default settings");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
