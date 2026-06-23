import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../data/services/confirm-dialog.service';

@Component({
    selector: 'app-confirm-dialog',
    imports: [],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
    dialog = inject(ConfirmDialogService);
    
}
