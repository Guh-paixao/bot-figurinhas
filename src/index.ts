import qrcode from 'qrcode-terminal';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import fs from 'fs';
import path from 'path';

import express from 'express';


const app = express();

const client = new Client({
    authStrategy: new LocalAuth(),
})

let isClientReady = false;

client.on('ready', () => {
    console.log('Client is ready!');
    isClientReady = true;
});

const qrListener = (qr: any) => {
    if (isClientReady) {
        client.removeListener('qr', qrListener);
    } else {
        qrcode.generate(qr, { small: true });
    }
};

client.on('qr', qrListener);

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

client.on('message', async (msg) => {
    if (msg.hasMedia && msg.body.includes('Figurinha')) {
        const media = await msg.downloadMedia();

        const imagePath = path.join(tempDir, `${msg.id.id}.jpg`);
        fs.writeFileSync(imagePath, media.data, 'base64');

        const sticker = new Sticker(imagePath, {
            pack: 'Bot-Guh',
            author: 'Guh',
            type: StickerTypes.FULL,  // (FULL ou CROPPED)
            quality: 80,
        });

        const stickerBuffer = await sticker.toBuffer();

        const stickerMedia = new MessageMedia('image/webp', stickerBuffer.toString('base64'));

        await client.sendMessage(msg.from, stickerMedia, {
            sendMediaAsSticker: true,
        });

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        } else {
            console.warn(`File not found: ${imagePath}`);
        }
    }
});

client.on('message_create', async (msg) => {
    if (msg.hasMedia && msg.body.includes('Figurinha')) {
        const media = await msg.downloadMedia();

        const imagePath = path.join(tempDir, `${msg.id.id}.jpg`);
        fs.writeFileSync(imagePath, media.data, 'base64');

        const sticker = new Sticker(imagePath, {
            pack: 'Bot-Guh',
            author: 'Guh',
            type: StickerTypes.FULL,
            quality: 80,
        });

        const stickerBuffer = await sticker.toBuffer();

        const stickerMedia = new MessageMedia('image/webp', stickerBuffer.toString('base64'));

        await client.sendMessage(msg.from, stickerMedia, {
            sendMediaAsSticker: true,
        });

        fs.unlinkSync(imagePath);
    }
});

client.initialize();

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Servidor rodando :${PORT}`);
});