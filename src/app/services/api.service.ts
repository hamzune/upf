import { Injectable } from '@angular/core';
import { RequestService } from '../services/request.service';
import { ParserHtmlService } from '../services/parser-html.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private request: RequestService, private parser: ParserHtmlService) { }

  public InicioPubHora(filters) {
    return new Promise((resolve, reject) => {
      this.request
        .get('/pds/consultaPublica/look[conpub]InicioPubHora',
          this.parseFilters(Object.assign({ rnd: (Math.round(Math.random() * 10000)).toString() }, filters)), {})
        .then((html: string) => this.parser.parseHTML(html))
        .then(combos => resolve(combos))
        .catch(err => reject(err));
    });
  }
  
  public ActualizarCombosPubHora(filters) {
    return new Promise((resolve, reject) => {
      this.request
        .post('/pds/consultaPublica/look[conpub]ActualizarCombosPubHora',
          this.parseFilters(Object.assign({ rnd: (Math.round(Math.random() * 10000)).toString() }, filters)), {
          'Content-Type': 'application/x-www-form-urlencoded'
        })
        .then((html: string) => this.parser.parseHTML(html))
        .then(combos => resolve(combos))
        .catch(err => reject(err));
    });
  }

  public MostrarPubHora(filters) {
    return new Promise((resolve, reject) => {
      this.request
        .post('/pds/consultaPublica/look[conpub]MostrarPubHora',
          this.parseFilters(Object.assign({ rnd: (Math.round(Math.random() * 10000)).toString() }, filters)), {
          'Content-Type': 'application/x-www-form-urlencoded'
        })
        .then(resp => resolve(resp))
        .catch(err => reject(err));
    });
  }

  public selecionarRangoHorarios(filters) {
    return new Promise((resolve, reject) => {
      this.request
        .get('/pds/consultaPublica/[Ajax]selecionarRangoHorarios',
          Object.assign({ rnd: (Math.round(Math.random() * 10000)).toString() }, filters), {})
        .then(resp => this.checkResponse(resp))
        .then(json => resolve(json))
        .catch(err => reject(err));
    });
  }

  private checkResponse(resp) {
    try {
      return { success: true, data: JSON.parse(resp.toString('ISO-8859-15')) };
    } catch (error) {
      return { success: false, error: 'La respuesta no es un JSON con la Info' };
    }
  }

  private parseFilters(filters) {
    const filtros = {
      entradaPublica: 'true',
      indExamenRecuperacion: 'true',
      idiomaPais: 'es.ES',
      idPestana: '1',
      ultimoPlanDocente: '',
      accesoSecretaria: 'null',
      planDocente: (filters.planDocente === null) ? '' : filters.planDocente,
      centro: (filters.centro === null) ? '' : filters.centro,
      estudio: (filters.estudio === null) ? '' : filters.estudio,
      planEstudio: (filters.planEstudio === null) ? '' : filters.planEstudio,
      curso: (filters.curso === null) ? '' : filters.curso,
      trimestre: (filters.trimestre === null) ? '' : filters.trimestre
    };

    if (typeof filters.grupos !== 'string' && filters.grupos !== null) {
      filters.grupos.forEach(grupo => {
        filtros['grupo' + grupo] = grupo;
      });
    }

    if (typeof filters.asignaturas !== 'string' && filters.asignaturas !== null) {
      filters.asignaturas.forEach(asignatura => {
        filtros['asignatura' + asignatura] = asignatura;
      });
    }

    return filtros;
  }
}
