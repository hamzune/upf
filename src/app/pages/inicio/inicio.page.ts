import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonItemSliding, IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
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

  clases;

  tareas : any ;
  
  tareashoy : any[] = [] ;

  mat: any;

  info: any = 'no funciona';

  hoy: any[] = [];

  materias: any[] = [];

  grups: any = [];

  fecha = new Date();

  finde  = false;

  fechaToday = moment(moment().format('YYYY-MM-DD')).unix();

  fechaTomorrow = moment(moment().add(1, 'day').format('YYYY-MM-DD')).unix();

  fechaHoy = moment().format('DD-MM-YYYY');

  constructor(
    private file: File,
    private api: ApiService,
    public navCtrl: NavController,
    private storage: StorageService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    var date = new Date();
    this.finde = (date.getDay() === 6 || date.getDay() === 0);
    this.courses();
    
  }



  refresh(event) {
    this.courses();
    
  }


  async courses() {
    
    const tareas = await this.getCombo('tareas');
    this.tareas = tareas === '' ? [] : tareas;
    
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
            await this.file.readAsText(this.file.dataDirectory,"horarios.json").then((resp) => {
              resp = JSON.parse(resp)
              this.clases = resp === '' ? [] : resp;

            });
            this.hoy = [];
            await this.getInfoStorage();
            this.dia();
        }
      })
      .catch((err => console.log(err)));
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
          //console.log(materia);
          if (moment(moment(materia.start).format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD'), 'day')) {
            const start = materia.start;
            const end = materia.end;
            this.tareashoy = [];
            try {
              this.tareas[materia.codAsignatura].forEach((tarea)=>{
                if(this.sameDay(new Date(tarea.fecha),new Date())){
                  this.tareashoy.push(tarea);
                }
              })
            } catch (error) {
              
            }

            const mat = {
              grup: materia.grup,
              aula: materia.aula,
              title: this.utf8_encode(materia.title),
              codAsignatura: materia.codAsignatura,
              tipologia: this.utf8_encode(materia.tipologia),
              start: start.slice(11, -3),
              end: end.slice(11, -3),
              className: this.materias[materia.codAsignatura].color,
              tareas: this.tareashoy
            };

            if (this.grups[mat.codAsignatura]) {
              try {
                var teoria = this.grups[mat.codAsignatura][0].t;
                var seminario = this.grups[mat.codAsignatura][0].s;
                var practica = this.grups[mat.codAsignatura][0].p;
              } catch (error) {
                var teoria = this.grups[mat.codAsignatura].t;
                var seminario = this.grups[mat.codAsignatura].s;
                var practica = this.grups[mat.codAsignatura].p;
              }
              

              var tipo = mat.tipologia[0] === 'T' ?  teoria :
              mat.tipologia[0] === 'S' ? seminario :
                practica;
                
                if (mat.grup !== tipo) {
                  console.log("Grupo1: ", mat.grup);
                  console.log("Grupo2: ", tipo);
                } else {
                  this.hoy.push(mat);
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

     


    // this.storage.set('materias', this.materias);
    // this.storage.set('horario', this.clases);

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
