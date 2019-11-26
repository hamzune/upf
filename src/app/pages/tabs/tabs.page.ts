import { Component } from '@angular/core';

import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

import { NetworkService } from '../../services/network.service';

import { AdmobFreeService } from '../../service/admobfree.service';

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
    private admobFreeService: AdmobFreeService,
    public toastController: ToastController
  ) {
    this.network = this.networks.statusNetwork.value;
    this.networks.statusNetwork.subscribe(status => {
      this.network = status;
    });
  }

  ngOnInit() {
    this.admobFreeService.BannerAd();
  }
}
