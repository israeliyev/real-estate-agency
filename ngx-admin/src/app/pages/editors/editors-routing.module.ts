import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditorsComponent } from './editors.component';

const routes: Routes = [{
  path: '',
  component: EditorsComponent,
  children: [],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditorsRoutingModule { }

export const routedComponents = [
  EditorsComponent,
];
