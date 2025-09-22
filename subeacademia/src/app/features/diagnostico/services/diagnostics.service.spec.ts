import { TestBed } from '@angular/core/testing';
import { DiagnosticsService } from './diagnostics.service';
import { VercelAiService } from '../../../core/ai/vercel-ai.service';
import { LeadsService } from '../../../core/services/leads.service';
import { ToastService } from '../../../core/services/ui/toast/toast.service';
import { Firestore } from '@angular/fire/firestore';
import { DiagnosticData, UserLead } from '../data/diagnostic.models';
import { Report, ReportData } from '../data/report.model';

describe('DiagnosticsService', () => {
  let service: DiagnosticsService;
  let mockVercelAiService: jasmine.SpyObj<VercelAiService>;
  let mockLeadsService: jasmine.SpyObj<LeadsService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockFirestore: jasmine.SpyObj<Firestore>;

  beforeEach(() => {
    // Create spies for dependencies
    mockVercelAiService = jasmine.createSpyObj('VercelAiService', ['generateComprehensiveReport']);
    mockLeadsService = jasmine.createSpyObj('LeadsService', ['saveLead']);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);
    mockFirestore = jasmine.createSpyObj('Firestore', ['collection', 'addDoc']);

    TestBed.configureTestingModule({
      providers: [
        DiagnosticsService,
        { provide: VercelAiService, useValue: mockVercelAiService },
        { provide: LeadsService, useValue: mockLeadsService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Firestore, useValue: mockFirestore }
      ]
    });

    service = TestBed.inject(DiagnosticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateReport', () => {
    it('should generate report successfully with valid data', async () => {
      // Arrange
      const mockDiagnosticData = {
        contexto: { industry: 'Tech', role: 'Manager' },
        competencias: { q1: { value: 4 } },
        ares: { q2: { value: 3 } },
        objetivo: { objetivo: ['Improve AI adoption'] }
      };

      const mockReportData: ReportData = {
        id: 'test-report-1',
        timestamp: new Date(),
        leadInfo: {
          name: 'Test User',
          email: 'test@example.com',
          companyName: 'Test Company'
        },
        contexto: mockDiagnosticData,
        aresScores: { 'Agilidad': 75 },
        competencyScores: [{ id: 'comp1', name: 'Test Competency', score: 80 }],
        companyContext: {
          industry: 'Tech',
          size: 'Medium',
          mainObjective: 'Improve AI adoption'
        },
        aiMaturity: {
          level: 'Establecido',
          score: 75,
          summary: 'Good progress in AI maturity'
        },
        executiveSummary: 'Test executive summary',
        strengthsAnalysis: [],
        weaknessesAnalysis: [],
        insights: [],
        actionPlan: [],
        generatedAt: new Date(),
        version: '3.0.0'
      };

      mockVercelAiService.generateComprehensiveReport.and.returnValue(Promise.resolve(mockReportData));

      // Act
      const result = await service.generateReport(mockDiagnosticData);

      // Assert
      expect(result).toBe(mockReportData);
      expect(mockVercelAiService.generateComprehensiveReport).toHaveBeenCalledWith(mockDiagnosticData);
      expect(service.getCurrentReport()).toBe(mockReportData);
    });

    it('should handle missing required data gracefully', async () => {
      // Arrange
      const incompleteDiagnosticData = {
        contexto: null,
        competencias: null
      };

      // Act
      const result = await service.generateReport(incompleteDiagnosticData);

      // Assert
      expect(result).toBeNull();
      expect(mockVercelAiService.generateComprehensiveReport).not.toHaveBeenCalled();
    });

    it('should generate emergency report when AI service fails', async () => {
      // Arrange
      const mockDiagnosticData = {
        contexto: { industry: 'Tech', role: 'Manager' },
        competencias: { q1: { value: 4 } },
        ares: { q2: { value: 3 } },
        objetivo: { objetivo: ['Improve AI adoption'] },
        lead: {
          name: 'Test User',
          email: 'test@example.com',
          companyName: 'Test Company'
        }
      };

      mockVercelAiService.generateComprehensiveReport.and.returnValue(Promise.reject(new Error('AI Service Error')));

      // Act
      const result = await service.generateReport(mockDiagnosticData);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toContain('emergency-');
      expect(result?.version).toBe('3.0.0-emergency');
      expect(result?.aiMaturity.level).toBe('En Desarrollo');
    });

    it('should return null when both AI and emergency report fail', async () => {
      // Arrange
      const mockDiagnosticData = {
        contexto: { industry: 'Tech', role: 'Manager' },
        competencias: { q1: { value: 4 } }
      };

      mockVercelAiService.generateComprehensiveReport.and.returnValue(Promise.reject(new Error('AI Service Error')));
      
      // Spy on the private generateEmergencyReport method by making it throw
      spyOn<any>(service, 'generateEmergencyReport').and.throwError('Emergency generation failed');

      // Act
      const result = await service.generateReport(mockDiagnosticData);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getCurrentReport', () => {
    it('should return null initially', () => {
      // Act
      const result = service.getCurrentReport();

      // Assert
      expect(result).toBeNull();
    });

    it('should return the current report after setting it', () => {
      // Arrange
      const mockReport: ReportData = {
        id: 'test-report',
        timestamp: new Date(),
        leadInfo: { name: 'Test', email: 'test@test.com', companyName: 'Test Co' },
        contexto: {},
        aresScores: {},
        competencyScores: [],
        companyContext: { industry: 'Tech', size: 'Small', mainObjective: 'Test' },
        aiMaturity: { level: 'Incipiente', score: 25, summary: 'Test' },
        executiveSummary: 'Test summary',
        strengthsAnalysis: [],
        weaknessesAnalysis: [],
        insights: [],
        actionPlan: [],
        generatedAt: new Date(),
        version: '3.0.0'
      };

      // Act
      service.setCurrentReport(mockReport);
      const result = service.getCurrentReport();

      // Assert
      expect(result).toBe(mockReport);
    });
  });

  describe('saveDiagnosticWithLead', () => {
    it('should save diagnostic with lead successfully', async () => {
      // Arrange
      const mockDiagnosticData: DiagnosticData = {
        lead: {
          name: 'Test User',
          email: 'test@example.com',
          type: 'empresa',
          companyName: 'Test Company'
        } as UserLead,
        contexto: { industry: 'Tech' },
        competencias: {},
        ares: {},
        objetivo: { objetivo: ['Test objective'] }
      };

      const mockReport: Report = {
        titulo: 'Test Report',
        resumen: 'Test summary',
        analisisCompetencias: [],
        identificacionBrechas: 'Test gaps',
        planDeAccion: [],
        recomendacionesGenerales: 'Test recommendations',
        alineacionObjetivos: 'Test alignment'
      };

      mockLeadsService.saveLead.and.returnValue(Promise.resolve('lead-123'));
      spyOn(service, 'saveDiagnosticResult').and.returnValue(Promise.resolve('diagnostic-456'));

      // Act
      const result = await service.saveDiagnosticWithLead(mockDiagnosticData, mockReport);

      // Assert
      expect(result).toBe('lead-123');
      expect(mockLeadsService.saveLead).toHaveBeenCalledWith(
        mockDiagnosticData.lead,
        mockDiagnosticData,
        'diagnostico_empresa'
      );
      expect(service.saveDiagnosticResult).toHaveBeenCalledWith(mockDiagnosticData, mockReport);
    });

    it('should throw error when no lead data provided', async () => {
      // Arrange
      const mockDiagnosticData: DiagnosticData = {
        lead: null,
        contexto: { industry: 'Tech' },
        competencias: {},
        ares: {},
        objetivo: { objetivo: ['Test objective'] }
      } as any;

      const mockReport: Report = {
        titulo: 'Test Report',
        resumen: 'Test summary',
        analisisCompetencias: [],
        identificacionBrechas: 'Test gaps',
        planDeAccion: [],
        recomendacionesGenerales: 'Test recommendations',
        alineacionObjetivos: 'Test alignment'
      };

      // Act & Assert
      await expectAsync(service.saveDiagnosticWithLead(mockDiagnosticData, mockReport))
        .toBeRejectedWithError('No se encontraron datos del lead en el diagnóstico');
      
      expect(mockToastService.show).toHaveBeenCalledWith(
        'error',
        'Error al Guardar: No se pudo guardar tu diagnóstico. Por favor, intenta nuevamente.'
      );
    });

    it('should handle save errors and show toast', async () => {
      // Arrange
      const mockDiagnosticData: DiagnosticData = {
        lead: {
          name: 'Test User',
          email: 'test@example.com',
          type: 'empresa'
        } as UserLead,
        contexto: { industry: 'Tech' },
        competencias: {},
        ares: {},
        objetivo: { objetivo: ['Test objective'] }
      };

      const mockReport: Report = {
        titulo: 'Test Report',
        resumen: 'Test summary',
        analisisCompetencias: [],
        identificacionBrechas: 'Test gaps',
        planDeAccion: [],
        recomendacionesGenerales: 'Test recommendations',
        alineacionObjetivos: 'Test alignment'
      };

      mockLeadsService.saveLead.and.returnValue(Promise.reject(new Error('Save failed')));

      // Act & Assert
      await expectAsync(service.saveDiagnosticWithLead(mockDiagnosticData, mockReport))
        .toBeRejectedWithError('Save failed');
      
      expect(mockToastService.show).toHaveBeenCalledWith(
        'error',
        'Error al Guardar: No se pudo guardar tu diagnóstico. Por favor, intenta nuevamente.'
      );
    });
  });
});
