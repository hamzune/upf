import { LOCALE_ID,NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { File } from '@ionic-native/file/ngx';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { Network } from '@ionic-native/network/ngx';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


import { ApiService } from './services/api.service';
import { NetworkService } from './services/network.service';
import { ParserHtmlService } from './services/parser-html.service';
import { RequestService } from './services/request.service';
import { StorageService } from './services/storage.service';



import localePy from '@angular/common/locales/es-PY';
import localePt from '@angular/common/locales/pt';
import localeEn from '@angular/common/locales/en';
import localeEsAr from '@angular/common/locales/es-AR';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePy, 'es');
registerLocaleData(localePt, 'pt');
registerLocaleData(localeEn, 'en');
registerLocaleData(localeEsAr, 'es-Ar');

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      rippleEffect: false,
      mode: 'ios'
    }),
    IonicStorageModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    File,
    StatusBar,
    SplashScreen,

    LocalNotifications,

    { provide: LOCALE_ID, useValue: 'es-Ar' },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    HTTP,
    Network,
    ApiService,
    NetworkService,
    ParserHtmlService,
    RequestService,
    StorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
