import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { HouseService } from '../../@core/utils/house.service';
import { BrokerDto } from '../../model/BrokerDto';
import {NbToastrService} from "@nebular/theme";

@Component({
  selector: 'ngx-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss'],
})
export class BrokerComponent implements OnInit {
  brokerInformation: BrokerDto | null;
  requestBrokerInformation: BrokerDto | null;

  firstForm: UntypedFormGroup;
  secondForm: UntypedFormGroup;
  thirdForm: UntypedFormGroup;
  fourthForm: UntypedFormGroup;
  protected error: string;

  constructor(
    private fb: UntypedFormBuilder,
    private houseService: HouseService,
    private toaster: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.getBrokerInformation();
  }

  initializeForms(): void {
    this.firstForm = this.fb.group({
      firstCtrl: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
    });

    this.secondForm = this.fb.group({
      secondCtrl: ['', [Validators.required, Validators.maxLength(100)]],
    });

    this.thirdForm = this.fb.group({
      thirdCtrl: ['', [
        Validators.required,
        Validators.maxLength(50),
      ]],
    });

    this.fourthForm = this.fb.group({
      facebook: ['', [Validators.maxLength(200)]],
      instagram: ['', [Validators.maxLength(200)]],
      tiktok: ['', [Validators.maxLength(200)]],
    });
  }

  onFirstSubmit(): void {
    if (this.firstForm.invalid) {
      this.toaster.danger('E-poçt düzgün daxil edilməyib!', 'Xəta');
      return;
    }
    this.firstForm.markAsDirty();
  }

  onSecondSubmit(): void {
    if (this.secondForm.invalid) {
      this.toaster.danger('Bölgə düzgün daxil edilməyib!', 'Xəta');
      return;
    }
    this.secondForm.markAsDirty();
  }

  onThirdSubmit(): void {
    if (this.thirdForm.invalid) {
      this.toaster.danger('Telefon nömrəsi düzgün daxil edilməyib! Nümunə: 070 123 45 67', 'Xəta');
      return;
    }
    this.thirdForm.markAsDirty();
  }

  onFourthSubmit(): void {
    if (this.fourthForm.invalid) {
      this.toaster.danger('Sosial media linkləri düzgün daxil edilməyib!', 'Xəta');
      return;
    }
    this.fourthForm.markAsDirty();
  }

  saveBrokerInformations(): void {
    if (this.firstForm.invalid || this.secondForm.invalid || this.thirdForm.invalid || this.fourthForm.invalid) {
      this.toaster.danger('Bütün məlumatları düzgün daxil edin!', 'Xəta');
      return;
    }

    this.requestBrokerInformation = {
      email: this.firstForm.get('firstCtrl')?.value,
      location: this.secondForm.get('secondCtrl')?.value,
      phone: this.thirdForm.get('thirdCtrl')?.value,
      facebook: this.fourthForm.get('facebook')?.value || null,
      instagram: this.fourthForm.get('instagram')?.value || null,
      tiktok: this.fourthForm.get('tiktok')?.value || null,
    };

    this.houseService.saveBrokerInformation(this.requestBrokerInformation).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.Ok) {
          this.toaster.success('Makler məlumatları uğurla qeyd olundu!', 'Uğur');
          this.brokerInformation = { ...this.requestBrokerInformation };
        } else {
          this.toaster.danger('Makler məlumatları qeyd olunmadı. Xəta baş verdi!', 'Xəta');
          this.error = 'Makler məlumatları qeyd olunmadı. Xəta baş verdi!';
        }
      },
      error: (err) => {
        this.error = 'Makler məlumatları qeyd olunmadı. Xəta baş verdi!';
        console.error('Error saving broker information:', err);
        this.toaster.danger('Makler məlumatları qeyd olunmadı. Xəta baş verdi!', 'Xəta');
      },
    });
    this.getBrokerInformation();
  }

  getBrokerInformation(): void {
    this.houseService.getBrokerInformation().subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.Ok && result.data) {
          this.brokerInformation = result.data;
        } else {
          this.brokerInformation = null;
          this.toaster.danger('Makler məlumatları yüklənə bilmədi!', 'Xəta');
        }
      },
      error: (err) => {
        console.error('Error fetching broker information:', err);
        this.toaster.danger('Makler məlumatları yüklənə bilmədi!', 'Xəta');
      },
    });
  }
}
