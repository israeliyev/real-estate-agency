import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule, routes} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomePageComponent} from './home-page/home-page.component';
import {FooterComponent} from './footer/footer.component';
import {NavbarComponent} from './navbar/navbar.component';
import {HouseCardComponent} from './house-card/house-card.component';
import {HouseDetailComponent} from './house-detail/house-detail.component';
import {HousesComponent} from './houses/houses.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {ToastrModule} from "ngx-toastr";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material/dialog";
import {RouterModule} from "@angular/router";
import {NgxImageCompressService} from "ngx-image-compress";
import {PriceTypePipe} from "./pipe/pricetypepipe";
import {BasketComponent} from './basket/basket.component';
import {MatPaginatorModule} from "@angular/material/paginator";
import {FingerprintInterceptor} from "./interceptor/fingerprint.interceptor";
import {CapitalizeFirstPipe} from "./pipe/capitalizefirstpipe";

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    FooterComponent,
    NavbarComponent,
    HouseCardComponent,
    HouseDetailComponent,
    HousesComponent,
    PriceTypePipe,
    CapitalizeFirstPipe,
    BasketComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    ToastrModule.forRoot({
      closeButton: true,
      progressBar: true,
    }),
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    FormsModule,
    MatPaginatorModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    NgxImageCompressService,
    {provide: HTTP_INTERCEPTORS, useClass: FingerprintInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
