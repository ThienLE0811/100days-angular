import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { ArticleService } from '../article.service';

type SortMode = 'title' | 'date';

@Component({
  selector: 'app-day028-article-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './article-layout.html',
  styleUrl: './article-layout.scss',
})
export class ArticleLayout {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);

  readonly sortMode = toSignal(
    this.route.queryParamMap.pipe(map((params) => (params.get('sort') as SortMode) ?? 'title')),
    { initialValue: 'title' as SortMode },
  );

  readonly articles = computed(() => {
    const list = [...this.articleService.getArticles()];
    return this.sortMode() === 'date'
      ? list.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
      : list.sort((a, b) => a.title.localeCompare(b.title));
  });

  readonly navigationLog = signal<string[]>([]);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.navigationLog.update((log) => [event.urlAfterRedirects, ...log].slice(0, 6));
      });
  }

  setSort(mode: SortMode): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: mode },
      queryParamsHandling: 'merge',
    });
  }

  goToFirstArticle(): void {
    const first = this.articles()[0];
    if (first) {
      this.router.navigate(['.', first.slug], {
        relativeTo: this.route,
        queryParamsHandling: 'preserve',
      });
    }
  }
}
