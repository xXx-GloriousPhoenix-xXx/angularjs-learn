import { Component } from '@angular/core';
import { ViewProfileHeaderComponent } from "../../common-ui/view-profile-header/view-profile-header.component";

@Component({
  selector: 'app-view-profile-page',
  imports: [ViewProfileHeaderComponent],
  templateUrl: './view-profile-page.component.html',
  styleUrl: './view-profile-page.component.scss',
})
export class ViewProfilePageComponent {}
