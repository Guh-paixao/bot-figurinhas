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

// Evento que escuta mensagens
client.on('message', async (msg) => {
    // Verifica se a mensagem contém mídia e se a mensagem de texto inclui "figurinha"
    if (msg.hasMedia && msg.body.includes('Figurinha')) {
        const media = await msg.downloadMedia();

        // Gera o caminho completo para salvar a imagem
        const imagePath = path.join(tempDir, `${msg.id.id}.jpg`);
        fs.writeFileSync(imagePath, media.data, 'base64');

        // Cria uma figurinha a partir da imagem
        const sticker = new Sticker(imagePath, {
            pack: 'Bot-Guh',  // Nome do pacote
            author: 'Guh',       // Autor da figurinha
            type: StickerTypes.FULL,  // Tipo da figurinha (FULL ou CROPPED)
            quality: 80,         // Qualidade da figurinha
        });

        // Gera o arquivo de figurinha como um Buffer
        const stickerBuffer = await sticker.toBuffer();

        // Converte o buffer da figurinha em um objeto de mídia do WhatsApp
        const stickerMedia = new MessageMedia('image/webp', stickerBuffer.toString('base64'));

        // Envia a figurinha de volta ao usuário
        await client.sendMessage(msg.from, stickerMedia, {
            sendMediaAsSticker: true,
        });

        // Apaga o arquivo temporário
        fs.unlinkSync(imagePath);
    }
});

client.on('message_create', async (msg) => {
    if (msg.hasMedia && msg.body.includes('Figurinha')) {
        const media = await msg.downloadMedia();

        // Gera o caminho completo para salvar a imagem
        const imagePath = path.join(tempDir, `${msg.id.id}.jpg`);
        fs.writeFileSync(imagePath, media.data, 'base64');

        // Cria uma figurinha a partir da imagem
        const sticker = new Sticker(imagePath, {
            pack: 'Bot-Guh',  // Nome do pacote
            author: 'Guh',       // Autor da figurinha
            type: StickerTypes.FULL,  // Tipo da figurinha (FULL ou CROPPED)
            quality: 80,         // Qualidade da figurinha
        });

        // Gera o arquivo de figurinha como um Buffer
        const stickerBuffer = await sticker.toBuffer();

        // Converte o buffer da figurinha em um objeto de mídia do WhatsApp
        const stickerMedia = new MessageMedia('image/webp', stickerBuffer.toString('base64'));

        // Envia a figurinha de volta ao usuário
        await client.sendMessage(msg.from, stickerMedia, {
            sendMediaAsSticker: true,
        });

        // Apaga o arquivo temporário
        fs.unlinkSync(imagePath);
    }
});

client.initialize();

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Servidor rodando :${PORT}`);
});