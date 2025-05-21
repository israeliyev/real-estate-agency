import { NgModule } from '@angular/core';
import {
  NbButtonModule,
  NbCardModule,
  NbInputModule,
  NbMenuModule,
  NbOptionModule,
  NbSelectModule, NbStepperModule,
} from '@nebular/theme';
import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { ECommerceModule } from './e-commerce/e-commerce.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { HouseDetailComponent } from './house-detail/house-detail.component';
import { HousesComponent } from './houses/houses.component';
import { HouseRequestComponent } from './house-request/house-request.component';
import { BrokerComponent } from './broker/broker.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CategoryManagementComponent } from './category-management/category-management.component';
import {PriceTypePipe} from '../@core/utils/price-type.pipe';
import { SectionComponent } from './section/section.component';
import { LoginComponent } from './login/login.component';
import { NotesComponent } from './notes/notes.component';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    ECommerceModule,
    MiscellaneousModule,
    NbCardModule,
    NbInputModule,
    NbOptionModule,
    NbSelectModule,
    NbButtonModule,
    NbStepperModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [
    PagesComponent,
    HouseDetailComponent,
    HousesComponent,
    HouseRequestComponent,
    BrokerComponent,
    CategoryManagementComponent,
    PriceTypePipe,
    SectionComponent,
    LoginComponent,
    NotesComponent,
  ],
})
export class PagesModule {
}
