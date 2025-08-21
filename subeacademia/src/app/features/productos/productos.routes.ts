import { Routes } from '@angular/router';
import { ProductosComponent } from './productos.component';
import { AsesoriasListComponent } from './components/asesorias-list.component';
import { CursosListComponent } from './components/cursos-list.component';
import { CertificacionesListComponent } from './components/certificaciones-list.component';
import { ProductoDetalleComponent } from './components/producto-detalle.component';
import { CertificateValidatorComponent } from './components/certificate-validator.component';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    component: ProductosComponent
  },
  {
    path: 'asesorias',
    component: AsesoriasListComponent
  },
  {
    path: 'cursos',
    component: CursosListComponent
  },
  {
    path: 'certificaciones',
    component: CertificacionesListComponent
  },
  {
    path: 'certificaciones/validar/:code',
    component: CertificateValidatorComponent
  },
  {
    path: ':slug',
    component: ProductoDetalleComponent
  }
];
