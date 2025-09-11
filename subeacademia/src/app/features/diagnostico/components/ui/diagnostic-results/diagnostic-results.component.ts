import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { Report } from '../../../data/report.model';
import { DiagnosticsService } from '../../../services/diagnostics.service';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnostic-results.component.html',
  styleUrls: ['./diagnostic-results.component.css']
})
export class DiagnosticResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private diagnosticsService = inject(DiagnosticsService);
  public stateService = inject(DiagnosticStateService);

  report = signal<Report | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    console.log('DiagnosticResultsComponent initialized');
    
    // Primero intentar obtener el reporte del estado (flujo normal)
    const stateReport = this.stateService.generatedReport();
    console.log('State report:', stateReport);
    
    if (stateReport) {
      this.report.set(stateReport);
      this.isLoading.set(false);
      console.log('Report loaded from state');
    } else {
      // Si no hay reporte en el estado, intentar obtenerlo por ID
      const id = this.route.snapshot.paramMap.get('id');
      console.log('ID from route:', id);
      
      if (id) {
        this.diagnosticsService.getDiagnosticResult(id).then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            this.report.set(data['report'] as Report);
            console.log('Report loaded from Firebase');
          } else {
            console.error("No such document!");
          }
          this.isLoading.set(false);
        }).catch(error => {
          console.error("Error getting document:", error);
          this.isLoading.set(false);
        });
      } else {
        console.log('No ID and no state report, showing empty state');
        this.isLoading.set(false);
      }
    }
  }

  printReport() {
    window.print();
  }

  reloadPage() {
    window.location.reload();
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }
}