import { Component } from '@angular/core';

import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

import { NetworkService } from '../../services/network.service';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  network = false;

  constructor(
    public navCtrl: NavController,
    private networks: NetworkService,

    public toastController: ToastController
  ) {
    this.network = this.networks.statusNetwork.value;
    this.networks.statusNetwork.subscribe(status => {
      this.network = status;
    });
  }

  ngOnInit() {

  }
}
