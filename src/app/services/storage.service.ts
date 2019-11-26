import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { resolve } from 'url';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) { }

  set(name, json) {
    return new Promise((resolve, reject) => {
      this.storage
        .set(name, json)
        .then(() => resolve())
        .catch(error => reject(error));
    });
  }

  get(name) {
    return new Promise(resolve => {
      this.storage
        .get(name)
        .then(data => resolve(data))
        .catch(() => resolve(''));
    });
  }

  remove(name) {
    return new Promise((resolve, reject) => {
      this.storage
        .remove(name)
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }

  purge() {
    return new Promise(resolve => {
      this.storage.clear().then(() => resolve());
    });
  }
}
