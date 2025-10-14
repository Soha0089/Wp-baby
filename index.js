/**
 * WhatsApp Bot V2 - Fixed & Cross-device QR Ready
 * Author: Rahaman Leon
 * License: MIT
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

// Ensure auth_data folder exists
const sessionPath = path.resolve('./auth_data');
if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({ clientId: config.whatsapp.clientId, dataPath: sessionPath }),
    puppeteer: {
        headless: config.whatsapp.headless !== false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-web-security'
        ]
    },
    takeoverOnConflict: true,
    takeoverTimeoutMs: 15000,
    restartOnAuthFail: true
});

// Cross-device QR ready: generate both terminal QR & data URL for phone scan
client.on('qr', async (qr) => {
    console.log('📱 QR Generated, scan with another device');
    qrcodeTerminal.generate(qr, { small: true });

    try {
        const dataURL = await QRCode.toDataURL(qr, { width: 1200, margin: 2, errorCorrectionLevel: 'H' });
        const qrFile = path.join(sessionPath, 'cross-device-qr.png');
        await QRCode.toFile(qrFile, qr, { width: 1200, margin: 2, errorCorrectionLevel: 'H' });
        console.log(`✅ QR saved as PNG: ${qrFile}`);
        console.log(`💻 Open this DataURL on another device: ${dataURL}`);
    } catch (err) {
        console.error('❌ Failed to generate cross-device QR:', err);
    }
});

// Authentication success
client.on('authenticated', () => {
    console.log('✅ WhatsApp Authenticated!');
});

// Auth failure
client.on('auth_failure', msg => {
    console.error('❌ Authentication Failed:', msg);
    if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log('🗑️ Cleared session. Restart bot and scan QR again.');
});

// Ready
client.on('ready', () => {
    console.log(`🎉 WhatsApp Bot Ready! Connected as: ${client.info.wid.user}`);
});

// Message handler
client.on('message', async (msg) => {
    if (msg.body.toLowerCase() === '!ping') {
        await msg.reply('pong');
    }
});

// Disconnect handling
client.on('disconnected', (reason) => {
    console.warn('⚠️ WhatsApp Disconnected:', reason);
    console.log('🔄 Reinitializing client...');
    setTimeout(() => client.initialize(), 5000);
});

// Initialize client
(async () => {
    try {
        await client.initialize();
        console.log('🚀 WhatsApp Client Initialized!');
    } catch (err) {
        console.error('❌ Initialization Error:', err);
        setTimeout(() => client.initialize(), 10000);
    }
})();
