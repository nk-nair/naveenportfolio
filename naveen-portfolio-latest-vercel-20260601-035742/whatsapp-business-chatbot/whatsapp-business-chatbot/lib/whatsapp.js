const DEFAULT_GRAPH_VERSION = 'v23.0';

async function sendWhatsAppText(to, body) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;

  if (!accessToken || !phoneNumberId) {
    console.warn('WhatsApp credentials missing. Reply skipped:', { to, body });
    return { skipped: true };
  }

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`WhatsApp send failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

async function sendWhatsAppImage(to, imageUrl, caption = '') {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;

  if (!imageUrl) {
    console.warn('Discount image URL missing. Image reply skipped:', { to });
    return { skipped: true };
  }

  if (!accessToken || !phoneNumberId) {
    console.warn('WhatsApp credentials missing. Image reply skipped:', { to, imageUrl, caption });
    return { skipped: true };
  }

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`WhatsApp image send failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = {
  sendWhatsAppText,
  sendWhatsAppImage
};
