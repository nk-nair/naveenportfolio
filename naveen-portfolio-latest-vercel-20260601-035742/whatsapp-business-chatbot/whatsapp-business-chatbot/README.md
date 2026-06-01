# Naveen Nair WhatsApp Business Chatbot

This is a WhatsApp Cloud API chatbot for handling branding and marketing leads.

## What It Does

- Greets new WhatsApp users
- Shows a service menu
- Captures name, business, city, service, and budget
- Sends a discount claimed message and image when someone texts `GG`
- Shares Naveen's WhatsApp handoff link
- Works as a Vercel serverless project

## Files

- `api/webhook.js` - WhatsApp webhook verification and incoming message handler
- `lib/bot.js` - Conversation flow and lead capture logic
- `lib/whatsapp.js` - Sends replies through Meta WhatsApp Cloud API
- `public/gg-discount-claim.png` - Default discount claim image
- `.env.example` - Environment variables to copy into Vercel

## Required Meta Setup

You need:

- Meta Business account
- WhatsApp Business Account
- A phone number connected to WhatsApp Cloud API
- Phone Number ID
- Permanent access token
- Webhook verify token

Official docs:

- https://developers.facebook.com/docs/whatsapp/cloud-api/
- https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/
- https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates/

## Vercel Deployment

1. Upload this folder as a new GitHub repo or a folder in your existing repo.
2. Create a new Vercel project from this folder.
3. Add these environment variables in Vercel:

```env
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=choose_a_secret_verify_token
WHATSAPP_GRAPH_VERSION=v23.0
BRAND_NAME=Naveen Nair
OWNER_WHATSAPP_NUMBER=919638940669
DISCOUNT_IMAGE_URL=
```

Leave `DISCOUNT_IMAGE_URL` blank to use the included image after Vercel deployment:

```text
https://your-vercel-domain.vercel.app/gg-discount-claim.png
```

If you want to use your own image, upload it somewhere public and set `DISCOUNT_IMAGE_URL` to that full HTTPS image link.

4. In Meta Developer dashboard, set webhook callback URL:

```text
https://your-vercel-domain.vercel.app/api/webhook
```

5. Use the same `WHATSAPP_VERIFY_TOKEN` value when Meta asks for the verify token.
6. Subscribe to the `messages` webhook field.
7. Send `Hi` to the connected WhatsApp Business number.

## Notes

- If a customer messages you first, the bot can reply inside the active customer service window.
- Business-initiated outbound messages outside that window need approved WhatsApp message templates.
- Current lead storage is in memory/logs. For production, connect Google Sheets, Airtable, HubSpot, or a database.

## Customize

Edit `lib/bot.js` to change:

- Services
- Questions
- Discount code
- Handoff number
- Bot tone

Replace `public/gg-discount-claim.png` if you want a different discount image.
