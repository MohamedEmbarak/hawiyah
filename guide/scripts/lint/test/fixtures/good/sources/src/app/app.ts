import { afterNextRender, Component } from '@angular/core';

@Component({
  selector: 'guide-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    afterNextRender(() => {
      document.documentElement.dataset['ready'] = 'true';
    });
  }
}
