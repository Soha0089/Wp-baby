// Install dependencies first:
// npm i whatsapp-web.js qrcode fs puppeteer

const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one" // optional: for multiple clients
    }),
    puppeteer: {
        headless: true, // true: background, false: browser visible
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    },
    takeoverOnConflict: true,
    takeoverTimeoutMs: 30000
});

// =======================
// QR CODE EVENT
// =======================
client.on('qr', async (qr) => {
    try {
        // Save as PNG
        await QRCode.toFile('qrcode.png', qr, {
            width: 1200,                 // High resolution for phone scan
            margin: 4,
            errorCorrectionLevel: 'H'
        });

        // Generate DataURL for browser scanning
        const dataUrl = await QRCode.toDataURL(qr, {
            width: 1200,
            margin: 4,
            errorCorrectionLevel: 'H'
        });

        console.log('✅ QR saved as qrcode.png');
        console.log('🔗 Open this URL in another phone browser to scan:');
        console.log(dataUrl);

    } catch (err) {
        console.error('❌ QR generation error:', err);
    }
});

// =======================
// READY EVENT
// =======================
client.on('ready', () => {
    console.log('✅ WhatsApp Client is ready!');
});

// =======================
// AUTH EVENTS
// =======================
client.on('authenticated', () => {
    console.log('✅ Authenticated successfully!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failure:', msg);
});

client.on('disconnected', (reason) => {
    console.log('🔄 Client disconnected:', reason);
    setTimeout(() => {
        console.log('Reconnecting...');
        client.initialize();
    }, 5000);
});

// =======================
// MESSAGE HANDLER (optional)
// =======================
client.on('message', async (msg) => {
    if (msg.body === '!ping') {
        try {
            await msg.reply('pong');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
});

// =======================
// INITIALIZE CLIENT
// =======================
client.initialize();

// =======================
// GLOBAL ERROR HANDLING
// =======================
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.log('Uncaught Exception:', error);
});
