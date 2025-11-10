const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTANTE: URL del tuo backend Emergent
const FASTAPI_URL = process.env.FASTAPI_URL || 'https://propbot-dash.preview.emergentagent.com';
const PORT = process.env.PORT || 3001;

let sock = null;
let qrCodeData = null;
let qrCodeImage = null;
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
                qrCodeData = qr;
                console.log('\n📱 ========================================');
                console.log('   QR CODE GENERATO!');
                console.log('========================================');
                console.log('Vai su: http://localhost:' + PORT + '/qr');
                console.log('Oppure scansiona dal terminale qui sotto:');
                console.log('========================================\n');
                qrcode.generate(qr, { small: true });
                
                // Genera immagine QR
                try {
                    qrCodeImage = await QRCode.toDataURL(qr);
                } catch (err) {
                    console.error('Errore generazione QR image:', err);
                }
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('❌ Connessione chiusa, riconnessione:', shouldReconnect);

                if (shouldReconnect) {
                    setTimeout(initWhatsApp, 5000);
                }
                connectionStatus = 'disconnected';
                qrCodeData = null;
                qrCodeImage = null;
            } else if (connection === 'open') {
                console.log('✅ WhatsApp connesso con successo!');
                console.log('📡 Backend:', FASTAPI_URL);
                qrCodeData = null;
                qrCodeImage = null;
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
        const messageText = message.message.conversation || message.message.extendedTextMessage?.text || '';

        console.log(`\n📨 Messaggio da ${phoneNumber}: ${messageText}`);

        // Invia al backend Emergent
        const response = await axios.post(`${FASTAPI_URL}/api/whatsapp/webhook`, {
            phone_number: phoneNumber,
            message: messageText,
            timestamp: message.messageTimestamp
        }, { timeout: 30000 });

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
        if (!sock) throw new Error('WhatsApp non connesso');
        const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text });
        return { success: true };
    } catch (error) {
        console.error('❌ Errore invio:', error);
        return { success: false };
    }
}

// REST API Endpoints
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp Bot - Railway</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .container {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }
                h1 { margin-top: 0; font-size: 2.5em; }
                .status {
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    background: rgba(255,255,255,0.2);
                    font-size: 1.2em;
                }
                .connected { background: rgba(16, 185, 129, 0.3); }
                .disconnected { background: rgba(239, 68, 68, 0.3); }
                a {
                    display: inline-block;
                    background: white;
                    color: #667eea;
                    padding: 15px 30px;
                    border-radius: 10px;
                    text-decoration: none;
                    font-weight: bold;
                    margin: 10px 5px;
                }
                a:hover { transform: scale(1.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 WhatsApp Bot Railway</h1>
                <div class="status ${connectionStatus === 'connected' ? 'connected' : 'disconnected'}">
                    ${connectionStatus === 'connected' ? '✅ Bot Connesso e Attivo!' : '⏳ In attesa di connessione...'}
                </div>
                <p><strong>Backend:</strong> ${FASTAPI_URL}</p>
                <p><strong>Stato:</strong> ${connectionStatus}</p>
                ${qrCodeData || qrCodeImage ? '<a href="/qr">📱 Visualizza QR Code</a>' : ''}
                <a href="/status">🔍 Stato Dettagliato</a>
                <a href="/logs">📋 Logs</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/qr', (req, res) => {
    if (qrCodeImage) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - WhatsApp Bot</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    .qr-container {
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center;
                    }
                    h1 { color: #667eea; margin-top: 0; }
                    img { max-width: 400px; width: 100%; }
                    .instructions {
                        margin-top: 20px;
                        color: #666;
                        line-height: 1.6;
                    }
                    .warning {
                        background: #fef3c7;
                        color: #92400e;
                        padding: 15px;
                        border-radius: 10px;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <h1>📱 Scansiona QR Code</h1>
                    <img src="${qrCodeImage}" alt="QR Code">
                    <div class="instructions">
                        <p><strong>Come scansionare:</strong></p>
                        <ol style="text-align: left;">
                            <li>Apri WhatsApp sul telefono</li>
                            <li>Vai su <strong>Impostazioni → Dispositivi collegati</strong></li>
                            <li>Tocca <strong>Collega un dispositivo</strong></li>
                            <li>Scansiona questo QR code</li>
                        </ol>
                    </div>
                    <div class="warning">
                        ⏱️ Il QR code scade dopo 60 secondi. Ricarica la pagina se scade.
                    </div>
                </div>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>⏳ QR Code in arrivo...</h1>
                <p>Il QR code verrà generato tra pochi secondi.</p>
                <p><a href="/qr">🔄 Ricarica</a></p>
            </body>
            </html>
        `);
    }
});

app.get('/status', (req, res) => {
    res.json({
        connected: sock?.user ? true : false,
        status: connectionStatus,
        user: sock?.user || null,
        backend: FASTAPI_URL,
        hasQR: !!qrCodeData
    });
});

let logs = [];
const originalLog = console.log;
console.log = (...args) => {
    const message = args.join(' ');
    logs.push({ time: new Date().toISOString(), message });
    if (logs.length > 100) logs.shift();
    originalLog(...args);
};

app.get('/logs', (req, res) => {
    res.json({ logs: logs.slice(-50) });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🌐 ==========================================');
    console.log(`🚀 WhatsApp Bot Railway Avviato!`);
    console.log(`📡 Backend: ${FASTAPI_URL}`);
    console.log(`🔌 Porta: ${PORT}`);
    console.log(`🌍 URL: https://[your-railway-url].railway.app`);
    console.log('==========================================\n');
    initWhatsApp();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
