const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTANTE: Usa il backend Emergent
const FASTAPI_URL = process.env.FASTAPI_URL || 'https://agent-dashboard-82.preview.emergentagent.com';

let sock = null;
let qrCode = null;
let connectionStatus = 'disconnected';

async function initWhatsApp() {
    try {
        console.log('🚀 Inizializzazione WhatsApp...');
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: ['RealEstate Bot', 'Chrome', '1.0.0']
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrCode = qr;
                console.log('\n📱 SCANSIONA IL QR CODE CON WHATSAPP:\n');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('❌ Connessione chiusa, riconnessione:', shouldReconnect);

                if (shouldReconnect) {
                    setTimeout(initWhatsApp, 5000);
                }
                connectionStatus = 'disconnected';
            } else if (connection === 'open') {
                console.log('✅ WhatsApp connesso con successo!');
                console.log('📡 Backend:', FASTAPI_URL);
                qrCode = null;
                connectionStatus = 'connected';
            } else if (connection === 'connecting') {
                connectionStatus = 'connecting';
            }
        });

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type === 'notify') {
                for (const message of messages) {
                    if (!message.key.fromMe && message.message) {
                        await handleIncomingMessage(message);
                    }
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (error) {
        console.error('❌ Errore inizializzazione WhatsApp:', error);
        setTimeout(initWhatsApp, 10000);
    }
}

async function handleIncomingMessage(message) {
    try {
        const phoneNumber = message.key.remoteJid.replace('@s.whatsapp.net', '');
        const messageText = message.message.conversation ||
                           message.message.extendedTextMessage?.text || '';

        console.log(`\n📨 Messaggio ricevuto da ${phoneNumber}: ${messageText}`);

        // Invia al backend Emergent
        const response = await axios.post(`${FASTAPI_URL}/api/whatsapp/webhook`, {
            phone_number: phoneNumber,
            message: messageText,
            timestamp: message.messageTimestamp
        }, {
            timeout: 30000
        });

        // Invia risposta su WhatsApp
        if (response.data.reply) {
            await sendMessage(phoneNumber, response.data.reply);
            console.log(`✅ Risposta inviata a ${phoneNumber}`);
        }

    } catch (error) {
        console.error('❌ Errore gestione messaggio:', error.message);
    }
}

async function sendMessage(phoneNumber, text) {
    try {
        if (!sock) {
            throw new Error('WhatsApp non connesso');
        }

        const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text });
        return { success: true };

    } catch (error) {
        console.error('❌ Errore invio messaggio:', error);
        return { success: false, error: error.message };
    }
}

// REST API endpoints (opzionale)
app.get('/status', (req, res) => {
    res.json({
        connected: sock?.user ? true : false,
        status: connectionStatus,
        user: sock?.user || null,
        backend: FASTAPI_URL
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🌐 ==========================================`);
    console.log(`🚀 WhatsApp Bot Service Avviato`);
    console.log(`📡 Backend Emergent: ${FASTAPI_URL}`);
    console.log(`🔌 Porta locale: ${PORT}`);
    console.log(`==========================================\n`);
    initWhatsApp();
});
