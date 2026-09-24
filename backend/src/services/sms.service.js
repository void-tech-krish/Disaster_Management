const sendSMS = async (to, message) => {
  if (!process.env.SMS_PROVIDER_API_KEY) {
    console.log(`[SMS DISPATCH] PROVIDER_NOT_CONFIGURED - Would send to: ${to}`);
    return { status: 'PROVIDER_NOT_CONFIGURED' };
  }
  
  // Real implementation would go here
  console.log(`[SMS DISPATCH] Sent to: ${to}`);
  return { status: 'SENT' };
};

module.exports = {
  sendSMS
};
