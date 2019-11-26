import { Injectable } from '@angular/core';
import * as jQuery from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class ParserHtmlService {
  private respuesta;

  constructor() { }

  private purgeRespuesta() {
    this.respuesta = {
      planDocente: [],
      centro: [],
      estudio: [],
      planEstudio: [],
      curso: [],
      trimestre: [],
      grupos: [],
      asignaturas: []
    };
  }

  parseHTML(HTML: string) {
    // Purgar los datos anteriores si los hubiera
    this.purgeRespuesta();

    this.tratarHTML(HTML);

    return this.respuesta;
  }

  tratarHTML(HTMLstring: string) {
    const pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/i;
    const bodyHtml = pattern.exec(HTMLstring.replace(/\s\s+/g, ' '));
    const body = jQuery.parseHTML(bodyHtml[0]);
    const form = $(body).find('#formu_Edi_Estudio');

    if (form.length > 0) {
      // Establecer el planDocente
      const planDocente = $(form).find('#planDocente');
      if (planDocente.length > 0) {
        this.respuesta.planDocente = this.obtenerInfo(planDocente);
      }

      // Establecer los centros
      const centro = $(form).find('#centro');
      if (centro.length > 0) {
        this.respuesta.centro = this.obtenerInfo(centro);
      }

      // Establecer los tipos de estudios del centro
      const estudio = $(form).find('#estudio');
      if (estudio.length > 0) {
        this.respuesta.estudio = this.obtenerInfo(estudio);
      }

      // Establecer los planes de estudio
      const planEstudio = $(form).find('#planEstudio');
      if (planEstudio.length > 0) {
        this.respuesta.planEstudio = this.obtenerInfo(planEstudio);
      }

      // Establecer los cursos
      const curso = $(form).find('#curso');
      if (curso.length > 0) {
        this.respuesta.curso = this.obtenerInfo(curso);
      }

      // Establecer los trimestres
      const trimestre = $(form).find('#trimestre');
      if (trimestre.length > 0) {
        this.respuesta.trimestre = this.obtenerInfo(trimestre);
      }

      // Establecer los grupos
      const grupos = $(form).find('#grupos');
      if (grupos.length > 0) {
        this.respuesta.grupos = this.obtenerInfo(grupos);
      }

      // Establecer las asignaturas
      const asignaturas = $(form).find('#asignaturas');
      if (asignaturas.length > 0) {
        this.respuesta.asignaturas = this.obtenerInfo(asignaturas);
      }
    }
  }

  obtenerInfo(element) {
    if (element.is('select')) {
      const respuesta = {
        type: 'SELECT',
        options: [],
        id: element.attr('id'),
        name: element.attr('name'),
        value: ''
      };
      const values = [];

      element.find('option').map((i, elm) => {
        if (elm.selected === true) {
          values.push(elm.value);
        }
        respuesta.options.push({ value: elm.value, title: elm.text, select: elm.selected });
      });

      respuesta.value = values.toString();

      return respuesta;
    } else if (element.is('input')) {
      return {
        type: 'SELECT',
        options: [{ value: element.val(), title: element.parent().text().trim(), select: true }],
        id: element.attr('id'),
        name: element.attr('name'),
        value: element.val()
      };
    }
  }
}
