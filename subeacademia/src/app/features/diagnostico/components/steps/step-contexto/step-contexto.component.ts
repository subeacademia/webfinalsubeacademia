import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScrollService } from '../../../../../core/services/scroll/scroll.service';

@Component({
  selector: 'app-step-contexto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 md:p-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Tu Contexto Profesional</h2>
      <form [formGroup]="form" (ngSubmit)="next()">
        <div class="space-y-4">
          <div>
            <label for="rol" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tu Rol o Posición</label>
            <input type="text" id="rol" formControlName="rol" placeholder="Ej: Gerente de Marketing, Director de TI, CEO" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="industria" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Industria o Sector</label>
            <select id="industria" formControlName="industria" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Selecciona una industria</option>
              
              <!-- Tecnología e Innovación -->
              <optgroup label="💻 Tecnología e Innovación">
                <option value="Software y Desarrollo">Software y Desarrollo</option>
                <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                <option value="Ciberseguridad">Ciberseguridad</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Telecomunicaciones">Telecomunicaciones</option>
                <option value="Fintech">Fintech</option>
                <option value="EdTech">EdTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="PropTech">PropTech</option>
                <option value="Gaming y Entretenimiento Digital">Gaming y Entretenimiento Digital</option>
                <option value="IoT y Dispositivos Inteligentes">IoT y Dispositivos Inteligentes</option>
              </optgroup>
              
              <!-- Servicios Financieros -->
              <optgroup label="🏦 Servicios Financieros">
                <option value="Banca Comercial">Banca Comercial</option>
                <option value="Banca de Inversión">Banca de Inversión</option>
                <option value="Seguros">Seguros</option>
                <option value="Gestión de Activos">Gestión de Activos</option>
                <option value="Consultoría Financiera">Consultoría Financiera</option>
                <option value="Servicios de Pago">Servicios de Pago</option>
                <option value="Crowdfunding">Crowdfunding</option>
                <option value="Blockchain y Criptomonedas">Blockchain y Criptomonedas</option>
              </optgroup>
              
              <!-- Salud y Farmacéutica -->
              <optgroup label="🏥 Salud y Farmacéutica">
                <option value="Hospitales y Clínicas">Hospitales y Clínicas</option>
                <option value="Farmacéutica">Farmacéutica</option>
                <option value="Dispositivos Médicos">Dispositivos Médicos</option>
                <option value="Telemedicina">Telemedicina</option>
                <option value="Biotecnología">Biotecnología</option>
                <option value="Laboratorios">Laboratorios</option>
                <option value="Salud Mental">Salud Mental</option>
                <option value="Odontología">Odontología</option>
                <option value="Veterinaria">Veterinaria</option>
              </optgroup>
              
              <!-- Educación -->
              <optgroup label="🎓 Educación">
                <option value="Educación Básica">Educación Básica</option>
                <option value="Educación Superior">Educación Superior</option>
                <option value="Educación Técnica">Educación Técnica</option>
                <option value="Capacitación Corporativa">Capacitación Corporativa</option>
                <option value="E-learning">E-learning</option>
                <option value="Investigación Académica">Investigación Académica</option>
                <option value="Educación Especial">Educación Especial</option>
              </optgroup>
              
              <!-- Retail y E-commerce -->
              <optgroup label="🛍️ Retail y E-commerce">
                <option value="Retail Tradicional">Retail Tradicional</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Marketplace">Marketplace</option>
                <option value="Moda y Textiles">Moda y Textiles</option>
                <option value="Electrónicos">Electrónicos</option>
                <option value="Supermercados">Supermercados</option>
                <option value="Farmacias">Farmacias</option>
                <option value="Lujo">Lujo</option>
                <option value="Outlet y Liquidaciones">Outlet y Liquidaciones</option>
              </optgroup>
              
              <!-- Manufactura e Industrial -->
              <optgroup label="🏭 Manufactura e Industrial">
                <option value="Automotriz">Automotriz</option>
                <option value="Aeroespacial">Aeroespacial</option>
                <option value="Alimentaria">Alimentaria</option>
                <option value="Química">Química</option>
                <option value="Textil">Textil</option>
                <option value="Metalurgia">Metalurgia</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Farmacéutica Industrial">Farmacéutica Industrial</option>
                <option value="Construcción">Construcción</option>
                <option value="Energía">Energía</option>
              </optgroup>
              
              <!-- Servicios Profesionales -->
              <optgroup label="💼 Servicios Profesionales">
                <option value="Consultoría de Negocios">Consultoría de Negocios</option>
                <option value="Consultoría Tecnológica">Consultoría Tecnológica</option>
                <option value="Marketing y Publicidad">Marketing y Publicidad</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Legal">Legal</option>
                <option value="Contabilidad">Contabilidad</option>
                <option value="Arquitectura e Ingeniería">Arquitectura e Ingeniería</option>
                <option value="Diseño">Diseño</option>
                <option value="Traducción e Interpretación">Traducción e Interpretación</option>
              </optgroup>
              
              <!-- Medios y Entretenimiento -->
              <optgroup label="🎬 Medios y Entretenimiento">
                <option value="Televisión">Televisión</option>
                <option value="Radio">Radio</option>
                <option value="Cine">Cine</option>
                <option value="Música">Música</option>
                <option value="Editorial">Editorial</option>
                <option value="Deportes">Deportes</option>
                <option value="Eventos">Eventos</option>
                <option value="Streaming">Streaming</option>
                <option value="Podcasting">Podcasting</option>
              </optgroup>
              
              <!-- Logística y Transporte -->
              <optgroup label="🚚 Logística y Transporte">
                <option value="Transporte Terrestre">Transporte Terrestre</option>
                <option value="Transporte Marítimo">Transporte Marítimo</option>
                <option value="Transporte Aéreo">Transporte Aéreo</option>
                <option value="Logística">Logística</option>
                <option value="Mensajería">Mensajería</option>
                <option value="E-commerce Logística">E-commerce Logística</option>
                <option value="Almacenamiento">Almacenamiento</option>
              </optgroup>
              
              <!-- Inmobiliaria y Construcción -->
              <optgroup label="🏠 Inmobiliaria y Construcción">
                <option value="Desarrollo Inmobiliario">Desarrollo Inmobiliario</option>
                <option value="Construcción Residencial">Construcción Residencial</option>
                <option value="Construcción Comercial">Construcción Comercial</option>
                <option value="Inmobiliaria Comercial">Inmobiliaria Comercial</option>
                <option value="Inmobiliaria Residencial">Inmobiliaria Residencial</option>
                <option value="Arquitectura">Arquitectura</option>
                <option value="Ingeniería Civil">Ingeniería Civil</option>
              </optgroup>
              
              <!-- Agricultura y Alimentación -->
              <optgroup label="🌾 Agricultura y Alimentación">
                <option value="Agricultura">Agricultura</option>
                <option value="Ganadería">Ganadería</option>
                <option value="Pesca">Pesca</option>
                <option value="Procesamiento de Alimentos">Procesamiento de Alimentos</option>
                <option value="Restaurantes">Restaurantes</option>
                <option value="Hotelería">Hotelería</option>
                <option value="Turismo">Turismo</option>
                <option value="AgroTech">AgroTech</option>
              </optgroup>
              
              <!-- Energía y Sostenibilidad -->
              <optgroup label="⚡ Energía y Sostenibilidad">
                <option value="Petróleo y Gas">Petróleo y Gas</option>
                <option value="Energías Renovables">Energías Renovables</option>
                <option value="Energía Nuclear">Energía Nuclear</option>
                <option value="Eficiencia Energética">Eficiencia Energética</option>
                <option value="Medio Ambiente">Medio Ambiente</option>
                <option value="Sostenibilidad">Sostenibilidad</option>
                <option value="Reciclaje">Reciclaje</option>
              </optgroup>
              
              <!-- Gobierno y Sector Público -->
              <optgroup label="🏛️ Gobierno y Sector Público">
                <option value="Gobierno Central">Gobierno Central</option>
                <option value="Gobierno Local">Gobierno Local</option>
                <option value="Organismos Internacionales">Organismos Internacionales</option>
                <option value="Fuerzas Armadas">Fuerzas Armadas</option>
                <option value="Policía y Seguridad">Policía y Seguridad</option>
                <option value="Justicia">Justicia</option>
                <option value="Salud Pública">Salud Pública</option>
              </optgroup>
              
              <!-- ONG y Sector Social -->
              <optgroup label="🤝 ONG y Sector Social">
                <option value="Fundaciones">Fundaciones</option>
                <option value="Organizaciones No Gubernamentales">Organizaciones No Gubernamentales</option>
                <option value="Cooperativas">Cooperativas</option>
                <option value="Asociaciones">Asociaciones</option>
                <option value="Voluntariado">Voluntariado</option>
                <option value="Microfinanzas">Microfinanzas</option>
              </optgroup>
              
              <!-- Otros -->
              <optgroup label="🔧 Otros">
                <option value="Startup">Startup</option>
                <option value="Scale-up">Scale-up</option>
                <option value="Freelance/Independiente">Freelance/Independiente</option>
              <option value="Otro">Otro</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label for="area" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Área o Departamento</label>
            <input type="text" id="area" formControlName="area" placeholder="Ej: Marketing, Ventas, RRHH, IT" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="equipo" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamaño de la empresa</label>
            <select id="equipo" formControlName="equipo" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Selecciona el tamaño</option>
              <option value="1-10">1-10 empleados (Startup/Micro)</option>
              <option value="11-50">11-50 empleados (Pequeña)</option>
              <option value="51-200">51-200 empleados (Mediana)</option>
              <option value="201-500">201-500 empleados (Mediana-Grande)</option>
              <option value="501-1000">501-1000 empleados (Grande)</option>
              <option value="1001-5000">1001-5000 empleados (Corporación)</option>
              <option value="5001+">Más de 5000 empleados (Multinacional)</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button type="submit" 
                  [disabled]="form.invalid" 
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            Continuar
          </button>
        </div>
      </form>
    </div>
  `
})
export class StepContextoComponent {
  private fb = inject(FormBuilder);
  private diagnosticState = inject(DiagnosticStateService);
  private router = inject(Router);
  private scrollService = inject(ScrollService);

  form = this.fb.group({
    rol: ['', Validators.required],
    industria: ['', Validators.required],
    area: ['', Validators.required],
    equipo: ['', Validators.required]
  });

  constructor() {
    const currentContexto = this.diagnosticState.state().contexto;
    if (currentContexto) {
      this.form.patchValue(currentContexto);
    }
  }

  next() {
    console.log('next() called, form valid:', this.form.valid);
    console.log('Current URL before navigation:', this.router.url);
    if (this.form.valid) {
      console.log('Form is valid, updating data and navigating to ares');
      this.diagnosticState.updateData({ contexto: this.form.value as any });
      
      // Navegación con prefijo de idioma detectado
      const currentUrl = this.router.url;
      const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
      console.log('Detected language prefix:', languagePrefix);
      console.log('Attempting navigation to:', `/${languagePrefix}/diagnostico/ares`);
      
      this.router.navigate([`/${languagePrefix}/diagnostico/ares`]).then(success => {
        console.log('Navigation success:', success);
        console.log('URL after navigation:', this.router.url);
        
        // Hacer scroll automático hacia arriba después de la navegación
        setTimeout(() => {
          this.scrollService.scrollToTopForDiagnostic();
        }, 200);
      }).catch(error => {
        console.error('Navigation error:', error);
      });
    } else {
      console.log('Form is invalid, marking as touched');
      this.form.markAllAsTouched();
    }
  }
}