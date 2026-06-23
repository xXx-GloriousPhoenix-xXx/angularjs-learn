import { Service, signal } from '@angular/core';
import { ConfirmDialogState } from '../interfaces/confirm-dialog-state.interface';
import { ConfirmDialogConfig } from '../interfaces/confirm-dialog-config.interface';

const DEFAULT_STATE: ConfirmDialogState = {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
};

@Service()
export class ConfirmDialogService {
    state = signal<ConfirmDialogState>(DEFAULT_STATE);
 
    private resolver: ((result: boolean) => void) | null = null;
 
    /**
     * Opens the confirm dialog. Resolves to true if the user confirmed,
     * false if they cancelled or dismissed it (e.g. clicked the backdrop).
     */
    confirm(config: ConfirmDialogConfig): Promise<boolean> {
        this.state.set({
            isOpen: true,
            title: config.title,
            message: config.message,
            confirmText: config.confirmText ?? 'Confirm',
            cancelText: config.cancelText ?? 'Cancel',
        });
 
        return new Promise<boolean>(resolve => {
            this.resolver = resolve;
        });
    }
 
    onConfirm() {
        this.resolver?.(true);
        this.close();
    }
 
    onCancel() {
        this.resolver?.(false);
        this.close();
    }
 
    private close() {
        this.state.set(DEFAULT_STATE);
        this.resolver = null;
    }
}
