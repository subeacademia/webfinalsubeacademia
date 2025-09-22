import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DiagnosticsService } from '../diagnostico/services/diagnostics.service';
import { User } from '@angular/fire/auth';

interface UserDiagnostic {
  id: string;
  fecha: Date;
  puntajeGeneral: number;
  objetivo?: string;
  industria?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header del Dashboard -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span class="text-2xl">👤</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold">{{ user?.displayName || 'Usuario' }}</h1>
            <p class="text-blue-100">{{ user?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span class="text-blue-600 text-xl">📊</span>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Diagnósticos</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ diagnostics().length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <span class="text-green-600 text-xl">⭐</span>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Puntaje Promedio</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ averageScore | number:'1.0-1' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span class="text-purple-600 text-xl">📅</span>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Último Diagnóstico</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ lastDiagnosticDate | date:'shortDate' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Diagnósticos -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Historial de Diagnósticos</h2>
        </div>
        
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div *ngIf="diagnostics().length === 0" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            <span class="text-4xl mb-4 block">🔍</span>
            <p class="text-lg">No tienes diagnósticos aún</p>
            <p class="text-sm">Comienza tu primer diagnóstico para ver tus resultados aquí</p>
            <a routerLink="/es/diagnostico" 
               class="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Realizar Diagnóstico
            </a>
          </div>

          <div *ngFor="let diagnostic of diagnostics()" 
               class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <span class="text-2xl">📋</span>
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">
                      {{ diagnostic.objetivo || 'Diagnóstico General' }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ diagnostic.industria || 'Industria no especificada' }}
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">{{ diagnostic.puntajeGeneral }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">puntos</div>
                <div class="text-xs text-gray-400">{{ diagnostic.fecha | date:'shortDate' }}</div>
              </div>
            </div>
            
            <div class="mt-3 flex justify-end">
              <a [routerLink]="['/es/diagnostico/resultado', diagnostic.id]"
                 class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                Ver Detalles →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .dark :host {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly diagnosticsService = inject(DiagnosticsService);
  private readonly destroy$ = new Subject<void>();

  user: User | null = null;
  diagnostics = signal<UserDiagnostic[]>([]);
  isLoading = signal(false);
  averageScore: number = 0;
  lastDiagnosticDate: Date | null = null;

  ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        if (user) {
          this.loadDiagnostics(user.uid);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadDiagnostics(userId: string) {
    this.isLoading.set(true);
    try {
      this.diagnostics.set(await this.diagnosticsService.getDiagnosticsForUser(userId));
      this.calculateStats();
    } catch (error) {
      console.error('Error loading diagnostics', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private calculateStats(): void {
    if (this.diagnostics().length === 0) {
      this.averageScore = 0;
      this.lastDiagnosticDate = null;
      return;
    }

    // Calcular puntaje promedio
    const totalScore = this.diagnostics().reduce((sum, d) => sum + d.puntajeGeneral, 0);
    this.averageScore = totalScore / this.diagnostics().length;

    // Obtener fecha del último diagnóstico
    const sortedDiagnostics = [...this.diagnostics()].sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    this.lastDiagnosticDate = sortedDiagnostics[0].fecha;
  }
}
