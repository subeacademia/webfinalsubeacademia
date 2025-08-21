export interface HistoryEvent {
  id?: string;
  year: number;
  title: string;
  description: string;
  order?: number; // para controlar el orden manual
}


