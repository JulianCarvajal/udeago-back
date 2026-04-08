import * as CryptoJS from 'crypto-js';
import { ValueTransformer } from 'typeorm';

export class EncryptionTransformer implements ValueTransformer {
  private readonly key: string;

  constructor() {
    // Se utiliza la clave guardada en el .env. Si no está, usa una por defecto (no recomendado)
    this.key = process.env.DB_ENCRYPTION_KEY || '';
  }

  // Se ejecuta antes de GUARDAR en la BD (Cifra)
  to(value: any): any {
    if (!value) return value;
    return CryptoJS.AES.encrypt(JSON.stringify(value), this.key).toString();
  }

  // Se ejecuta al LEER de la BD (Descifra)
  from(value: any): any {
    if (!value) return value;
    try {
      const bytes = CryptoJS.AES.decrypt(value, this.key);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      // Si el dato no estaba cifrado (por ejemplo, datos viejos), lo devuelve tal cual
      return value;
    }
  }
}