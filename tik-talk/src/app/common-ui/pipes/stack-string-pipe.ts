import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stackString',
    standalone: true,
})
export class StackStringPipe implements PipeTransform {
    transform(value: string | string[] | null | undefined): string {
        if (!value) return '';
        if (Array.isArray(value)) return value.join(', ');
        return value;
    }
}