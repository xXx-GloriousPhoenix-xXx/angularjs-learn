import { Component, Input, signal } from '@angular/core';
import { SvgIconComponent } from "../../../common-ui/svg-icon/svg-icon.component";
import { DndDirective } from "../../../common-ui/directives/dnd.directive";
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-avatar-upload',
    imports: [SvgIconComponent, DndDirective, FormsModule],
    templateUrl: './avatar-upload.component.html',
    styleUrl: './avatar-upload.component.scss',
})
export class AvatarUploadComponent {
    @Input() initialUrl: string | null = null;
    preview = signal<string>("/assets/images/avatar-placeholder.png");
    avatar = signal<File | null>(null);

    ngOnInit() {
        this.preview.set(this.initialUrl || "/assets/images/avatar-placeholder.png");
    }

    fileBrowserHandler(e: Event) {
        const file = (e.target as HTMLInputElement)?.files?.[0];
        this.processFile(file);
    }
    onFileDropped(file: File) {
        this.processFile(file);
    }
    processFile(file: File | null | undefined) {
        if (!file || !file.type.match('image')) return;
        const reader = new FileReader();
        reader.onload = event => {
            this.preview.set(event.target?.result?.toString() ?? '');
        }
        reader.readAsDataURL(file);
        this.avatar.set(file);
        console.debug(this.avatar);
    }
    reset() {
        this.avatar.set(null);
        this.preview.set(this.initialUrl || "/assets/images/avatar-placeholder.png");
    }
}
