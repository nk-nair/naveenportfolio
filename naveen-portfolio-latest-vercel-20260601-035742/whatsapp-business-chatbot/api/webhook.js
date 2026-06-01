const { handleIncomingMessage } = require('../lib/bot');
const { sendWhatsAppImage, sendWhatsAppText } = require('../lib/whatsapp');

function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).json({ ok: false, error: 'Webhook verification failed' });
}

function getIncomingText(message) {
  if (!message) return '';
  if (message.type === 'text') return message.text?.body || '';
  if (message.type === 'button') return message.button?.text || message.button?.payload || '';
  if (message.type === 'interactive') {
    return (
      message.interactive?.button_reply?.title ||
      message.interactive?.button_reply?.id ||
      message.interactive?.list_reply?.title ||
      message.interactive?.list_reply?.id ||
      ''
    );
  }
  return message.type ? `[${message.type}]` : '';
}

function collectIncomingMessages(payload) {
  const messages = [];
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value || {};
      const contacts = Array.isArray(value.contacts) ? value.contacts : [];
      const contactByWaId = new Map(contacts.map(contact => [contact.wa_id, contact]));
      const incoming = Array.isArray(value.messages) ? value.messages : [];

      for (const message of incoming) {
        const contact = contactByWaId.get(message.from) || contacts[0] || {};
        messages.push({
          from: message.from,
          name: contact.profile?.name || '',
          text: getIncomingText(message),
          messageId: message.id,
          timestamp: message.timestamp
        });
      }
    }
  }

  return messages;
}

function absoluteMediaUrl(req, link) {
  if (!link || /^https:\/\//i.test(link)) return link;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';

  if (!host || !link.startsWith('/')) return link;
  return `${protocol}://${host}${link}`;
}

module.exports = async function webhook(req, res) {
  if (req.method === 'GET') {
    return verifyWebhook(req, res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const incomingMessages = collectIncomingMessages(req.body || {});

    for (const incoming of incomingMessages) {
      const replies = handleIncomingMessage(incoming);
      for (const reply of replies) {
        if (typeof reply === 'string') {
          await sendWhatsAppText(incoming.from, reply);
        } else if (reply?.type === 'image') {
          await sendWhatsAppImage(incoming.from, absoluteMediaUrl(req, reply.link), reply.caption);
        } else if (reply?.type === 'text') {
          await sendWhatsAppText(incoming.from, reply.body);
        }
      }
    }

    return res.status(200).json({ ok: true, handled: incomingMessages.length });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return res.status(200).json({ ok: false, error: 'Webhook received but bot failed internally' });
  }
};
