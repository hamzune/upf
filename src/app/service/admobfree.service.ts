import { Injectable } from '@angular/core';
import {
  AdMobFree,
  AdMobFreeBannerConfig
} from '@ionic-native/admob-free/ngx';
import { Platform } from '@ionic/angular';


@Injectable()
export class AdmobFreeService {

  constructor(
    private admobFree: AdMobFree,
    public platform: Platform
  ) { }

  BannerAd() {
    const bannerConfig: AdMobFreeBannerConfig = {
      autoShow: true,
      id: 'ca-app-pub-1947668841995615/8639370710'
    };

    this.admobFree.banner.config(bannerConfig);

    this.admobFree.banner
      .prepare()
      .then(() => { })
      .catch(e => alert(e));
  }
}
