import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
    selector: 'app-skill-tag',
    standalone: true,
    imports: [SvgIconComponent],
    templateUrl: './skill-tag.component.html',
    styleUrl: './skill-tag.component.scss',
})
export class SkillTagComponent {
    @Input({ required: true }) skill!: string;

    @Input() removable = false;
    @Output() remove = new EventEmitter<string>();
  
    @Input() interactive = false;
    @Output() tagClick = new EventEmitter<string>();
  
    onRemove(event: Event) {
        event.stopPropagation();
        this.remove.emit(this.skill);
    }
  
    onClick() {
        if (this.interactive) {
            this.tagClick.emit(this.skill);
        }
    }
}
