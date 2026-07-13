import {Component, OnInit} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import {AnalyticsService} from '../../../@core/utils';
import {BaseIdNameDto} from '../../../model/BaseIdNameDto';
import {TrackSearchHousesResponse} from '../../../model/TrackSearchHousesResponse';
import {NbToastrService} from '@nebular/theme';

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './smart-table.component.html',
  styleUrls: ['./smart-table.component.scss'],
})
export class SmartTableComponent implements OnInit {
  settings: any = {
    actions: false,
    columns: {},
    pager: {
      display: true,
      perPage: 10,
    },
  };

  source: LocalDataSource = new LocalDataSource();

  constructor( private analyticsService: AnalyticsService, private toaster: NbToastrService) {

  }

  ngOnInit(): void {
    this.getTrackedSearchHouses();
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Silmək istədiyinizə əminsiz?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  getTrackedSearchHouses(): void {
    this.analyticsService.getTrackedSearchHouses().subscribe({
      next: (response: TrackSearchHousesResponse) => {
        this.settings = {
          ...this.settings, // Preserve initial settings (including actions: false)
          columns: {
            count: {
              title: 'Axtarış sayı',
            },
            mainCategoryName: {
              title: 'Əsas Kateqoriya',
            },
            subCategoryName: {
              title: 'Alt Kateqoriya',
            },
            searchQuery: {
              title: 'Axtarış sözü',
            },
            ...this.generateParameterColumns(response.parameters),
          },
          mode: 'external', // Optional: ensures no inline editing
        };
        const tableData = response.filters.map(fil => {
          const row: any = {
            count: fil?.count,
            mainCategoryName: fil?.mainCategoryName,
            subCategoryName: fil?.subCategoryName,
            searchQuery: fil?.searchQuery,
          };

          fil.parameterValues.forEach(pv => {
            row[`param_${pv.id}`] = pv.name;
          });

          return row;
        });

        this.source.load(tableData);
      },
      error: (err: any) => {
        this.toaster.danger('Axtarış Filtrləri Хəta', 'Axtarış filtrləri yüklənən zaman xəta baş verdi!');
        console.error('Error loading tracked search houses:', err);
      },
    });
  }

  generateParameterColumns(parameters: BaseIdNameDto[]): any {
    const columns: any = {};
    parameters.forEach(param => {
      columns[`param_${param.id}`] = {
        title: param.name,
      };
    });
    return columns;
  }
}
