import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DAYS_DATA, DayItem } from './days.data';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly search = signal('');
  readonly days = signal<DayItem[]>(DAYS_DATA);

  readonly filteredDays = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.days();
    return this.days().filter(
      d =>
        d.fullName.toLowerCase().includes(q) ||
        `day ${d.dayNum}`.includes(q) ||
        d.path.includes(q)
    );
  });

  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.search.set(val);
  }
}
