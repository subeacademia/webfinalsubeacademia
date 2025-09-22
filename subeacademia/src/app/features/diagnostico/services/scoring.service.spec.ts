import { TestBed } from '@angular/core/testing';
import { ScoringService } from './scoring.service';
import { Question, Answer, AresPillar, AresPhase, RiskLevel } from '../data/diagnostic.models';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('computeAresScores', () => {
    it('should calculate ARES score correctly with valid data', () => {
      // Arrange
      const mockQuestions: Question[] = [
        {
          id: 'q1',
          text: 'Test question 1',
          pillar: 'Agilidad',
          subarea: 'Cultura',
          phase: 'Preparación',
          critical: false,
          cluster: 'test',
          comp: 'test'
        },
        {
          id: 'q2',
          text: 'Test question 2',
          pillar: 'Responsabilidad y Ética',
          subarea: 'Gobernanza',
          phase: 'Diseño',
          critical: false,
          cluster: 'test',
          comp: 'test'
        },
        {
          id: 'q3',
          text: 'Test question 3',
          pillar: 'Sostenibilidad',
          subarea: 'Impacto',
          phase: 'Desarrollo',
          critical: true,
          cluster: 'test',
          comp: 'test'
        }
      ];

      const mockAnswers: Record<string, Answer> = {
        'q1': { value: 4 },
        'q2': { value: 3 },
        'q3': { value: 5 }
      };

      // Act
      const result = service.computeAresScores(mockQuestions, mockAnswers);

      // Assert
      expect(result).toBeDefined();
      expect(result.byPillar['Agilidad']).toBe(4);
      expect(result.byPillar['Responsabilidad y Ética']).toBe(3);
      expect(result.byPillar['Sostenibilidad']).toBe(5);
      expect(result.bySubarea['Cultura']).toBe(4);
      expect(result.bySubarea['Gobernanza']).toBe(3);
      expect(result.bySubarea['Impacto']).toBe(5);
      expect(result.byPhase['Preparación']).toBe(4);
      expect(result.byPhase['Diseño']).toBe(3);
      expect(result.byPhase['Desarrollo']).toBe(5);
      expect(result.general).toBe(4); // (4+3+5)/3 = 4
      expect(result.gatingStatus).toBe('OK'); // Critical question has value 5 >= 3
    });

    it('should handle missing or partial data gracefully', () => {
      // Arrange
      const mockQuestions: Question[] = [
        {
          id: 'q1',
          text: 'Test question 1',
          pillar: 'Agilidad',
          subarea: 'Cultura',
          phase: 'Preparación',
          critical: false,
          cluster: 'test',
          comp: 'test'
        },
        {
          id: 'q2',
          text: 'Test question 2',
          pillar: 'Responsabilidad y Ética',
          subarea: 'Gobernanza',
          phase: 'Diseño',
          critical: true,
          cluster: 'test',
          comp: 'test'
        }
      ];

      // Only partial answers provided
      const mockAnswers: Record<string, Answer> = {
        'q1': { value: 4 }
        // q2 is missing - this is a critical question
      };

      // Act
      const result = service.computeAresScores(mockQuestions, mockAnswers);

      // Assert
      expect(result).toBeDefined();
      expect(result.byPillar['Agilidad']).toBe(4);
      expect(result.byPillar['Responsabilidad y Ética']).toBe(0); // No answers for this pillar
      expect(result.byPillar['Sostenibilidad']).toBe(0);
      expect(result.general).toBe(4); // Only q1 answered
      expect(result.gatingStatus).toBe('Bloquea≥3'); // Critical question not answered
    });

    it('should return zero scores when no answers provided', () => {
      // Arrange
      const mockQuestions: Question[] = [
        {
          id: 'q1',
          text: 'Test question 1',
          pillar: 'Agilidad',
          subarea: 'Cultura',
          phase: 'Preparación',
          critical: false,
          cluster: 'test',
          comp: 'test'
        }
      ];

      const emptyAnswers: Record<string, Answer> = {};

      // Act
      const result = service.computeAresScores(mockQuestions, emptyAnswers);

      // Assert
      expect(result).toBeDefined();
      expect(result.byPillar['Agilidad']).toBe(0);
      expect(result.byPillar['Responsabilidad y Ética']).toBe(0);
      expect(result.byPillar['Sostenibilidad']).toBe(0);
      expect(result.general).toBe(0);
      expect(result.gatingStatus).toBe('SIN_DATOS');
    });
  });

  describe('computeCompScores', () => {
    it('should calculate competency scores correctly', () => {
      // Arrange
      const mockQuestions: Question[] = [
        {
          id: 'q1',
          text: 'Test question 1',
          pillar: 'Agilidad',
          subarea: 'test',
          phase: 'Preparación',
          critical: false,
          cluster: 'Cluster A',
          comp: 'Competencia 1'
        },
        {
          id: 'q2',
          text: 'Test question 2',
          pillar: 'Agilidad',
          subarea: 'test',
          phase: 'Preparación',
          critical: false,
          cluster: 'Cluster A',
          comp: 'Competencia 2'
        },
        {
          id: 'q3',
          text: 'Test question 3',
          pillar: 'Agilidad',
          subarea: 'test',
          phase: 'Preparación',
          critical: true,
          cluster: 'Cluster B',
          comp: 'Competencia 1'
        }
      ];

      const mockAnswers: Record<string, Answer> = {
        'q1': { value: 4 },
        'q2': { value: 2 },
        'q3': { value: 5 }
      };

      // Act
      const result = service.computeCompScores(mockQuestions, mockAnswers);

      // Assert
      expect(result).toBeDefined();
      expect(result.byCluster['Cluster A']).toBe(3); // (4+2)/2 = 3
      expect(result.byCluster['Cluster B']).toBe(5);
      expect(result.byCompetency['Competencia 1']).toBe(4.5); // (4+5)/2 = 4.5
      expect(result.byCompetency['Competencia 2']).toBe(2);
      expect(result.general).toBe(3.67); // (4+2+5)/3 = 3.67 rounded
      expect(result.gatingStatus).toBe('OK'); // Critical question has value 5 >= 3
    });

    it('should handle empty competency data gracefully', () => {
      // Arrange
      const mockQuestions: Question[] = [
        {
          id: 'q1',
          text: 'Test question 1',
          pillar: 'Agilidad',
          subarea: 'test',
          phase: 'Preparación',
          critical: false,
          cluster: 'Cluster A',
          comp: 'Competencia 1'
        }
      ];

      const emptyAnswers: Record<string, Answer> = {};

      // Act
      const result = service.computeCompScores(mockQuestions, emptyAnswers);

      // Assert
      expect(result).toBeDefined();
      expect(result.byCluster['Cluster A']).toBe(0);
      expect(result.byCompetency['Competencia 1']).toBe(0);
      expect(result.general).toBe(0);
      expect(result.gatingStatus).toBe('SIN_DATOS');
    });
  });

  describe('applyRiskWeighting', () => {
    it('should apply risk weighting correctly for high risk', () => {
      // Arrange
      const mockAresScores = {
        byPillar: {
          'Agilidad': 4,
          'Responsabilidad y Ética': 3,
          'Sostenibilidad': 2
        },
        bySubarea: {},
        byPhase: {},
        general: 3,
        gatingStatus: 'OK' as const
      };

      // Act
      const result = service.applyRiskWeighting(mockAresScores, 'Alto');

      // Assert
      expect(result).toBeDefined();
      expect(result.generalWeighted).toBe(2.75); // 0.25*4 + 0.50*3 + 0.25*2 = 1 + 1.5 + 0.5 = 3
    });

    it('should return original score when no risk level provided', () => {
      // Arrange
      const mockAresScores = {
        byPillar: {
          'Agilidad': 4,
          'Responsabilidad y Ética': 3,
          'Sostenibilidad': 2
        },
        bySubarea: {},
        byPhase: {},
        general: 3,
        gatingStatus: 'OK' as const
      };

      // Act
      const result = service.applyRiskWeighting(mockAresScores, undefined as any);

      // Assert
      expect(result).toBeDefined();
      expect(result.generalWeighted).toBe(3); // Should equal original general score
    });
  });

  describe('composite', () => {
    it('should calculate composite score correctly', () => {
      // Arrange
      const aresWeighted = 3.5;
      const comp = 4.0;
      const lambdaComp = 0.6;

      // Act
      const result = service.composite(aresWeighted, comp, lambdaComp);

      // Assert
      // Expected: (1-0.6)*3.5 + 0.6*4.0 = 0.4*3.5 + 0.6*4.0 = 1.4 + 2.4 = 3.8
      expect(result).toBe(3.8);
    });

    it('should handle zero values gracefully', () => {
      // Arrange
      const aresWeighted = 0;
      const comp = 0;
      const lambdaComp = 0.5;

      // Act
      const result = service.composite(aresWeighted, comp, lambdaComp);

      // Assert
      expect(result).toBe(0);
    });
  });
});
