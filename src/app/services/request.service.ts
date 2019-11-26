import { Injectable } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';

import { NetworkService } from '../services/network.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  network = false;

  constructor(
    private http: HTTP,
    private netw: NetworkService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    // ESPECIFICAR SI HAY CONEXIÓN
    this.network = this.netw.statusNetwork.value;
    this.netw.statusNetwork.subscribe(status => {
      this.network = status;
    });
  }

  get(endPoint: string, filtros: any, header: any) {
    // console.log('get', environment.dominio + endPoint, JSON.stringify(filtros));

    return new Promise(async (resolve, reject) => {
      if (this.network) {
        // Mostrar cargando
        const load = await this.showLoading();

        // Realizar la petición
        this.http.sendRequest(environment.dominio + endPoint, {
          method: 'get',
          params: filtros,
          headers: header,
          serializer: 'urlencoded'
        })
          .then(data => {
            // console.log(data.status);
            // console.log(data.data);
            // console.log(data.headers);

            resolve(data.data);
            load.dismiss();
          })
          .catch(error => {
            // console.log(error.status);
            // console.log(error.error);
            // console.log(error.headers);

            reject(error.error);
            this.handleError(null);
            load.dismiss();
          });
      } else {
        reject({ success: false, error: 'E009' });
        this.handleError('E009');
      }
    });
  }

  post(endPoint: string, filtros: any, header: any) {
    // console.log('post', environment.dominio + endPoint, JSON.stringify(filtros));

    return new Promise(async (resolve, reject) => {
      if (this.network) {
        // Mostrar cargando
        const load = await this.showLoading();

        // Realizar la petición
        this.http.post(environment.dominio + endPoint, filtros, header)
          .then(data => {
            // console.log(data.status);
            // console.log(data.data);
            // console.log(data.headers);

            resolve(data.data);
            load.dismiss();
          })
          .catch(error => {
            // console.log(error.status);
            // console.log(error.error);
            // console.log(error.headers);

            reject(error.error);
            this.handleError(null);
            load.dismiss();
          });
      } else {
        reject({ success: false, error: 'E009' });
        this.handleError('E009');
      }
    });
  }

  async handleError(code) {
    switch (code) {
      case 'E000':
        await this.presentToast('Petición no reconocida.');
        break;

      case 'E001':
        await this.presentToast('Error interno de la aplícación central.');
        break;

      case 'E002':
        await this.presentToast('No existe el usuario.');
        break;

      case 'E003':
        await this.presentToast('No es correcta la contraseña.');
        break;

      case 'E004':
        await this.presentToast('No ha sido enviado el campo usuario.');
        break;

      case 'E005':
        await this.presentToast('No ha sido enviado el campo password');
        break;

      case 'E006':
        await this.presentToast(
          'Falta el campo Authorization entre los headers.'
        );
        break;

      case 'E007':
        await this.presentToast('Token no válido o corrupto.');
        break;

      case 'E008':
        await this.presentToast('El Token ha expirado.');
        break;

      case 'E009':
        await this.presentToast('No esta conectado ha internet.');
        break;

      case 'E010':
        await this.presentToast(
          'No se ha podido subir correctamente la imagen.'
        );
        break;

      default:
        await this.presentToast('Error desconocido.');
        break;
    }
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 5000
    });
    toast.present();
  }

  async showLoading() {
    const loading = await this.loadingController.create({
      spinner: 'crescent',
      translucent: true
    });
    await loading.present();
    return loading;
  }
}
