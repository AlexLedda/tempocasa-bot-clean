require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

// Backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001';

console.log('🚀 Twilio WhatsApp Service Starting...');
console.log('📡 Backend URL:', BACKEND_URL);
console.log('📱 Twilio Phone:', twilioPhoneNumber);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'twilio-whatsapp',
    backend: BACKEND_URL,
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint for incoming WhatsApp messages
app.post('/webhook', async (req, res) => {
  try {
    const incomingMessage = req.body.Body;
    const fromNumber = req.body.From; // Format: whatsapp:+1234567890
    const phoneNumber = fromNumber.replace('whatsapp:', '');

    console.log('📩 Received message from:', phoneNumber);
    console.log('💬 Message:', incomingMessage);

    // Send message to backend for processing
    const backendResponse = await axios.post(`${BACKEND_URL}/api/whatsapp/webhook`, {
      phone_number: phoneNumber,
      message: incomingMessage,
      timestamp: Math.floor(Date.now() / 1000)
    }, {
      timeout: 30000 // 30 seconds timeout
    });

    const reply = backendResponse.data.reply;

    if (reply) {
      // Send reply via Twilio
      await client.messages.create({
        body: reply,
        from: twilioPhoneNumber,
        to: fromNumber
      });

      console.log('✅ Reply sent:', reply.substring(0, 50) + '...');
    } else {
      console.log('⚠️ No reply from backend');
    }

    // Respond to Twilio with 200 OK
    res.status(200).send('OK');

  } catch (error) {
    console.error('❌ Error processing webhook:', error.message);
    if (error.response) {
      console.error('Backend response:', error.response.data);
    }
    res.status(200).send('OK'); // Always return 200 to Twilio
  }
});

// Send message endpoint (for manual testing)
app.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Missing "to" or "message" parameter' });
    }

    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    });

    console.log('✅ Message sent:', result.sid);
    res.json({ success: true, sid: result.sid });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Twilio WhatsApp Service running on port ${PORT}`);
  console.log(`📡 Webhook: http://localhost:${PORT}/webhook`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
