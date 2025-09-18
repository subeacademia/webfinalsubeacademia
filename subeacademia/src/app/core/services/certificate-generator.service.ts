import { Injectable } from '@angular/core';
import { Certificate } from '../models/certificate.model';
import { Timestamp } from '@angular/fire/firestore';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CertificateGeneratorService {
  private readonly SECRET_KEY = 'SUBEIA_CERT_2024_SECURE_KEY'; // En producción, esto debe venir de variables de entorno
  private readonly VALIDATION_BASE_URL = 'https://subeia.tech/es/certificados/validar';

  /**
   * Genera un código único de certificado
   */
  generateCertificateCode(courseName: string, studentName: string): string {
    const courseCode = this.getCourseCode(courseName);
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${courseCode}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Genera un hash de verificación seguro
   */
  generateVerificationHash(certificateData: Partial<Certificate>): string {
    const dataString = `${certificateData.studentName}|${certificateData.courseName}|${certificateData.certificateCode}|${certificateData.completionDate?.toMillis()}`;
    return CryptoJS.SHA256(dataString + this.SECRET_KEY).toString();
  }

  /**
   * Genera un código QR para el certificado
   */
  async generateQRCode(certificateCode: string): Promise<string> {
    const validationUrl = `${this.VALIDATION_BASE_URL}/${certificateCode}`;
    try {
      const qrCodeDataURL = await QRCode.toDataURL(validationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generando código QR:', error);
      throw new Error('No se pudo generar el código QR');
    }
  }

  /**
   * Valida la integridad de un certificado
   */
  validateCertificateIntegrity(certificate: Certificate): boolean {
    const expectedHash = this.generateVerificationHash(certificate);
    return expectedHash === certificate.verificationHash;
  }

  /**
   * Crea un certificado completo con todos los datos de seguridad
   */
  async createCompleteCertificate(
    studentName: string,
    courseName: string,
    completionDate: Date,
    options: {
      grade?: number;
      instructorName?: string;
      courseDuration?: string;
      certificateType?: 'completion' | 'achievement' | 'participation';
      issuerEmail?: string;
      issuerName?: string;
    } = {}
  ): Promise<Omit<Certificate, 'id'>> {
    const certificateCode = this.generateCertificateCode(courseName, studentName);
    const completionTimestamp = Timestamp.fromDate(completionDate);
    const issuedTimestamp = Timestamp.fromDate(new Date());

    // Crear datos base del certificado
    const baseCertificate: Partial<Certificate> = {
      studentName,
      courseName,
      completionDate: completionTimestamp,
      certificateCode,
      issuedDate: issuedTimestamp,
      institutionName: 'Sube Academia',
      certificateType: options.certificateType || 'completion',
      status: 'active',
      grade: options.grade,
      instructorName: options.instructorName,
      courseDuration: options.courseDuration
    };

    // Generar hash de verificación
    const verificationHash = this.generateVerificationHash(baseCertificate);

    // Generar código QR
    const qrCode = await this.generateQRCode(certificateCode);

    // Crear certificado completo
    const completeCertificate: Omit<Certificate, 'id'> = {
      ...baseCertificate as Certificate,
      verificationHash,
      qrCode,
      metadata: {
        issuerEmail: options.issuerEmail || 'admin@subeia.tech',
        issuerName: options.issuerName || 'Sistema Administrativo',
        validationUrl: `${this.VALIDATION_BASE_URL}/${certificateCode}`,
        securityFeatures: [
          'SHA256_HASH_VERIFICATION',
          'QR_CODE_VALIDATION',
          'TIMESTAMP_VERIFICATION',
          'UNIQUE_CERTIFICATE_CODE'
        ]
      }
    };

    return completeCertificate;
  }

  /**
   * Genera un código de curso basado en el nombre
   */
  private getCourseCode(courseName: string): string {
    const words = courseName.split(' ');
    if (words.length >= 2) {
      return words.slice(0, 2).map(word => word.substring(0, 3).toUpperCase()).join('');
    }
    return courseName.substring(0, 6).toUpperCase();
  }

  /**
   * Revoca un certificado (marca como revocado)
   */
  revokeCertificate(certificate: Certificate): Certificate {
    return {
      ...certificate,
      status: 'revoked'
    };
  }

  /**
   * Verifica si un certificado está activo y válido
   */
  isCertificateValid(certificate: Certificate): boolean {
    return certificate.status === 'active' && this.validateCertificateIntegrity(certificate);
  }
}
