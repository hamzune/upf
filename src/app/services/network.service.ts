import { Injectable } from '@angular/core';

import { Network } from '@ionic-native/network/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  statusNetwork = new BehaviorSubject<boolean>(false);

  constructor(private network: Network, private statusBar: StatusBar) {
    // Comprobar network status
    if (this.network.type === 'none' || this.network.type === 'unknown') {
      this.statusBar.backgroundColorByHexString('#c8102e');
      this.statusNetwork.next(false);
    } else {
      this.statusBar.backgroundColorByHexString('#ffffff');
      this.statusNetwork.next(true);
    }

    this.network.onDisconnect().subscribe(() => {
      this.statusBar.backgroundColorByHexString('#c8102e');
      this.statusNetwork.next(false);
    });

    this.network.onConnect().subscribe(evt => {
      this.statusNetwork.next(true);
      this.statusBar.backgroundColorByHexString('#ffffff');
    });
  }
}
