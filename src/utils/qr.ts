import QRCode from 'qrcode';

/**
 * Generates a high quality QR Code Data URL string from text or JSON payload
 */
export async function generateQrCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0B0F19',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    // Safe SVG fallback
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><text x="100" y="105" text-anchor="middle" font-size="12" fill="black">${encodeURIComponent(text)}</text></svg>`;
  }
}
