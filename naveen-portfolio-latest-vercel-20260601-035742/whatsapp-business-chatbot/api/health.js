module.exports = function health(req, res) {
  res.status(200).json({
    ok: true,
    service: 'Naveen Nair WhatsApp Business Chatbot'
  });
};
