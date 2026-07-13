import {Component, Input} from '@angular/core';


@Component({
  selector: 'ngx-progress-section',
  styleUrls: ['./progress-section.component.scss'],
  templateUrl: './progress-section.component.html',
})
export class ECommerceProgressSectionComponent {
  @Input() totalUsers!: number;
  @Input() newUsers!: number;
  @Input() oldUsers!: number;
}
