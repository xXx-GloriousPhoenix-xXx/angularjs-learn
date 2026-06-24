import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-form-field',
    imports: [],
    standalone: true,
    templateUrl: './form-field.component.html',
    styleUrl: './form-field.component.scss',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => FormFieldComponent),
        multi: true,
    }]
})
export class FormFieldComponent implements ControlValueAccessor {
    @Input() label = '';
    @Input() type: 'text' | 'textarea' = 'text';
    @Input() rows = 4;
  
    value = '';
    disabled = false;

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.value = value ?? '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    
    onInput(value: string): void {
        this.value = value;
        this.onChange(value);
    }
     
    onBlur(): void {
        this.onTouched();
    }
    
}
