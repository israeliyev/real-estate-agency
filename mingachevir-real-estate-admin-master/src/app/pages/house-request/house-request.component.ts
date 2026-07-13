import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {OrderEnum} from "../../model/base/OrderEnum";
import {HttpStatusCode} from "@angular/common/http";
import {HouseService} from "../../@core/utils/house.service";
import {BaseHouseRequestDto} from "../../model/BaseHouseRequestDto";
import {NbToastrService} from "@nebular/theme";
import {HouseRequestDto} from "../../model/HouseRequestDto";
import {HouseDto} from "../../model/HouseDto";
import {BaseIdNameValue} from "../../model/BaseIdNameValue";


@Component({
  selector: 'ngx-house-request',
  templateUrl: './house-request.component.html',
  styleUrls: ['./house-request.component.scss'],
})
export class HouseRequestComponent implements OnInit {

  houses: HouseRequestDto[] = [];
  priceParameter: BaseIdNameValue = {};
  locationParameter: BaseIdNameValue = {};
  inputParameters: BaseIdNameValue[] = [];
  selectParameters: BaseIdNameValue[] = [];

  readonly OrderEnum = OrderEnum;

  public filterSubject = new Subject<void>();
  loading: boolean | undefined = true;

  constructor(
    private houseService: HouseService,
    private router: Router,
    private toaster: NbToastrService,
  ) {
  }

  ngOnInit(): void {
    this.fetchFilteredHouses();
  }

  removeHouseRequest(houseRequestId: number, forSave: boolean): void {
    this.houseService.deleteHouseRequest(houseRequestId, forSave).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.Ok) {
          this.toaster.success('Uğurla silindi');
          window.location.reload();
        } else {
          this.toaster.danger('Ev istəyi silinən zaman xəta baş verdi', 'Xəta');
        }
      },
      error: (error) => {
        console.error(error);
        this.toaster.danger('Ev istəyi silinən zaman xəta baş verdi', 'Xəta');
      },
    });
  }

  fetchFilteredHouses(): void {
    this.loading = true;
    this.houseService.getHouseRequestes().subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.Ok && response.data) {
          this.houses = response.data;
          this.loading = false;
        } else {
          this.toaster.danger('Evləri yükləmək alınmadı', 'Xəta');
          this.houses = [];
          this.loading = false;
        }
      },
      error: (err) => {
        this.toaster.danger('Evləri yükləmək alınmadı', 'Xəta');
        console.error('Error fetching houses:', err);
        this.houses = [];
        this.loading = false;
      },
    });
  }

  save(request: HouseRequestDto) {
    const houseDto: HouseDto = {
      id: 0,
      name: `${request.subCategory.name} - ${request.location}`,
      description: null,
      price: request.price,
      priceType: request.priceType,
      location: request.location,
      createDate: request.createDate,
      coverImage: request.coverImage ? request.coverImage :
        request.houseImages.length > 0 ? request.houseImages[0].path : '',
      updateDate: null,
      mainCategory: {id: request?.mainCategory?.id},
      subCategory: {id: request?.subCategory?.id},
      houseImages: request.houseImages.map(img => ({
        ...img,
      })),
      selectiveParameters: request.selectiveParameters.map(sp => ({...sp})),
      inputParameters: request.inputParameters.map(ip => ({...ip})),
    };
    this.houseService.createHouse(houseDto).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.Ok) {
          this.toaster.success('Ev qeydə alındı', 'Uğur');
          this.removeHouseRequest(request?.id, true);
        } else {
          this.toaster.danger('Ev qeydə alınmadı', 'Xəta');
        }
      },
      error: (err) => {
        this.toaster.danger('Xəta baş verdi: ' + err.message, 'Xəta');
        console.error('House creation error:', err);
      },
    });
  }
}
