require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const axios = require('axios');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const client = twilio(accountSid, authToken);

// FastAPI backend URL
const FASTAPI_URL = process.env.FASTAPI_URL || 'https://your-backend-url.com';

const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'active',
        service: 'WhatsApp Bot Twilio',
        timestamp: new Date().toISOString()
    });
});

// Webhook endpoint for incoming WhatsApp messages
app.post('/webhook', async (req, res) => {
    try {
        const incomingMsg = req.body.Body;
        const from = req.body.From; // Format: whatsapp:+1234567890
        const phoneNumber = from.replace('whatsapp:', '');

        console.log(`📩 Messaggio ricevuto da ${phoneNumber}: ${incomingMsg}`);

        // Send message to FastAPI backend for AI processing
        const response = await axios.post(`${FASTAPI_URL}/api/whatsapp/webhook`, {
            phone_number: phoneNumber,
            message: incomingMsg,
            timestamp: new Date().toISOString()
        }, { 
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Send AI response back via WhatsApp
        if (response.data.reply) {
            await client.messages.create({
                body: response.data.reply,
                from: twilioWhatsAppNumber,
                to: from
            });
            console.log(`✅ Risposta inviata a ${phoneNumber}`);
        }

        // Respond to Twilio with 200 OK
        res.status(200).send('OK');

    } catch (error) {
        console.error('❌ Errore gestione messaggio:', error.message);
        if (error.response) {
            console.error('Backend response:', error.response.data);
        }
        res.status(500).send('Error processing message');
    }
});

// Send message function (can be called by backend)
app.post('/send', async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        
        if (!phoneNumber || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number and message are required' 
            });
        }

        const to = phoneNumber.startsWith('whatsapp:') 
            ? phoneNumber 
            : `whatsapp:${phoneNumber}`;

        await client.messages.create({
            body: message,
            from: twilioWhatsAppNumber,
            to: to
        });

        console.log(`✅ Messaggio inviato a ${phoneNumber}`);
        res.json({ success: true });

    } catch (error) {
        console.error('❌ Errore invio messaggio:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Twilio WhatsApp Bot avviato');
    console.log(`📡 Server in ascolto sulla porta ${PORT}`);
    console.log(`🔗 Webhook URL: https://your-railway-url.up.railway.app/webhook`);
    console.log(`📱 WhatsApp Number: ${twilioWhatsAppNumber}`);
});
