import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs', component: TabsPage, children: [
      { path: 'settings', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule) },
      { path: 'inicio', loadChildren: () => import('../inicio/inicio.module').then(m => m.InicioPageModule) },
      { path: 'calendar', loadChildren: () => import('../calendar/calendar.module').then(m => m.CalendarPageModule) },
      {
        path: '',
        redirectTo: '/tabs/inicio',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/inicio',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
