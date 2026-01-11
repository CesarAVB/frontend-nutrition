import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Paciente } from '../models/paciente.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/api/v1/pacientes';

  getAll() {
    return this.http.get<Paciente[]>(this.apiUrl);
  }
}
