import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdownBold',
  standalone: true
})
export class MarkdownBoldPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }
    // Reemplaza **texto** por <strong>texto</strong>
    const parsedText = value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Retornamos como SafeHtml para que el directiva innerHTML no la escape
    return this.sanitizer.bypassSecurityTrustHtml(parsedText);
  }
}
