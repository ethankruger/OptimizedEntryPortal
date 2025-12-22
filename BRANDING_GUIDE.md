# Invoice Branding Guide

## Important: Invoices Come From YOUR Business

When your customers receive invoices through this system, **they will only see YOUR business information**, not "Optimized Entry Portal". The portal is just your internal tool - it's completely invisible to customers.

## What Your Customers See

### Email Invoice Notification
```
From: Stripe <receipts@stripe.com>
On behalf of: [YOUR BUSINESS NAME]

Subject: Invoice from [YOUR BUSINESS NAME]

---
[YOUR LOGO]

You have a new invoice from [YOUR BUSINESS NAME]

Invoice #INV-001
Amount due: $500.00
Due date: January 30, 2025

[View and Pay Invoice] <- Hosted by Stripe

Questions? Reply to: yourbusiness@example.com
```

### Hosted Invoice Page (Stripe-hosted)
When customers click the link, they see:
```
┌─────────────────────────────────────┐
│  [YOUR BUSINESS LOGO]               │
│                                     │
│  Invoice #INV-001                   │
│  [YOUR BUSINESS NAME]               │
│  [Your Business Address]            │
│  [Your City, State ZIP]             │
│                                     │
│  Bill To:                           │
│  John Doe                           │
│  john@example.com                   │
│                                     │
│  ─────────────────────────────────  │
│  Description          Qty    Amount │
│  ─────────────────────────────────  │
│  Service Name          1    $500.00 │
│                                     │
│  ─────────────────────────────────  │
│  Subtotal:                  $500.00 │
│  Total:                     $500.00 │
│                                     │
│  [Pay $500.00]  <- Stripe checkout  │
│                                     │
│  Questions? Contact:                │
│  support@yourbusiness.com           │
│  (555) 123-4567                     │
└─────────────────────────────────────┘
```

## Setting Up Your Business Branding in Stripe

### Step 1: Business Information
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Settings** (gear icon)
3. Click **Account details** or **Public details**
4. Fill in:
   - **Business name** (e.g., "Smith Plumbing Services")
   - **Support email** (e.g., "support@smithplumbing.com")
   - **Support phone** (e.g., "+1 555-123-4567")

### Step 2: Business Address
1. Still in Settings > Account details
2. Add your business address:
   - Street address
   - City, State, ZIP
   - Country

This appears at the bottom of invoices.

### Step 3: Branding (Optional but Recommended)
1. Go to Settings > **Branding**
2. Upload your logo:
   - **Recommended size**: 512x512 pixels (square) or 1280x640 (rectangular)
   - **Format**: PNG with transparent background works best
   - **File size**: Under 500KB
3. Set brand colors:
   - **Primary color**: Your brand's main color (e.g., blue for plumbing)
   - **Icon**: Upload a favicon

### Step 4: Invoice Settings
1. Go to Settings > **Invoices**
2. Configure:
   - **Default memo**: Appears on all invoices (e.g., "Thank you for your business!")
   - **Footer**: Additional text at bottom of invoices
   - **Custom fields**: Add fields like "Tax ID" or "License Number"

### Step 5: Email Customization (Optional)
1. Go to Settings > **Emails**
2. Customize invoice email template:
   - Email subject line
   - Custom message
   - Reply-to email address

## Testing Your Branding

Before going live:

1. Create a test invoice in your portal
2. Use your own email address as the customer
3. Send the invoice
4. Check what the email looks like
5. Click the link and review the hosted invoice page
6. Make sure all your branding appears correctly

**Test Mode vs Live Mode:**
- Test mode: Use test card `4242 4242 4242 4242` to test payments
- Live mode: Real cards, real money to your account

## Common Questions

### Q: Will customers see "Optimized Entry Portal" anywhere?
**A:** No. They only see your business name, logo, and contact information.

### Q: Where do payments go?
**A:** Directly to YOUR Stripe account. You own the customer relationship and funds.

### Q: Can I customize the invoice template further?
**A:** Stripe provides standard invoice templates. For complete customization, you can use Stripe's API to generate custom PDFs (requires additional development).

### Q: What if I don't upload a logo?
**A:** Invoices will still work fine, just without a logo. Your business name will appear at the top.

### Q: Can I use my own domain for invoice links?
**A:** Not with standard Stripe-hosted invoices. The link will be `invoice.stripe.com/...`, but it will show your branding once opened.

## Brand Identity Checklist

Before sending your first invoice:

- [ ] Business name is set correctly in Stripe
- [ ] Support email is your business email
- [ ] Business address is complete and accurate
- [ ] Logo is uploaded (if you have one)
- [ ] Brand colors match your business colors
- [ ] Test invoice sent to yourself looks professional
- [ ] Support phone number is correct
- [ ] Invoice footer text is appropriate
- [ ] Email notifications use correct reply-to address

## Professional Tips

1. **Use a professional logo**: Even a simple text-based logo is better than none
2. **Set a clear support email**: Customers may have questions
3. **Add payment terms in notes**: e.g., "Net 30", "Due upon receipt"
4. **Include your license/registration numbers**: If required in your industry
5. **Add thank you messages**: Small touches improve customer experience
6. **Be consistent**: Use the same branding across all customer touchpoints

## Your Data, Your Business

Remember:
- ✅ You own the Stripe account
- ✅ You own the customer data
- ✅ You control the branding
- ✅ Payments go to you
- ✅ You set the pricing
- ✅ You manage refunds/disputes

Optimized Entry Portal is just the software tool that helps you manage your business more efficiently. Your customers interact with YOUR brand, not the software.
