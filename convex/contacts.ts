import { mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "@convex-dev/resend";
import { components, internal } from "./_generated/api";

const resend = new Resend((components as any).resend, {
  testMode: process.env.NODE_ENV === "development",
});

export const submitContactForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    useCase: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Save to database
    const contactId = await ctx.db.insert("contacts", {
      name: args.name,
      email: args.email,
      useCase: args.useCase,
      message: args.message || "",
      submittedAt: Date.now(),
    });

    // Trigger email sending action
    await ctx.scheduler.runAfter(0, internal.contacts.sendContactEmail, {
      contactId,
      name: args.name,
      email: args.email,
      useCase: args.useCase,
      message: args.message || "",
    });

    return { success: true, id: contactId };
  },
});

export const sendContactEmail = internalAction({
  args: {
    contactId: v.id("contacts"),
    name: v.string(),
    email: v.string(),
    useCase: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const useCaseLabels: Record<string, { title: string; subtitle: string }> = {
      "investment-consulting": {
        title: "Investment/Consulting",
        subtitle: "Due diligence",
      },
      "info-platforms": {
        title: "Info platforms (news, socmed)",
        subtitle: "Source tracing & political bias",
      },
      "data-compliance": {
        title: "Data compliance (enterprise data preprocessing)",
        subtitle: "Data Compliance",
      },
    };

    const useCase = useCaseLabels[args.useCase] || {
      title: args.useCase,
      subtitle: "",
    };

    // Email to the business
    const businessEmail = process.env.RESEND_TO_EMAIL || "sales@example.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

    try {
      await resend.sendEmail(ctx, {
        from: fromEmail,
        to: businessEmail,
        replyTo: [args.email],
        subject: `New Contact Form Submission: ${args.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name/Company:</strong> ${args.name}</p>
          <p><strong>Email:</strong> ${args.email}</p>
          <p><strong>Use Case:</strong> ${useCase.title} - ${useCase.subtitle}</p>
          ${args.message ? `<p><strong>Message:</strong><br>${args.message.replace(/\n/g, "<br>")}</p>` : ""}
          <hr>
          <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
        `,
        text: `
New Contact Form Submission

Name/Company: ${args.name}
Email: ${args.email}
Use Case: ${useCase.title} - ${useCase.subtitle}
${args.message ? `Message:\n${args.message}` : ""}

Submitted at: ${new Date().toLocaleString()}
        `,
      });

      // Confirmation email to the user
      await resend.sendEmail(ctx, {
        from: fromEmail,
        to: args.email,
        subject: "Thank you for contacting us!",
        html: `
          <h2>Thank you for reaching out!</h2>
          <p>Hi ${args.name},</p>
          <p>We've received your contact form submission and our team will get back to you soon.</p>
          <p><strong>Your inquiry:</strong> ${useCase.title} - ${useCase.subtitle}</p>
          ${args.message ? `<p><strong>Your message:</strong><br>${args.message.replace(/\n/g, "<br>")}</p>` : ""}
          <p>Best regards,<br>The Team</p>
        `,
        text: `
Thank you for reaching out!

Hi ${args.name},

We've received your contact form submission and our team will get back to you soon.

Your inquiry: ${useCase.title} - ${useCase.subtitle}
${args.message ? `Your message:\n${args.message}` : ""}

Best regards,
The Team
        `,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  },
});

