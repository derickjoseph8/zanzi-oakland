import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // In production, you would send an email here
    // For now, we'll just log the contact form submission
    console.log("Contact form submission:", validatedData);

    // TODO: Implement email sending
    // await sendEmail({
    //   to: process.env.CONTACT_EMAIL,
    //   subject: `Contact Form: ${validatedData.subject}`,
    //   body: `
    //     Name: ${validatedData.name}
    //     Email: ${validatedData.email}
    //     Phone: ${validatedData.phone || 'Not provided'}
    //     Subject: ${validatedData.subject}
    //     Message: ${validatedData.message}
    //   `,
    // });

    return NextResponse.json(
      { message: "Message received. We'll get back to you soon!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Contact form error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
