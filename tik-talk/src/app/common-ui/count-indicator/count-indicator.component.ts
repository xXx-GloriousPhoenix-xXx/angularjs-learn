import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-count-indicator',
    standalone: true,
    imports: [],
    templateUrl: './count-indicator.component.html',
    styleUrl: './count-indicator.component.scss',
})
export class CountIndicatorComponent {
    @Input({ required: true }) count!: number;
    @Input() color: string = 'red';
}
