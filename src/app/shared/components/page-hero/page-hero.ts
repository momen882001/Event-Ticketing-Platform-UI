import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-page-hero',
  standalone: true,
  templateUrl: './page-hero.html',
  styleUrl: './page-hero.scss',
})
export class PageHero {
  badge = input.required<string>();
  badgeIcon = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
  buttonText = input<string>('');
  buttonIcon = input<string>('');
  action = output<void>();

  onAction() {
    this.action.emit();
  }
}
