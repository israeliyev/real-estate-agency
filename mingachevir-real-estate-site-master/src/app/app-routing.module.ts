import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomePageComponent} from './home-page/home-page.component';
import {HousesComponent} from './houses/houses.component';
import {HouseDetailComponent} from "./house-detail/house-detail.component";
import {BasketComponent} from "./basket/basket.component";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'ana-sehife',
    pathMatch: 'full',
  },
  {
    path: 'ana-sehife',
    component: HomePageComponent,
    pathMatch: 'full',
  },
  {
    path: 'sebet',
    component: BasketComponent,
    pathMatch: 'full',
  },
  {
    path: 'evler',
    component: HousesComponent,
    pathMatch: 'full',
  },
  {
    path: 'ev-haqqinda',
    component: HouseDetailComponent,
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
