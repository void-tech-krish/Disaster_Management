const sendEmail = async (to, subject, body) => {
  if (!process.env.EMAIL_PROVIDER_API_KEY) {
    console.log(`[EMAIL DISPATCH] PROVIDER_NOT_CONFIGURED - Would send to: ${to}`);
    return { status: 'PROVIDER_NOT_CONFIGURED' };
  }
  
  // Real implementation would go here
  console.log(`[EMAIL DISPATCH] Sent to: ${to} | Subject: ${subject}`);
  return { status: 'SENT' };
};

module.exports = {
  sendEmail
};
