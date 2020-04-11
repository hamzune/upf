import { Component } from '@angular/core';

import { File } from '@ionic-native/file/ngx';

import { Events } from "@ionic/angular";

import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ApiService } from '../../services/api.service';
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage {
  calendar = {
    mode: 'month',
    currentDate: new Date(),
    locale: 'es-Ar',
    startingDayWeek: 1,
    startingDayMonth: 1,
    formatDayHeader: 'EEEEE',
    formatHourColumn: 'HH'
  };

  selectedDate = new Date();

  thisDateTitle = '';

  eventSource = [];

  grups: any = [];

  horario: any = [];

  materias: any = [];

  findes =  false;

  fechaToday = moment(moment().format('YYYY-MM-DD')).unix();

  fechaTomorrow = moment(moment().add(3, 'day').format('YYYY-MM-DD')).unix();


  markDisabled = (date: Date) => {
    return (date.getDay() === 6 || date.getDay() === 0);
  }

  constructor(
    public navCtrl: NavController,
    private storage: StorageService,
    public alertController: AlertController,
    private api: ApiService,
    private router: Router,
    private file: File,
    public events: Events
  ) {
    events.subscribe("back", () => {
      this.courses();
    });
    events.subscribe("calendar", () => {
      this.courses();
    });

  }

  ionViewWillEnter() {

    this.findes = this.markDisabled(new Date());
    this.fechaToday = moment(moment().startOf('year').format('YYYY-MM-DD')).unix();
    this.fechaTomorrow = moment(moment().endOf('year').format('YYYY-MM-DD')).unix();
    this.courses();
 
  }

  async courses() {
    await this.getInfoStorage().then(() => {
      this.api
        .selecionarRangoHorarios({
          start: this.fechaToday.toString(),
          end: this.fechaTomorrow.toString()
        })
        .then(async (resp: any) => {
          if (resp.success && typeof resp.data.error === 'undefined') {
            this.horario = resp.data;
            this.getRequest();
          } else {
            this.getRequest();
          }
        })
        .catch(err => console.log(err));
    });
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'La sesión no es válida o ha sido cerrada!',
      message: 'Ir a configuración para obtener una nueva <strong>sesión</strong>!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: '¡ VALE !',
          handler: () => {
            this.router.navigateByUrl('/tabs/settings');
          }
        }
      ]
    });

    await alert.present();
  }

  dayMode() {
    this.calendar.mode = 'day';
  }

  weekMode() {
    this.calendar.mode = 'week';
  }

  monthMode() {
    this.calendar.mode = 'month';
  }

  addNewEvent(codigo: any, titulo: any, groupo: any, aulas: any, tipos: any, start: any, end: any, className: any) {
    start = new Date(start);
    end = new Date(end);

    const event = {
      codAsignatura: codigo,
      title: titulo,
      aula: aulas,
      tipo: tipos,
      group: groupo,
      startTime: start,
      endTime: end,
      startTimeString: moment(start.getTime()).format('HH:mm'),
      endTimeString: moment(end.getTime()).format('HH:mm'),
      allDay: false,
      color: this.materias[codigo].color
    };

    this.eventSource.push(event);
  }

  onEventSelected(ev) { }

  goToPage(materia) {
    if(materia.codAsignatura){
      this.navCtrl.navigateForward('/materia/' + materia.codAsignatura);
    }
  }
  
  
  async getInfoStorage() {
    // let materias;
    // await this.file.readAsText(this.file.dataDirectory,"materias.json").then((resp) => {
    //   resp = JSON.parse(resp)
    //   materias = resp === '' ? [] : resp;
   
    // });

    // materias.forEach(element => {
    //   if (element != null) {
    //     this.materias[element.id] = (element);
    //   }
    // });

    await this.getCombo('materias').then((resp) => {
      this.materias = resp === '' ? [] : resp;
    });

    await this.getCombo('horario').then((resp) => {
      this.horario = resp === '' ? [] : resp;
    });

    // await this.file.readAsText(this.file.dataDirectory,"horarios.json").then((resp) => {
    //   resp = JSON.parse(resp)
    //   horario = resp === '' ? [] : resp;

    // });

    // horario.forEach(element => {
    //   if (element != null) {
    //     this.horario.push(element);
    //   }
    // });

    await this.getCombo('grups').then((resp) => {
      this.grups = resp === '' ? [] : resp;
    });
  }


  async getCombo(name) {
    let value = '';
    await this.storage.get(name)
      .then((data: string) => value = (data !== null) ? data : '');
    return value;
  }

  onTimeSelected(ev) {
    this.selectedDate = ev.selectedTime;
  }

  onViewTitleChanged(event) {
    this.thisDateTitle = event;
  }

  onCurrentDateChanged(event: Date) {
    // console.log('current data change: ' + event);
  }

  utf8_encode(argString) {
    const txt = document.createElement('textarea');
    txt.innerHTML = argString;
    return txt.value;
  }


  getRequest() {
    this.eventSource = [];
    this.horario.forEach(element => {

      element.title = this.utf8_encode(element.title);

      element.tipologia = element.tipologia === undefined ? 'G' : element.tipologia[0];

      if (this.grups[element.codAsignatura]) {
        try {
          var tipo = element.tipologia[0] === 'T' ? this.grups[element.codAsignatura][0].t :
            element.tipologia[0] === 'S' ? this.grups[element.codAsignatura][0].s :
              this.grups[element.codAsignatura][0].p;
          if (element.grup !== tipo) {


          } else {
            this.addNewEvent(
              element.codAsignatura,
              element.title,
              element.codGrupo,
              element.aula,
              element.tipologia,
              element.start,
              element.end,
              element.className
            );
          }
        } catch (error) {
          var tipo = element.tipologia === 'T' ? this.grups[element.codAsignatura].t :
            element.tipologia === 'S' ? this.grups[element.codAsignatura].s :
              this.grups[element.codAsignatura].p;
          if (element.grup !== tipo) {

            
          } else {
            this.addNewEvent(
              element.codAsignatura,
              element.title,
              element.codGrupo,
              element.aula,
              element.tipologia,
              element.start,
              element.end,
              element.className
            );
          }
        }
      } else {
        if (typeof element.mostrarMensaje === 'undefined') {
          this.addNewEvent(
            element.codAsignatura,
            element.title,
            element.codGrupo,
            element.aula,
            element.tipologia,
            element.start,
            element.end,
            element.className
          );
        }
      }
    });

    this.storage.remove("horario").then(() => {
      this.storage.set("horario", this.horario);
    });
  }
    
  
}
