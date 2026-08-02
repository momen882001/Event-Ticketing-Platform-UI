import { Component } from '@angular/core';

@Component({
  selector: 'app-info',
  imports: [],
  templateUrl: './info.html',
  styleUrl: './info.scss'
})
export class InfoComponent {
  protected readonly highlights = [
    {
      title: 'Easy booking',
      text: 'Find a seat and reserve it in a few clear steps.',
    },
    {
      title: 'Secure payments',
      text: 'Checkout stays protected from start to finish.',
    },
    {
      title: 'Instant tickets',
      text: 'Your tickets arrive the moment payment clears.',
    },
  ];
}
