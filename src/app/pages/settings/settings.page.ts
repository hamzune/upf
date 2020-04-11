import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';

import { File } from '@ionic-native/file/ngx';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
})
export class SettingsPage {
  // VARIABLE PARA GUARDAR LOS FILTROS
  filters: any = {
    planDocente: null,
    centro: null,
    estudio: null,
    planEstudio: null,
    curso: null,
    trimestre: null,
    grupos: null,
    asignaturas: null
  };

  // VARIABLES PARA GUARDAR LAS OPCIONES DE LOS FILTROS
  planDocente: any = [];
  centro: any = [];
  estudio: any = [];
  planEstudio: any = [];
  curso: any = [];
  trimestre: any = [];
  grupos: any = [];
  asignaturas: any = [];


  // HAMZA
  activo: any = 'disabled';

  // MENSAJES QUE MOSTRAR EN LOS ALERTS
  customAlertOptions1: any = {
    header: 'Curso académico',
    translucent: true
  };

  customAlertOptions2: any = {
    header: 'Centros',
    subHeader: '¿ A que centro perteneces ?',
    translucent: true
  };

  customAlertOptions3: any = {
    header: 'Estudio',
    subHeader: '¿ Que grado estas cursando ?',
    translucent: true
  };

  customAlertOptions4: any = {
    header: 'Plan de estudio',
    subHeader: '¿ Que plan de estudios realizas ?',
    translucent: true
  };

  customAlertOptions5: any = {
    header: 'Curso',
    subHeader: '¿ En que curso estas ?',
    translucent: true
  };

  customAlertOptions6: any = {
    header: 'Periodo académico',
    subHeader: '¿ Que trimestre quieres ver ?',
    translucent: true
  };

  customAlertOptions7: any = {
    header: 'Grupo',
    subHeader: '¿ A que grupo perteneces ?',
    translucent: true
  };

  customAlertOptions8: any = {
    header: 'Asignaturas',
    subHeader: '¿ Que asignaturas quieres ver ?',
    translucent: true
  };

  constructor(
    private file: File,
    private api: ApiService,
    private storage: StorageService,
    private router: Router,
    public alertController: AlertController
  ) { }

