const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', async (qr) => {
    try {
        // High-res PNG
        await QRCode.toFile('qrcode.png', qr, {
            width: 1200,                 // বড় QR image
            margin: 4,
            errorCorrectionLevel: 'H'
        });

        // Data URL for browser scan
        const dataUrl = await QRCode.toDataURL(qr, {
            width: 1200,
            margin: 4,
            errorCorrectionLevel: 'H'
        });

        console.log('QR saved as qrcode.png');
        console.log('Open this DataURL in another phone browser to scan:');
        console.log(dataUrl);

    } catch (err) {
        console.error('QR generation error:', err);
    }
});

client.on('ready', () => console.log('Client ready!'));

client.initialize();
