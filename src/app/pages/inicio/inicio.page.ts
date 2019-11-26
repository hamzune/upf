import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonItemSliding, IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ApiService } from '../../services/api.service';
import { NavController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  @ViewChild('slider', { read: '', static: false }) slider: IonItemSliding;
  @ViewChild('slides', { read: '', static: false }) slides: IonSlides;

  slideOpts = {
    initialSlide: 20
  };

  clases = [];

  mat: any;

  info: any = 'no funciona';

  hoy: any[] = [];

  materias: any[] = [];

  grups: any = [];

  fecha = new Date();

  fechaToday = moment(moment().format('YYYY-MM-DD')).unix();

  fechaTomorrow = moment(moment().add(1, 'day').format('YYYY-MM-DD')).unix();

  fechaHoy = moment().format('DD-MM-YYYY');

  constructor(
    private api: ApiService,
    public navCtrl: NavController,
    private storage: StorageService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.courses();
  }

  openit() {
    const timeout = setTimeout(() => {

      this.slides.slideTo(0, 2000);

      this.slider.closeOpened().then(() => {

        this.slider.open('start');
        clearTimeout(timeout);

      });

    }, 1000);
  }

  refresh(event) {
    this.courses();
    event.target.complete();
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
          await this.getInfoStorage();

          this.dia();
        } else {
          this.presentAlert();
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

  showMore(clase) {
    console.log(clase);
  }

  utf8_encode(argString) {
    const txt = document.createElement('textarea');
    txt.innerHTML = argString;
    return txt.value;
  }

  getInfoStorage() {
    return new Promise(resolve => {
      this.getCombo('grups').then((resp) => {
        this.grups = resp === '' ? [] : resp;
        resolve();
      });
    });
  }

  async getCombo(name) {
    let value = '';
    await this.storage.get(name)
      .then((data: string) => value = (data !== null) ? data : '');
    return value;
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

  dia() {
    this.clases.forEach(materia => {
      if (typeof materia.title !== 'undefined') {
        if (!materia.mostrarMensaje) {
          if (this.materias[materia.codAsignatura] == null) {
            this.materias[materia.codAsignatura] = {
              id: materia.codAsignatura,
              title: this.utf8_encode(materia.title),
              color: this.get_colores(this.utf8_encode(materia.tipologia))
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

    this.storage.set('materias', this.materias);
    this.storage.set('horario', this.clases);

    if (this.hoy.length > 0) {
      this.openit();
    }
  }

  borrar(lista) {
    this.storage.set(lista, {});
  }

  sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  goToPage(materia) {
    this.navCtrl.navigateForward('/materia/' + materia.codAsignatura);
  }
}
