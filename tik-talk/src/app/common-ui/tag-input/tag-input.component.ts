import { Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-tag-input',
    standalone: true,
    templateUrl: './tag-input.component.html',
    styleUrl: './tag-input.component.scss',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TagInputComponent),
        multi: true,
    }]
})
export class TagInputComponent implements ControlValueAccessor {
    @Input() label = '';

    tagList = signal<string[]>([]);
    draft = signal<string>('');
    disabled = signal<boolean>(false);

    private onChange: (value: string[]) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string[]): void {
        this.tagList.set(value ?? []);
    }

    registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }
     
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
     
    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }

    onInput(value: string): void {
        this.draft.set(value);
    }
    
    onBlur(): void {
        this.onTouched();
    }

    onEnter(event: Event) {
        event.preventDefault();

        const newTag = this.draft().trim();
        if (!newTag || this.tagList().includes(newTag)) {
            this.draft.set('');
            return;
        }
      
        const updated = [...this.tagList(), newTag];
        this.tagList.set(updated);
        this.draft.set('');

        this.onChange(updated);
    }

    onBackspace(event: Event) {
        if (this.draft() !== '') {
            return;
        }

        const tags = this.tagList();
        if (tags.length === 0) {
            return;
        }

        event.preventDefault();
        const lastTag = tags[tags.length - 1];
        this.removeTag(lastTag);
    }

    removeTag(tagToRemove: string): void {
        if (this.disabled()) {
            return;
        }
     
        const updated = this.tagList()
            .filter(tag => tag !== tagToRemove);
        this.tagList.set(updated);
        this.onChange(updated);
    }
    
}
