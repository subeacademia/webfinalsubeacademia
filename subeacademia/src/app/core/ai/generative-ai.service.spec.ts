import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GenerativeAiService } from './generative-ai.service';
import { VercelAiService } from './vercel-ai.service';
import { ToastService } from '../services/ui/toast/toast.service';

describe('GenerativeAiService', () => {
  let service: GenerativeAiService;
  let httpMock: HttpTestingController;
  let mockVercelAiService: jasmine.SpyObj<VercelAiService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    // Create spies for dependencies
    mockVercelAiService = jasmine.createSpyObj('VercelAiService', ['generateReport']);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GenerativeAiService,
        { provide: VercelAiService, useValue: mockVercelAiService },
        { provide: ToastService, useValue: mockToastService }
      ]
    });

    service = TestBed.inject(GenerativeAiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateText', () => {
    it('should return generated text on successful API call', async () => {
      // Arrange
      const testPrompt = 'Generate a test response';
      const mockResponse = {
        choices: [{
          message: {
            content: 'This is a generated response'
          }
        }]
      };

      // Act
      const resultPromise = service.generateText(testPrompt);

      // Assert
      const req = httpMock.expectOne('https://apisube-smoky.vercel.app/api/azure/generate');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.messages).toBeDefined();
      expect(req.request.body.messages.length).toBe(2);
      expect(req.request.body.messages[0].role).toBe('system');
      expect(req.request.body.messages[1].role).toBe('user');

      req.flush(mockResponse);

      const result = await resultPromise;
      expect(result).toBe('This is a generated response');
    });

    it('should show error toast and throw error on failed API call', async () => {
      // Arrange
      const testPrompt = 'Generate a test response';
      const errorResponse = { status: 500, statusText: 'Internal Server Error' };

      // Act & Assert
      const resultPromise = service.generateText(testPrompt);

      const req = httpMock.expectOne('https://apisube-smoky.vercel.app/api/azure/generate');
      req.flush('Server Error', errorResponse);

      try {
        await resultPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(mockToastService.show).toHaveBeenCalledWith(
          'error',
          'Error de IA',
          'No se pudo generar la respuesta. Por favor, intenta de nuevo.'
        );
      }
    });

    it('should handle malformed API response', async () => {
      // Arrange
      const testPrompt = 'Generate a test response';
      const malformedResponse = { invalid: 'response' };

      // Act & Assert
      const resultPromise = service.generateText(testPrompt);

      const req = httpMock.expectOne('https://apisube-smoky.vercel.app/api/azure/generate');
      req.flush(malformedResponse);

      try {
        await resultPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(mockToastService.show).toHaveBeenCalled();
      }
    });
  });

  describe('generateBusinessObjectives', () => {
    it('should return parsed objectives on successful API call', async () => {
      // Arrange
      const industry = 'Technology';
      const companySize = 'Medium';
      const mockResponse = {
        choices: [{
          message: {
            content: '["Objective 1", "Objective 2", "Objective 3"]'
          }
        }]
      };

      // Act
      const resultPromise = service.generateBusinessObjectives(industry, companySize);

      // Assert
      const req = httpMock.expectOne('https://apisube-smoky.vercel.app/api/azure/generate');
      expect(req.request.method).toBe('POST');
      
      req.flush(mockResponse);

      const result = await resultPromise;
      expect(result).toEqual(['Objective 1', 'Objective 2', 'Objective 3']);
    });

    it('should return fallback objectives on API failure', async () => {
      // Arrange
      const industry = 'Technology';
      const companySize = 'Medium';
      const errorResponse = { status: 500, statusText: 'Internal Server Error' };

      // Act
      const resultPromise = service.generateBusinessObjectives(industry, companySize);

      const req = httpMock.expectOne('https://apisube-smoky.vercel.app/api/azure/generate');
      req.flush('Server Error', errorResponse);

      const result = await resultPromise;

      // Assert - should return fallback objectives
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toContain('Technology'); // Should include the industry in fallback
    });

    it('should handle malformed JSON response gracefully', async () => {
      // Arrange
      const industry = 'Technology';
      const companySize = 'Medium';
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      // Act
      const resultPromise = service.generateBusinessObjectives(industry, companySize);

      const req = httpMock.expectOne('https://apisube-smoky.vercel.app/api/azure/generate');
      req.flush(mockResponse);

      const result = await resultPromise;

      // Assert - should return fallback objectives
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });
  });

  describe('generateDiagnosticAnalysis', () => {
    it('should delegate to VercelAiService correctly', async () => {
      // Arrange
      const mockData = {
        profile: {
          industry: 'Technology',
          role: 'Manager',
          objective: 'Improve efficiency'
        },
        aresAnswers: { q1: { value: 4 } },
        compAnswers: { c1: { value: 3 } }
      };
      const mockContext = { courses: [] };
      const expectedResult = { report: 'generated' };

      mockVercelAiService.generateReport.and.returnValue(Promise.resolve(expectedResult));

      // Act
      const result = await service.generateDiagnosticAnalysis(mockData, mockContext);

      // Assert
      expect(mockVercelAiService.generateReport).toHaveBeenCalledWith(mockData, mockContext);
      expect(result).toBe(expectedResult);
    });

    it('should handle VercelAiService errors', async () => {
      // Arrange
      const mockData = {
        profile: {
          industry: 'Technology',
          role: 'Manager',
          objective: 'Improve efficiency'
        },
        aresAnswers: { q1: { value: 4 } },
        compAnswers: { c1: { value: 3 } }
      };
      const mockContext = { courses: [] };

      mockVercelAiService.generateReport.and.returnValue(Promise.reject(new Error('Service error')));

      // Act & Assert
      try {
        await service.generateDiagnosticAnalysis(mockData, mockContext);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(mockVercelAiService.generateReport).toHaveBeenCalledWith(mockData, mockContext);
      }
    });
  });
});
