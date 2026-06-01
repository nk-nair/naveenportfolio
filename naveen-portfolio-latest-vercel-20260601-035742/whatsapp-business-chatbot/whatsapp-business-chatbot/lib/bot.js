const BRAND_NAME = process.env.BRAND_NAME || 'Naveen Nair';
const OWNER_NUMBER = process.env.OWNER_WHATSAPP_NUMBER || '919638940669';
const DISCOUNT_IMAGE_URL = process.env.DISCOUNT_IMAGE_URL || '/gg-discount-claim.png';

const services = {
  '1': 'Branding and marketing strategy',
  '2': 'Social media and LinkedIn growth',
  '3': 'Ads and performance marketing',
  '4': 'Website, portfolio, and creative assets'
};

const sessions = new Map();
const capturedLeads = [];

function clean(value) {
  return String(value || '').trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function firstName(name) {
  return clean(name).split(/\s+/)[0] || '';
}

function getSession(from, profileName) {
  if (!sessions.has(from)) {
    sessions.set(from, {
      step: 'menu',
      lead: {
        whatsapp: from,
        name: clean(profileName),
        discountCode: ''
      },
      updatedAt: new Date().toISOString()
    });
  }

  const session = sessions.get(from);
  if (!session.lead.name && profileName) session.lead.name = clean(profileName);
  session.updatedAt = new Date().toISOString();
  return session;
}

function menuText(profileName) {
  const greetingName = firstName(profileName);
  const hello = greetingName ? `Hi ${greetingName}` : 'Hi';

  return `${hello}, welcome to ${BRAND_NAME}'s branding and marketing desk.

Reply with a number:
1. Branding and strategy
2. Social media / LinkedIn growth
3. Ads and performance marketing
4. Website / portfolio creatives
5. Claim 10% discount with code GG
6. Talk to Naveen`;
}

function detectServiceChoice(message) {
  if (services[message]) return message;
  if (message.includes('brand') || message.includes('strategy')) return '1';
  if (message.includes('social') || message.includes('linkedin') || message.includes('content')) return '2';
  if (message.includes('ads') || message.includes('cpc') || message.includes('lead')) return '3';
  if (message.includes('website') || message.includes('portfolio') || message.includes('creative')) return '4';
  return '';
}

function startLeadFlow(session, serviceChoice) {
  session.lead.service = services[serviceChoice];

  if (!session.lead.name) {
    session.step = 'name';
    return [text(`Great. I can help with ${session.lead.service}. What is your name?`)];
  }

  session.step = 'business';
  return [text(`Great, ${firstName(session.lead.name)}. I can help with ${session.lead.service}. What is your business or company name?`)];
}

function text(body) {
  return { type: 'text', body };
}

function image(link, caption) {
  return { type: 'image', link, caption };
}

function discountClaimReplies(session) {
  session.lead.discountCode = 'GG';
  session.step = 'discountService';

  const replies = [
    text(`Discount claimed.

Congratulations! You have unlocked 10% discount on branding and marketing services.

Use code: GG

Choose the service you want to claim it for:
1. Branding and strategy
2. Social media / LinkedIn growth
3. Ads and performance marketing
4. Website / portfolio creatives`)
  ];

  if (DISCOUNT_IMAGE_URL) {
    replies.push(image(DISCOUNT_IMAGE_URL, 'GG claimed: 10% discount with Naveen Nair'));
  } else {
    replies.push(text('Discount image is pending setup. Naveen will share the claim creative soon.'));
  }

  return replies;
}

function finishLead(session) {
  session.step = 'complete';
  session.lead.createdAt = new Date().toISOString();
  capturedLeads.push({ ...session.lead });
  console.log('New WhatsApp lead:', session.lead);

  const discountLine = session.lead.discountCode
    ? `\nDiscount code: ${session.lead.discountCode}`
    : '';

  return text(`Thanks ${firstName(session.lead.name) || 'friend'}, I have captured your details:

Service: ${session.lead.service || 'Not selected'}
Business: ${session.lead.business || 'Not shared'}
City: ${session.lead.city || 'Not shared'}
Budget: ${session.lead.budget || 'Not shared'}${discountLine}

Naveen will reply here soon. For urgent help, message directly: https://wa.me/${OWNER_NUMBER}`);
}

function handleMenuChoice(session, message) {
  if (message === '5' || message.includes('discount') || message.includes('claim') || message === 'gg') {
    return discountClaimReplies(session);
  }

  if (message === '6' || message.includes('talk') || message.includes('naveen') || message.includes('human')) {
    session.step = 'complete';
    return [text(`Sure. You can reach Naveen here: https://wa.me/${OWNER_NUMBER}

You can also reply MENU anytime to explore services.`)];
  }

  const serviceChoice = detectServiceChoice(message);
  if (serviceChoice) return startLeadFlow(session, serviceChoice);

  return [text(menuText(session.lead.name))];
}

function handleIncomingMessage({ from, text, name }) {
  const session = getSession(from, name);
  const raw = clean(text);
  const message = lower(raw);

  if (!raw || ['hi', 'hello', 'hey', 'start', 'menu'].includes(message)) {
    session.step = 'menu';
    return [text(menuText(session.lead.name || name))];
  }

  if (message === 'reset') {
    sessions.delete(from);
    return [text(menuText(name))];
  }

  if (message.includes('contact dealer')) {
    return [text(`Contact dealer mode activated. Naveen is available here: https://wa.me/${OWNER_NUMBER}`)];
  }

  if (message === 'gg') {
    return discountClaimReplies(session);
  }

  switch (session.step) {
    case 'name':
      session.lead.name = raw;
      session.step = 'business';
      return [text(`Nice to meet you, ${firstName(raw)}. What is your business or company name?`)];

    case 'business':
      session.lead.business = raw;
      session.step = 'city';
      return [text('Which city or market are you targeting?')];

    case 'city':
      session.lead.city = raw;
      session.step = 'budget';
      return [text('What monthly budget range are you comfortable with? You can reply like "10k-25k", "25k-50k", or "not sure".')];

    case 'budget':
      session.lead.budget = raw;
      return [finishLead(session)];

    case 'discountService': {
      const serviceChoice = detectServiceChoice(message);
      if (serviceChoice) return startLeadFlow(session, serviceChoice);
      return [text('Please choose 1, 2, 3, or 4 so I can apply code GG to the right service.')];
    }

    case 'complete':
      return handleMenuChoice(session, message);

    case 'menu':
    default:
      return handleMenuChoice(session, message);
  }
}

module.exports = {
  handleIncomingMessage,
  capturedLeads
};
