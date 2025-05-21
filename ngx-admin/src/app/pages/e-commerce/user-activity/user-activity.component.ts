import {Component, Input} from '@angular/core';
import {UserStats} from '../../../model/UserStats';

@Component({
  selector: 'ngx-user-activity',
  styleUrls: ['./user-activity.component.scss'],
  templateUrl: './user-activity.component.html',
})
export class ECommerceUserActivityComponent {

  @Input() data!: {title: string, stats: UserStats[]};
}
