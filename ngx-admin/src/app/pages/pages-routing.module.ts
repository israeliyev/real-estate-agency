import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { ECommerceComponent } from './e-commerce/e-commerce.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import {HouseDetailComponent} from './house-detail/house-detail.component';
import {GridComponent} from './ui-features/grid/grid.component';
import {SmartTableComponent} from './tables/smart-table/smart-table.component';
import {HousesComponent} from "./houses/houses.component";
import {HouseRequestComponent} from "./house-request/house-request.component";
import {BrokerComponent} from "./broker/broker.component";
import {CategoryManagementComponent} from "./category-management/category-management.component";
import {SectionComponent} from "./section/section.component";
import {LoginComponent} from "./login/login.component";
import {authGuard} from "../@core/guard/auth.guard";
import {loginGuard} from "../@core/guard/login.guard";
import {NotesComponent} from "./notes/notes.component";

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'users',
      component: ECommerceComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'houses/watch',
      component: GridComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'houses/like',
      component: GridComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'category/searching',
      component: SmartTableComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'house',
      component: HouseDetailComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'houses',
      component: HousesComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'house-requests',
      component: HouseRequestComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'house/:houseId',
      component: HouseDetailComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'broker',
      component: BrokerComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'sections',
      component: SectionComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'category-parameters',
      component: CategoryManagementComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'notes',
      component: NotesComponent,
      pathMatch: 'full',
      canActivate: [authGuard],
    },
    {
      path: 'login',
      component: LoginComponent,
      pathMatch: 'full',
      canActivate: [loginGuard],
    },
    {
      path: 'sdfdsfdsfsdf345345435',
      component: CategoryManagementComponent,
      pathMatch: 'full',
    },
    {
      path: 'sdfdsfdsf3432432dvf',
      loadChildren: () => import('./layout/layout.module')
        .then(m => m.LayoutModule),
    },
    {
      path: 'dsfsdfsdfdsfdsf324234',
      loadChildren: () => import('./forms/forms.module')
        .then(m => m.FormsModule),
    },
    {
      path: '23423lk4mlk24nlk2nl',
      loadChildren: () => import('./ui-features/ui-features.module')
        .then(m => m.UiFeaturesModule),
    },
    {
      path: 'lkn2m3lk4n2424l23n42lk34l',
      loadChildren: () => import('./modal-overlays/modal-overlays.module')
        .then(m => m.ModalOverlaysModule),
    },
    {
      path: 'sdlmfsdmfdsklmkl4m3kl5ml',
      loadChildren: () => import('./extra-components/extra-components.module')
        .then(m => m.ExtraComponentsModule),
    },
    {
      path: 'cvvcvccvcvcccbcb',
      loadChildren: () => import('./charts/charts.module')
        .then(m => m.ChartsModule),
    },
    {
      path: 'vnvnbnbnbnbnbnbn',
      loadChildren: () => import('./editors/editors.module')
        .then(m => m.EditorsModule),
    },
    {
      path: 'dsmfgldkfgmlkmlm3m45l3',
      loadChildren: () => import('./tables/tables.module')
        .then(m => m.TablesModule),
    },
    {
      path: 'klmnflkdnmslkfnmdsklf34535',
      loadChildren: () => import('./miscellaneous/miscellaneous.module')
        .then(m => m.MiscellaneousModule),
    },
    {
      path: '',
      redirectTo: 'users',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
