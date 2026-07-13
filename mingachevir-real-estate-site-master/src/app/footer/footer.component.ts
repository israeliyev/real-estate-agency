import {Component, OnInit} from '@angular/core';
import {CategoryService} from "../service/CategoryService";
import {HttpStatusCode} from "../util/HttpStatusCode";
import {BrokerDto} from "../models/BrokerDto";
import {HouseService} from "../service/HouseService";
import {ParameterDto} from "../models/ParameterDto";
import {BaseIdNameDto} from "../models/BaseIdNameDto";
import {Router} from "@angular/router";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  brokerInformation: BrokerDto | undefined;
  parameters: ParameterDto[] | [] | undefined;

  constructor(private categoryService: CategoryService, private houseService: HouseService, private router: Router) {
  }

  ngOnInit(): void {
    this.getBrokerInformation();
    this.getParametersValuesForFooter();
  }

  getHouses(parameter: ParameterDto, selectiveParameterValue: BaseIdNameDto) {
    this.router.navigate(["/evler"], {
      queryParams: {
        mainCategoryId: parameter?.mainCategory?.id,
        subCategoryId: parameter?.subCategory?.id,
        selectParameterId: selectiveParameterValue.id
      }
    })
  }

  getBrokerInformation() {
    this.houseService.getBrokerInformation().subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.OK) {
          this.brokerInformation = result.data;
        } else {
          this.brokerInformation = undefined;
          console.warn('Unexpected response status:', result.responseStatus);
        }
      },
      error: (err) => {
        this.brokerInformation = undefined;
        console.error('Error fetching broker information:', err);
      }
    });
  }

  getParametersValuesForFooter() {
    this.categoryService.getParametersValuesForFooter().subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.OK) {
          // Fix 2: guard undefined with ?? []
          this.parameters = (result.data ?? []).slice(0, 5).map(parameter => ({
            ...parameter,
            selectiveParameterValues: (parameter?.selectiveParameterValues ?? []).slice(0, 5)
          }));
        } else {
          this.parameters = [];
          console.error('Error when fetch footer categories');
        }
      },
      error: (err) => {
        this.parameters = [];
        console.error('Error fetching parameters for footer:', err);
      }
    });
  }
}
