import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stackList',
    standalone: true,
})
export class StackListPipe implements PipeTransform {
    transform(value: string | string[] | null | undefined): string[] {
        if (!value) return [];
        if (Array.isArray(value)) return value.map(s => s.trim()).filter(Boolean);
        return value.split(',').map(s => s.trim()).filter(Boolean);
    }
}