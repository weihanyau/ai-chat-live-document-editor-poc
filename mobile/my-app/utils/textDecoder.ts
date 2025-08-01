// React Native polyfill for TextDecoder since it's not available natively
export class TextDecoderPolyfill {
  private decoder: (bytes: Uint8Array) => string;

  constructor(encoding: string = 'utf-8') {
    if (encoding.toLowerCase() !== 'utf-8') {
      throw new Error('Only UTF-8 encoding is supported');
    }
    
    this.decoder = this.createUtf8Decoder();
  }

  private createUtf8Decoder() {
    return (bytes: Uint8Array): string => {
      let result = '';
      let i = 0;
      
      while (i < bytes.length) {
        let byte1 = bytes[i];
        
        if (byte1 < 0x80) {
          // 1-byte character (ASCII)
          result += String.fromCharCode(byte1);
          i++;
        } else if (byte1 < 0xE0) {
          // 2-byte character
          if (i + 1 >= bytes.length) break;
          let byte2 = bytes[i + 1];
          result += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
          i += 2;
        } else if (byte1 < 0xF0) {
          // 3-byte character
          if (i + 2 >= bytes.length) break;
          let byte2 = bytes[i + 1];
          let byte3 = bytes[i + 2];
          result += String.fromCharCode(
            ((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F)
          );
          i += 3;
        } else {
          // 4-byte character (surrogate pairs)
          if (i + 3 >= bytes.length) break;
          let byte2 = bytes[i + 1];
          let byte3 = bytes[i + 2];
          let byte4 = bytes[i + 3];
          let codePoint = 
            ((byte1 & 0x07) << 18) | 
            ((byte2 & 0x3F) << 12) | 
            ((byte3 & 0x3F) << 6) | 
            (byte4 & 0x3F);
          
          // Convert to surrogate pairs
          codePoint -= 0x10000;
          result += String.fromCharCode(
            0xD800 + (codePoint >> 10),
            0xDC00 + (codePoint & 0x3FF)
          );
          i += 4;
        }
      }
      
      return result;
    };
  }

  decode(bytes: Uint8Array, options?: { stream?: boolean }): string {
    return this.decoder(bytes);
  }
}

// Check if TextDecoder is available, otherwise use polyfill
export const getTextDecoder = (): TextDecoderPolyfill | TextDecoder => {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder();
  }
  return new TextDecoderPolyfill();
};
