import { Component, OnInit, ViewChild } from "@angular/core";
import { IonItemSliding, IonSlides } from "@ionic/angular";
import { Events } from "@ionic/angular";
import { StorageService } from "../../services/storage.service";
import { ApiService } from "../../services/api.service";
import { NavController } from "@ionic/angular";
import * as moment from "moment";

@Component({
  selector: "app-inicio",
  templateUrl: "./inicio.page.html",
  styleUrls: ["./inicio.page.scss"],
})
export class InicioPage implements OnInit {
  @ViewChild("slider", { read: "", static: false }) slider: IonItemSliding;
  @ViewChild("slides", { read: "", static: false }) slides: IonSlides;

  slideOpts = {
    initialSlide: 20,
  };

  clases;

  tareas: any;

  tareashoy: any[] = [];

  mat: any;

  hoy: any[] = [];

  materias: any = [];

  grups: any = [];

  finde = false;

  fechaToday = moment(moment().startOf("year").format("YYYY-MM-DD")).unix();

  fechaTomorrow = moment(moment().endOf("year").format("YYYY-MM-DD")).unix();

  fechaHoy = moment().format("DD-MM-YYYY");

  constructor(
    private api: ApiService,
    public navCtrl: NavController,
    private storage: StorageService,
    public events: Events
  ) {
    events.subscribe("back", () => {
      this.courses();
    });
    events.subscribe("inicio", () => {
      this.courses();
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    var date = new Date();
    this.finde = date.getDay() === 6 || date.getDay() === 0;
    this.courses();
  }

  refresh(event) {
    this.courses();
  }

  async courses() {
    await this.getInfoStorage().then(() => {
      this.api
        .selecionarRangoHorarios({
          start: this.fechaToday.toString(),
          end: this.fechaTomorrow.toString(),
        })
        .then(async (resp: any) => {
          if (resp.success && typeof resp.data.error === "undefined") {
            this.clases = resp.data;
            console.log("Consulta web");
            this.hoy = [];
            this.dia();
          } else {

            //obtener las clases de hoy en local
            console.log("De memoria");
            //IMPORTANTE
            this.hoy = [];
            this.dia();
          }
        })
        .catch((err) => console.log(err));
    });

  }

  utf8_encode(argString) {
    const txt = document.createElement("textarea");
    txt.innerHTML = argString;
    return txt.value;
  }

  async getInfoStorage() {
    await this.getCombo("materias").then((resp) => {
      this.materias = resp === "" ? [] : resp;
    });

    await this.getCombo("grups").then((resp) => {
      this.grups = resp === "" ? [] : resp;
    });

    await this.getCombo("tareas").then((resp) => {
      this.tareas = resp === "" ? [] : resp;
    });

    await this.getCombo("horario").then((resp) => {
      this.clases = resp === "" ? [] : resp;
    });
  }

  async getCombo(name) {
    let value = "";
    await this.storage
      .get(name)
      .then((data: string) => (value = data !== null ? data : ""));
    return value;
  }

  getRandomColor(c) {
    var color = "#";

    if (c) {
      c = "" + c;
      var letters = "0123456789ABCDEF";
      for (var i = 0; i < 3; i++) {
        color += c[i];
      }
      for (var i = 0; i < 3; i++) {
        color += letters[Math.floor(Math.random() * 10)];
      }
    } else {
      color = "black";
    }

    return color;
  }
  dia() {
    this.clases.forEach((materia) => {
      if (typeof materia.title !== "undefined") {
        if (!materia.mostrarMensaje) {
          if (this.materias[materia.codAsignatura] == null) {
            this.materias[materia.codAsignatura] = {
              id: materia.codAsignatura,
              title: this.utf8_encode(materia.title),
              color: this.getRandomColor(materia.codAsignatura),
            };
          }

          this.tareashoy = [];
          if (
            moment(moment(materia.start).format("YYYY-MM-DD")).isSame(
              moment().format("YYYY-MM-DD"),
              "day"
            )
          ) {
          try {
            this.tareas[materia.codAsignatura].forEach((tarea) => {
              if (this.sameDay(new Date(tarea.fecha), new Date())) {
                this.tareashoy.push(tarea);
              }
            });
          } catch (error) {
            console.log("error insertando las tareas de hoy");
          }
          
            // CREAR la variable mat para meterla posteriormente en this.hoy
            let mat = {
              grup: materia.grup,
              aula: materia.aula,
              title: this.utf8_encode(materia.title),
              codAsignatura: materia.codAsignatura,
              tipologia: this.utf8_encode(materia.tipologia),
              start: materia.start.slice(11, -3),
              end: materia.end.slice(11, -3),
              className: this.materias[materia.codAsignatura].color,
              tareas: this.tareashoy,
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

              var tipo =
                mat.tipologia[0] === "T"
                  ? teoria
                  : mat.tipologia[0] === "S"
                  ? seminario
                  : practica;

              if (mat.grup === tipo) {
                //si coinciden los grupos lo añadimos
                this.hoy.push(mat);
              } else {
                console.log("Grupo1: ", mat.grup);
                console.log("Grupo2: ", tipo);
              }
            } else {
              //si no hay grupos añadidos añadimos la materia igual
              this.hoy.push(mat);
              //ordenamos la matriz
              this.hoy = this.hoy.sort(
                (a, b) => a.start.slice(0, 2) - b.start.slice(0, 2)
              );
            }
          }
        }
        //para ordenar respecto a la hora en la que me encuentro

        // this.hoy.forEach((ele, index) => {
        //   const hora = new Date().getHours();
        //   if (hora > ele.start.slice(0, 2)) {
        //     const aux = this.hoy[0];
        //     this.hoy[0] = ele;
        //     this.hoy[index] = aux;
        //   }
        // });
      }
    });

    this.storage.remove("materias").then(() => {
      this.storage.set("materias", this.materias);
    });
  }

  borrar(lista) {
    this.storage.set(lista, {});
  }

  sameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  goToPage(materia) {
    this.navCtrl.navigateForward("/materia/" + materia.codAsignatura);
  }
}
