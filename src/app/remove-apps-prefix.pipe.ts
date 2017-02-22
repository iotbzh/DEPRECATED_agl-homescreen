import { Pipe, PipeTransform } from '@angular/core';

// Remove APPS. prefix if translate has failed
@Pipe({
    name: 'removeAppsPrefix'
})

export class RemoveAppsPrefixPipe implements PipeTransform {
  transform(value: string): string {
    // APPS. == 5 characters
    return value.substring(0, 5) == 'APPS.' ? value.substring(5): value;
  }
}