import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, getDocs, Timestamp } from '@angular/fire/firestore';
import { Certificate } from '../models/certificate.model';

export interface CertificateAuditLog {
  id?: string;
  certificateId: string;
  certificateCode: string;
  action: 'created' | 'updated' | 'deleted' | 'revoked' | 'validated' | 'validation_failed';
  performedBy: string;
  performedAt: Timestamp;
  ipAddress?: string;
  userAgent?: string;
  details?: {
    previousStatus?: string;
    newStatus?: string;
    validationResult?: boolean;
    errorMessage?: string;
    changes?: Record<string, any>;
    totalProcessed?: number;
    successful?: number;
    failed?: number;
  };
  metadata?: {
    adminEmail?: string;
    validationSource?: 'admin' | 'public' | 'qr_scan';
    securityFlags?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class CertificateAuditService {
  private firestore = inject(Firestore);
  private auditCollection = collection(this.firestore, 'certificate_audit_logs');

  /**
   * Registra una acción de auditoría para un certificado
   */
  async logAction(auditLog: Omit<CertificateAuditLog, 'id' | 'performedAt'>): Promise<void> {
    try {
      const logEntry: Omit<CertificateAuditLog, 'id'> = {
        ...auditLog,
        performedAt: Timestamp.fromDate(new Date())
      };
      
      await addDoc(this.auditCollection, logEntry);
    } catch (error) {
      console.error('Error logging certificate audit action:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Registra la creación de un certificado
   */
  async logCertificateCreation(
    certificate: Certificate, 
    adminEmail: string, 
    ipAddress?: string
  ): Promise<void> {
    await this.logAction({
      certificateId: certificate.id || '',
      certificateCode: certificate.certificateCode,
      action: 'created',
      performedBy: adminEmail,
      ipAddress,
      details: {
        newStatus: certificate.status
      },
      metadata: {
        adminEmail,
        validationSource: 'admin',
        securityFlags: certificate.metadata?.securityFeatures || []
      }
    });
  }

  /**
   * Registra la actualización de un certificado
   */
  async logCertificateUpdate(
    certificateId: string,
    certificateCode: string,
    changes: Record<string, any>,
    adminEmail: string,
    previousStatus?: string,
    newStatus?: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logAction({
      certificateId,
      certificateCode,
      action: 'updated',
      performedBy: adminEmail,
      ipAddress,
      details: {
        previousStatus,
        newStatus,
        changes
      },
      metadata: {
        adminEmail,
        validationSource: 'admin'
      }
    });
  }

  /**
   * Registra la revocación de un certificado
   */
  async logCertificateRevocation(
    certificateId: string,
    certificateCode: string,
    adminEmail: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logAction({
      certificateId,
      certificateCode,
      action: 'revoked',
      performedBy: adminEmail,
      ipAddress,
      details: {
        previousStatus: 'active',
        newStatus: 'revoked'
      },
      metadata: {
        adminEmail,
        validationSource: 'admin'
      }
    });
  }

  /**
   * Registra la eliminación de un certificado
   */
  async logCertificateDeletion(
    certificateId: string,
    certificateCode: string,
    adminEmail: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logAction({
      certificateId,
      certificateCode,
      action: 'deleted',
      performedBy: adminEmail,
      ipAddress,
      metadata: {
        adminEmail,
        validationSource: 'admin'
      }
    });
  }

  /**
   * Registra un intento de validación exitoso
   */
  async logSuccessfulValidation(
    certificateId: string,
    certificateCode: string,
    source: 'public' | 'qr_scan' = 'public',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      certificateId,
      certificateCode,
      action: 'validated',
      performedBy: 'public_user',
      ipAddress,
      userAgent,
      details: {
        validationResult: true
      },
      metadata: {
        validationSource: source
      }
    });
  }

  /**
   * Registra un intento de validación fallido
   */
  async logFailedValidation(
    certificateCode: string,
    errorMessage: string,
    source: 'public' | 'qr_scan' = 'public',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      certificateId: 'unknown',
      certificateCode,
      action: 'validation_failed',
      performedBy: 'public_user',
      ipAddress,
      userAgent,
      details: {
        validationResult: false,
        errorMessage
      },
      metadata: {
        validationSource: source,
        securityFlags: ['VALIDATION_FAILED']
      }
    });
  }

  /**
   * Obtiene el historial de auditoría para un certificado específico
   */
  async getCertificateAuditHistory(certificateId: string): Promise<CertificateAuditLog[]> {
    try {
      const q = query(
        this.auditCollection,
        where('certificateId', '==', certificateId),
        orderBy('performedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CertificateAuditLog));
    } catch (error) {
      console.error('Error getting certificate audit history:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas de validación por período
   */
  async getValidationStats(days: number = 30): Promise<{
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    uniqueCertificates: Set<string>;
    validationsBySource: Record<string, number>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const q = query(
        this.auditCollection,
        where('action', 'in', ['validated', 'validation_failed']),
        where('performedAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('performedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => doc.data() as CertificateAuditLog);
      
      const stats = {
        totalValidations: logs.length,
        successfulValidations: logs.filter(log => log.action === 'validated').length,
        failedValidations: logs.filter(log => log.action === 'validation_failed').length,
        uniqueCertificates: new Set(logs.map(log => log.certificateCode)),
        validationsBySource: {} as Record<string, number>
      };
      
      // Contar por fuente de validación
      logs.forEach(log => {
        const source = log.metadata?.validationSource || 'unknown';
        stats.validationsBySource[source] = (stats.validationsBySource[source] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting validation stats:', error);
      return {
        totalValidations: 0,
        successfulValidations: 0,
        failedValidations: 0,
        uniqueCertificates: new Set(),
        validationsBySource: {}
      };
    }
  }

  /**
   * Detecta actividad sospechosa en las validaciones
   */
  async detectSuspiciousActivity(hours: number = 24): Promise<{
    suspiciousIPs: string[];
    highFrequencyValidations: { ip: string; count: number }[];
    failedValidationSpikes: { ip: string; failedCount: number }[];
  }> {
    try {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);
      
      const q = query(
        this.auditCollection,
        where('action', 'in', ['validated', 'validation_failed']),
        where('performedAt', '>=', Timestamp.fromDate(startDate))
      );
      
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => doc.data() as CertificateAuditLog);
      
      // Agrupar por IP
      const ipActivity: Record<string, { total: number; failed: number }> = {};
      
      logs.forEach(log => {
        if (log.ipAddress) {
          if (!ipActivity[log.ipAddress]) {
            ipActivity[log.ipAddress] = { total: 0, failed: 0 };
          }
          ipActivity[log.ipAddress].total++;
          if (log.action === 'validation_failed') {
            ipActivity[log.ipAddress].failed++;
          }
        }
      });
      
      const suspiciousIPs: string[] = [];
      const highFrequencyValidations: { ip: string; count: number }[] = [];
      const failedValidationSpikes: { ip: string; failedCount: number }[] = [];
      
      Object.entries(ipActivity).forEach(([ip, activity]) => {
        // Más de 100 validaciones en 24 horas
        if (activity.total > 100) {
          highFrequencyValidations.push({ ip, count: activity.total });
          suspiciousIPs.push(ip);
        }
        
        // Más de 50 validaciones fallidas en 24 horas
        if (activity.failed > 50) {
          failedValidationSpikes.push({ ip, failedCount: activity.failed });
          suspiciousIPs.push(ip);
        }
        
        // Más del 80% de validaciones fallidas con al menos 20 intentos
        if (activity.total >= 20 && (activity.failed / activity.total) > 0.8) {
          suspiciousIPs.push(ip);
        }
      });
      
      return {
        suspiciousIPs: [...new Set(suspiciousIPs)],
        highFrequencyValidations,
        failedValidationSpikes
      };
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return {
        suspiciousIPs: [],
        highFrequencyValidations: [],
        failedValidationSpikes: []
      };
    }
  }

  /**
   * Obtiene actividad reciente del sistema
   */
  async getRecentActivity(limit: number = 50): Promise<CertificateAuditLog[]> {
    try {
      const q = query(
        this.auditCollection,
        orderBy('performedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CertificateAuditLog));
      
      return logs;
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
}
