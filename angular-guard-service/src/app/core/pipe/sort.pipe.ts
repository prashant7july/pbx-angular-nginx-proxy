import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
  pure: true
})
export class SortByPipe implements PipeTransform {

  transform(value: any[], propertyName: string): any[] {
    if (propertyName)
      return value.sort((b: any, a: any) => b[propertyName].localeCompare(a[propertyName]));
    else
      return value;
  }

}