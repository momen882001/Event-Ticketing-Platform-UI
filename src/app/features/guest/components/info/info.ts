import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info',
  imports: [CommonModule],
  templateUrl: './info.html',
  styleUrl: './info.scss'
})
export class InfoComponent {
  protected readonly highlights = [
    {
      icon: 'M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4',
      title: 'Easy booking',
      text: 'Find a seat and reserve it in a few clear steps — no friction, no confusion.',
    },
    {
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
      title: 'Secure payments',
      text: 'Checkout stays encrypted and protected from start to finish.',
    },
    {
      icon: 'M15 5H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2ZM9 9h6M9 13h4',
      title: 'Instant tickets',
      text: 'Your tickets arrive the moment payment clears — ready to show at the gate.',
    },
  ];
}
