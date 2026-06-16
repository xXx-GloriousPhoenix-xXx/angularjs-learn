import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileService } from '../../data/services/profile.service';

@Component({
    selector: 'app-sidebar-layout',
    imports: [RouterOutlet],
    templateUrl: './sidebar-layout.component.html',
    styleUrl: './sidebar-layout.component.scss',
})
export class SidebarLayoutComponent {
    profileService = inject(ProfileService);
    ngOnInit() {
        console.log("ngOnInit");
        this.profileService.getMe()
            .subscribe(val => {
                console.log(val);
            });
    }
}
