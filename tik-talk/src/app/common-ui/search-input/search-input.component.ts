import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { SvgIconComponent } from "../svg-icon/svg-icon.component";

@Component({
    selector: 'app-search-input',
    imports: [SvgIconComponent],
    templateUrl: './search-input.component.html',
    styleUrl: './search-input.component.scss',
})
export class SearchInputComponent {
    @Input() placeholder: string = 'Search...';
    @Output() valueChange = new EventEmitter<string>();

    value = signal('');

    onInput(newValue: string): void {
        this.value.set(newValue);
        this.valueChange.emit(newValue);
    }
}
