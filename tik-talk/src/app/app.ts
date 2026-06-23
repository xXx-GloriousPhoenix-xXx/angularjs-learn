import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from './common-ui/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet, ConfirmDialogComponent
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {

}
