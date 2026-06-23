import { Component, inject, signal } from '@angular/core';
import { ProfileService } from '../../data/services/profile.service';
import { ProfileCardComponent } from '../../common-ui/profile-card/profile-card';
import { ProfileFiltersComponent } from "./profile-filters/profile-filters.component";

@Component({
    selector: 'app-search-page',
    imports: [
        ProfileCardComponent,
        ProfileFiltersComponent
    ],
    templateUrl: './search-page.component.html',
    styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
    profileService = inject(ProfileService);
    profiles = this.profileService.filteredProfiles;

    pageNum = signal(1);
    private currentFilters: Record<string, any> = {};

    onFiltersChange(filters: Record<string, any>) {
        this.currentFilters = filters;
        this.pageNum.set(1);
        this.search();
    }

    goToPage(page: number) {
        this.pageNum.set(page);
        this.search();
    }

    private search() {
        this.profileService.filterProfiles({
            ...this.currentFilters,
            pageNum: this.pageNum(),
        }).subscribe();
    }
}