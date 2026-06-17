import { Component, Input } from '@angular/core';

@Component({
    selector: 'svg[icon]',
    imports: [],
    template: '<svg:use [attr.href]="href"></svg:use>'
})
export class SvgIconComponent {
    @Input() icon: string = '';
    
    get href() {
        return `/assets/svg/${this.icon}.svg#${this.icon}`;
    }
}
