import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


import { File } from '@ionic-native/file/ngx';
import { NavController } from '@ionic/angular';
import * as moment from 'moment';
import { StorageService } from '../../services/storage.service';
import { AlertController } from '@ionic/angular';
import { LocalNotifications, ELocalNotificationTriggerUnit } from '@ionic-native/local-notifications/ngx';

@Component({
  selector: 'app-materia',
  templateUrl: './materia.page.html',
  styleUrls: ['./materia.page.scss'],
})
export class MateriaPage implements OnInit {
  materia: any = {
    id: '',
    title: '',
    color: ''
  };

  tareasHechas: any[] = [];

  tareasPendientes: any[] = [];

  tareas: any = [];

  grups: any = [];

  codiMateria: any;

  info: any = 'nada';

  notis = [];
  
  constructor(
    public alertController: AlertController,
    private navCtrl: NavController,
    private storage: StorageService,
    public activatedRoute: ActivatedRoute,
    private localNotificatios: LocalNotifications,
    private file: File
  ) {

    this.codiMateria = this.activatedRoute.snapshot.paramMap.getAll('materia');

  
    this.getInfoStorage().then(() => {
      // console.log(this.tareas[this.codiMateria]);
      this.separarTareas();
    });

  }

  async getInfoStorage() {
    
    this.file.readAsText(this.file.dataDirectory,"materias.json").then((resp) => {
      resp = JSON.parse(resp)
      let materias = resp === '' ? [] : resp;
      this.materia = materias[this.codiMateria];
    });


    const tareas = await this.getCombo('tareas');
    this.tareas = tareas === '' ? [] : tareas;

    const grups = await this.getCombo('grups');
    this.grups = grups === '' ? [] : grups;



  }

  ngOnInit() { }

  goBack() {
    this.navCtrl.back();
  }

  async getCombo(name) {
    let value = '';
    await this.storage.get(name)
      .then((data: string) => value = (data !== null) ? data : '');
    return value;
  }

  separarTareas() {
    this.tareasHechas = [];
    this.tareasPendientes = [];
    if (this.tareas[this.codiMateria]) {
      this.tareas[this.codiMateria].forEach(element => {
        if (element.hecha === 'true') {

          this.tareasHechas.push(element);
        } else {
          this.tareasPendientes.push(element);
        }
      });
    }
    $('.progreso #progre').attr('value', this.tareasHechas.length / (this.tareasHechas.length + this.tareasPendientes.length));
  }

  addTarea(nombre, fechas) {
    const tarea: any = {
      id: Math.random(),
      value: nombre,
      fecha: fechas,
      hecha: 'false'
    };

    if (!this.tareas[this.codiMateria]) {
      this.tareas[this.codiMateria] = {};
      this.tareas[this.codiMateria] = [tarea];

    } else {
      this.tareas[this.codiMateria].push(tarea);
    }

    this.notis.push({
      id: tarea.id,
      title: this.materia.title,
      text: 'Tarea pendiente:  ' + tarea.value,
      trigger: { at: new Date(new Date(tarea.fecha).getTime() - 3600 * 1800) },
      foreground: true
    });

    this.localNotificatios.cancelAll();
    this.localNotificatios.schedule(this.notis);
    this.storage.set('tareas', this.tareas);
  }

  addgrups(teoria, seminario, practica) {
    const grups: any = {
      t: teoria,
      s: seminario,
      p: practica
    };

    if (!this.grups[this.codiMateria]) {
      this.grups[this.codiMateria] = {};
      this.grups[this.codiMateria] = [grups];

    } else {
      this.grups[this.codiMateria] = (grups);
    }

    this.storage.set('grups', this.grups);
  }

  hecho(tarea) {
    const aux = tarea;
    aux.hecha = 'true';
    const removeIndex = this.tareas[this.codiMateria].map((item) => {
      return item.id;
    }).indexOf(tarea.id);
    this.tareas[this.codiMateria].splice(removeIndex, 1);
    this.tareas[this.codiMateria].push(aux);
    this.separarTareas();
    this.storage.set('tareas', this.tareas);

    this.localNotificatios.clear(tarea.id);
  }

  borrar(tarea) {
    const removeIndex = this.tareas[this.codiMateria].map((item) => {
      return item.id;
    }).indexOf(tarea.id);
    this.tareas[this.codiMateria].splice(removeIndex, 1);
    this.separarTareas();
    this.storage.set('tareas', this.tareas);
    this.localNotificatios.clear(tarea.id);
  }


  async confAlert() {
    const alert = await this.alertController.create({
      header: 'Selecciona los grups',
      inputs: [
        {
          name: 'teoria',
          type: 'number',
          placeholder: 'Grupo teoria'
        },

        {
          name: 'seminario',
          type: 'number',
          placeholder: 'Grupo seminario'
        },
        {
          name: 'practica',
          type: 'number',
          placeholder: 'Grupo practica'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Guardar',
          handler: (data) => {
            this.addgrups(data.teoria, data.seminario, data.practica);

            this.navCtrl.navigateForward('/tabs/inicio');
            this.separarTareas();

          }
        }
      ]
    });

    await alert.present();
  }
  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Crea una tarea',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Ej: Nombre de la tarea'
        },
        {
          name: 'limite',
          type: 'date',
          value: moment().format('YYYY-MM-DD')
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Añadir',
          handler: (data) => {
            //  this.info = JSON.stringify(alert.inputs['name']);
            this.addTarea(data.name, data.limite);
            this.separarTareas();

          }
        }
      ]
    });

    await alert.present();
  }
}
