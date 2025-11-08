import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, useCase, message } = body

    // Validate required fields
    if (!name || !email || !useCase) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const useCaseLabels: Record<string, { title: string; subtitle: string }> = {
      'investment-consulting': {
        title: 'Investment/Consulting',
        subtitle: 'Due diligence',
      },
      'info-platforms': {
        title: 'Info platforms (news, socmed)',
        subtitle: 'Source tracing & political bias',
      },
      'data-compliance': {
        title: 'Data compliance (enterprise data preprocessing)',
        subtitle: 'Data Compliance',
      },
    }

    const useCaseInfo = useCaseLabels[useCase] || {
      title: useCase,
      subtitle: '',
    }
    
    // Verified sender email (must be verified in Resend)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@example.com'
    // Where to send business notifications
    const businessEmail = process.env.RESEND_TO_EMAIL || 'sales@example.com'
    // User's email from form input
    const userEmail = email

    // Send email to business
    await resend.emails.send({
      from: fromEmail,
      to: businessEmail,
      replyTo: userEmail,
      subject: `New Contact Form Submission: ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name/Company:</strong> ${name}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Use Case:</strong> ${useCaseInfo.title} - ${useCaseInfo.subtitle}</p>
        ${message ? `<p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
        <hr>
        <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
      `,
      text: `
New Contact Form Submission

Name/Company: ${name}
Email: ${userEmail}
Use Case: ${useCaseInfo.title} - ${useCaseInfo.subtitle}
${message ? `Message:\n${message}` : ''}

Submitted at: ${new Date().toLocaleString()}
      `,
    })

    // Send confirmation email to user
    await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: 'Thank you for contacting us!',
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Hi ${name},</p>
        <p>We've received your contact form submission and our team will get back to you soon.</p>
        <p><strong>Your inquiry:</strong> ${useCaseInfo.title} - ${useCaseInfo.subtitle}</p>
        ${message ? `<p><strong>Your message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
        <p>Best regards,<br>The Team</p>
      `,
      text: `
Thank you for reaching out!

Hi ${name},

We've received your contact form submission and our team will get back to you soon.

Your inquiry: ${useCaseInfo.title} - ${useCaseInfo.subtitle}
${message ? `Your message:\n${message}` : ''}

Best regards,
The Team
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    )
  }
}

