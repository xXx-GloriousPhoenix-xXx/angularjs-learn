import { Component, EventEmitter, Output, inject } from '@angular/core';
import { SvgIconComponent } from "../../../common-ui/svg-icon/svg-icon.component";
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormFieldComponent } from '../../../common-ui/form-field/form-field.component';

@Component({
    selector: 'app-profile-filters',
    imports: [SvgIconComponent, ReactiveFormsModule, FormFieldComponent],
    templateUrl: './profile-filters.component.html',
    styleUrl: './profile-filters.component.scss',
})
export class ProfileFiltersComponent {
    fb = inject(FormBuilder);

    @Output() filtersChange = new EventEmitter<Record<string, any>>();

    searchForm = this.fb.group({
        name: [''],
        registerDate: [''],
        city: [''],
        stack: ['']
    });

    constructor() {
        this.searchForm.valueChanges
            .pipe(
                startWith(this.searchForm.value),
                debounceTime(300),
                takeUntilDestroyed()
            )
            .subscribe(formValue => {
                this.filtersChange.emit(this.cleanParams(formValue));
            });
    }

    private cleanParams(formValue: Record<string, any>): Record<string, any> {
        const cleaned: Record<string, any> = {};
        for (const [key, value] of Object.entries(formValue)) {
            if (value !== null && value !== undefined && value !== '') {
                cleaned[key] = value;
            }
        }
        return cleaned;
    }
}