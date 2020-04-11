import { Component } from '@angular/core';

import { File } from '@ionic-native/file/ngx';

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

  nameMes = '';

  eventSource = [];

  grups: any = [];

  horario: any = [];

  materias: any = [];

  findes =  false;

  fechaToday = moment(moment().format('YYYY-MM-DD')).unix();

  fechaTomorrow = moment(moment().add(3, 'day').format('YYYY-MM-DD')).unix();

  hoy: any[] = [];

  update = false;

  clases;

  markDisabled = (date: Date) => {
    return (date.getDay() === 6 || date.getDay() === 0);
  }

  constructor(
    public navCtrl: NavController,
    private storage: StorageService,
    public alertController: AlertController,
    private api: ApiService,
    private router: Router,
    private file: File
  ) {
  }

  ionViewWillEnter() {
    this.findes = this.markDisabled(new Date());
    this.nameMes = moment(moment().startOf('month').format('YYYY-MM-DD')).format('MMM');
    this.fechaToday = moment(moment().startOf('year').format('YYYY-MM-DD')).unix();
    this.fechaTomorrow = moment(moment().endOf('year').format('YYYY-MM-DD')).unix();
    this.courses();
 
  }

  courses() {
    this.api
      .selecionarRangoHorarios({
        start: this.fechaToday.toString(),
        end: this.fechaTomorrow.toString()
      })
      .then(async (resp: any) => {
        if (resp.success && typeof resp.data.error === 'undefined') {
          this.clases = resp.data;
          this.hoy = [];
          this.horario = [];
          this.dia();
          await this.getInfoStorage().then(() => {
            this.getRequest();
            this.dia();
          });
          
        } else {

        }
      })
      .catch(err => console.log(err));
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
  getRandomColor(c) {
    var color = '#';
    
    if(c){
      c = ''+c;
      var letters = '0123456789ABCDEF';
      for (var i = 0; i < 3; i++) {
        color += c[i];
      }
      for (var i = 0; i < 3; i++) {
        color += letters[Math.floor(Math.random() * 10)];
      }
    }else{
      color="black"
    }
    
    return color;
  }
  dia() {
    this.clases.forEach(materia => {
      
      if (typeof materia.title !== 'undefined') {
        if (!materia.mostrarMensaje) {
          if (this.materias[materia.codAsignatura] == null) {

            this.materias[materia.codAsignatura] = {
              id: materia.codAsignatura,
              title: this.utf8_encode(materia.title),
              color: this.getRandomColor(materia.codAsignatura)
            };
          }

          if (moment(moment(materia.start).format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD'), 'day')) {
            const start = materia.start;
            const end = materia.end;
            const mat = {
              grup: materia.grup,
              aula: materia.aula,
              title: this.utf8_encode(materia.title),
              codAsignatura: materia.codAsignatura,
              tipologia: this.utf8_encode(materia.tipologia),
              start: start.slice(11, -3),
              end: end.slice(11, -3),
              className: this.materias[materia.codAsignatura].color,
            };

            if (this.grups[mat.codAsignatura]) {
              try {
                const tipo = mat.tipologia[0] === 'T' ? this.grups[mat.codAsignatura][0].t :
                  mat.tipologia[0] === 'S' ? this.grups[mat.codAsignatura][0].s :
                    this.grups[mat.codAsignatura][0].p;
                if (mat.grup !== tipo) {
                } else {
                  this.hoy.push(mat);
                }
              } catch (error) {
                const tipo = mat.tipologia === 'T' ? this.grups[mat.codAsignatura].t :
                  mat.tipologia === 'S' ? this.grups[mat.codAsignatura].s :
                    this.grups[mat.codAsignatura].p;
                if (mat.grup !== tipo) {
                } else {
                  this.hoy.push(mat);
                }
              }
            } else {
              this.hoy.push(mat);
              this.hoy = this.hoy.sort((a, b) => a.start.slice(0, 2) - b.start.slice(0, 2));
            }
          }
        }

        this.hoy.forEach((ele, index) => {
          const hora = (new Date()).getHours();
          if (hora > ele.start.slice(0, 2)) {
            const aux = this.hoy[0];
            this.hoy[0] = ele;
            this.hoy[index] = aux;
          }
        });
      }
    });

    // this.storage.remove('materias');
    // this.storage.remove('hoario');

    this.file.writeFile(this.file.dataDirectory,'horarios.json',JSON.stringify(this.clases)).then(()=>{
      //console.log( this.file.readAsBinaryString(this.file.dataDirectory,"horarios.json"));

    }).catch(()=>{

      this.file.writeExistingFile(this.file.dataDirectory,'horarios.json',JSON.stringify(this.clases)).then(()=>{
        //console.log( this.file.readAsBinaryString(this.file.dataDirectory,"horarios.json"));
  
      }).catch(()=>{
        // console.log( this.file.readAsText(this.file.dataDirectory,"horarios.json"));
        // console.log("erroooor")
      });
    });


    this.file.writeFile(this.file.dataDirectory,'materias.json',JSON.stringify(this.materias)).then(()=>{
      // console.log( this.file.readAsBinaryString(this.file.dataDirectory,"materias.json"));

    }).catch(()=>{

      this.file.writeExistingFile(this.file.dataDirectory,'materias.json',JSON.stringify(this.materias)).then(()=>{
        //console.log( this.file.readAsBinaryString(this.file.dataDirectory,"materias.json"));
  
      }).catch(()=>{
        // console.log( this.file.readAsText(this.file.dataDirectory,"materias.json"));
        // console.log("erroooor");
      });
    });

  }

  async getInfoStorage() {
    let materias;

    await this.file.readAsText(this.file.dataDirectory,"materias.json").then((resp) => {
      resp = JSON.parse(resp)
      materias = resp === '' ? [] : resp;
   
    });

    materias.forEach(element => {
      if (element != null) {
        this.materias[element.id] = (element);
      }
    });

    let horario;

    await this.file.readAsText(this.file.dataDirectory,"horarios.json").then((resp) => {
      resp = JSON.parse(resp)
      horario = resp === '' ? [] : resp;

    });

    horario.forEach(element => {
      if (element != null) {
        this.horario.push(element);
      }
    });

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
    this.nameMes = moment(moment(moment(ev.selectedTime.getTime())).startOf('month').format('YYYY-MM-DD')).format('MMM');
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

  get_colores(type) {
    let color = '#1B2631';

    switch (type) {
      case 'Seminario':
        color = '#154360';
        break;

      case 'Teoría':
        color = '#0B5345';
        break;

      case 'Prácticas':
        color = '#4D5656';
        break;

      default:
        color = '#1B2631';
        break;
    }

    return color;
  }

  getRequest() {
    this.eventSource = [];
    this.horario.forEach(element => {
      // console.log(new Date(element.start));
      element.title = this.utf8_encode(element.title);
      // element.title = element.title.length > 12 ? element.title.slice(0, 12) + '...' : element.title;
      element.tipologia = element.tipologia === undefined ? 'G' : element.tipologia[0];

      if (this.grups[element.codAsignatura]) {
        try {
          var tipo = element.tipologia[0] === 'T' ? this.grups[element.codAsignatura][0].t :
            element.tipologia[0] === 'S' ? this.grups[element.codAsignatura][0].s :
              this.grups[element.codAsignatura][0].p;
          if (element.grup !== tipo) {
            // console.log(element.grup + ' .. ' + element.tipologia);
            // console.log(tipo);
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
            // console.log(element.grup + ' .. ' + element.tipologia);
            // console.log(tipo);
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
  }
}