  async ionViewWillEnter() {
    // this.storage.purge();

    await this.getStorageCombos();

    // REALIZAR LA PETICIÓN PARA OBTENER LOS COMBOS
    this.getCombos();
    
    // this.getactivo();
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Información',
      subHeader: 'Esta aplicación se ha creado para facilitar el acceso al horario del alumnado de la Universidad Pompeu Fabra. Aún se encuentra en fase de desarrollo asi que en las próximas fechas iré actualizando la App a medida que vaya solucionando los problemas que se originen o encuentre mejoras de funcionalidad. De momento solo se encuentra disponible para Android.\n NO es la aplicación oficial de la Universidad. Si teneis alguna sugerencia para poder mejorar la App, podeis contactarme por correo o por instagram.\n  ',
      message: 'Correo: hb580470@gmail.com Instragram: @hamzune',
      buttons: ['Salir']
    });

    await alert.present();
  }

  /**
   * Obtener los filtros guardados en localstorage
   */
  async getStorageCombos() {
    // OBTENER LOS FILTROS GUARDADOS EN LOCALSTORAGE
    this.filters.planDocente = await this.getCombo('planDocente');
    this.filters.centro = await this.getCombo('centro');
    this.filters.estudio = await this.getCombo('estudio');
    this.filters.planEstudio = await this.getCombo('planEstudio');
    this.filters.curso = await this.getCombo('curso');
    this.filters.trimestre = await this.getCombo('trimestre');

    this.filters.grupos = await this.getCombo('grupos');
    this.filters.asignaturas = await this.getCombo('asignaturas');
  }

  /**
   * Obtener los combos, con los filtros que ya tenemos y refrescarlos,
   * por los que hemos obtenido
   */
  getCombos() {
    // OBTENER LOS COMBOS
    this.api.InicioPubHora(this.filters).then((combos: any) => {
      // RENDERIZAR LOS COMBOS
      this.planDocente = combos.planDocente;
      this.centro = combos.centro;
      this.estudio = combos.estudio;
      this.planEstudio = combos.planEstudio;
      this.curso = combos.curso;
      this.trimestre = combos.trimestre;
      this.grupos = combos.grupos;
      this.asignaturas = combos.asignaturas;
    });
  }

  /**
   * Esta funcion sirve para cambiar los valores y guardarlos en localstorage
   *
   * @param evt parametro que devuelve un objeto con el evento de la select
   * al realizar un cambio
   */
  async selectChange(evt) {
    if (evt.detail.value !== undefined) {
      switch (evt.target.name) {
        case 'planDocente':
          this.filters.planDocente = evt.detail.value;
          break;

        case 'centro':
          this.filters.centro = evt.detail.value;
          break;

        case 'estudio':
          this.filters.estudio = evt.detail.value;
          break;

        case 'planEstudio':
          this.filters.planEstudio = evt.detail.value;
          break;

        case 'curso':
          this.filters.curso = evt.detail.value;
          break;

        case 'trimestre':
          this.filters.trimestre = evt.detail.value;
          break;

        case 'grupos':
          this.filters.grupos = evt.detail.value;
          break;

        case 'asignaturas':
          this.filters.asignaturas = evt.detail.value;
          break;
      }

      // GUARDAR EL CAMBIO EN LOCAL
      this.storage.set(evt.target.name, evt.detail.value);

      // PURGAR BBDD LOCAL
      this.purgeLocale(evt.target.name);
      if (evt.target.name !== 'grupos' && evt.target.name !== 'asignaturas') {
        await this.getStorageCombos();
      }

      // Obtener los combos
      this.changeCombo();
    }
  }

  /**
   * Cambiar los filtros y registrarlos en localstorage
   */
  changeCombo() {
    // OBTENER LOS COMBOS
    this.api.ActualizarCombosPubHora(this.filters).then((combos: any) => {
      // RENDERIZAR LOS COMBOS
      this.planDocente = combos.planDocente;
      this.centro = combos.centro;
      this.estudio = combos.estudio;
      this.planEstudio = combos.planEstudio;
      this.curso = combos.curso;
      this.trimestre = combos.trimestre;
      this.grupos = combos.grupos;
      this.asignaturas = combos.asignaturas;
    });
  }

  /**
   *
   * @param name nombre del campo que queremos recuperar de localstorage
   */
  async getCombo(name) {
    let value;
    await this.storage.get(name).then((data: any) => value = data);
    return value;
  }

  /**
   * Funcion para enviar la petición de ver el calendario
   * y redirigir a la pagina principal
   */
  verCalendario() {
    this.api.MostrarPubHora(this.filters).then(() => {
      this.storage.remove('horario');
      this.router.navigateByUrl('/tabs/inicio');
    });
  }

  purgeLocale(type) {
    switch (type) {
      case 'planDocente':
        this.storage.remove('centro');
        this.storage.remove('estudio');
        this.storage.remove('planEstudio');
        this.storage.remove('curso');
        this.storage.remove('trimestre');
        this.storage.remove('grupos');
        this.storage.remove('asignaturas');
        break;

      case 'centro':
        this.storage.remove('estudio');
        this.storage.remove('planEstudio');
        this.storage.remove('curso');
        this.storage.remove('trimestre');
        this.storage.remove('grupos');
        this.storage.remove('asignaturas');
        break;

      case 'estudio':
        this.storage.remove('planEstudio');
        this.storage.remove('curso');
        this.storage.remove('trimestre');
        this.storage.remove('grupos');
        this.storage.remove('asignaturas');
        break;

      case 'planEstudio':
        this.storage.remove('curso');
        this.storage.remove('trimestre');
        this.storage.remove('grupos');
        this.storage.remove('asignaturas');
        break;

      case 'curso':
        this.storage.remove('trimestre');
        this.storage.remove('grupos');
        this.storage.remove('asignaturas');
        break;
    }
  }

  /*
  acumular() {
    this.storage.get('acumular').then((el) => {
      const booleano = el ? false : true;
      this.storage.set('acumular', booleano);
      console.log(booleano);
    });
  }

  getactivo() {
    this.storage.get('acumular').then((el) => {
      // console.log(el);
      this.activo = el;
    });
  }*/
}
