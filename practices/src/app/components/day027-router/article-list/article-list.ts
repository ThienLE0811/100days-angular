import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../article.service';

@Component({
  selector: 'app-day027-article-list',
  imports: [RouterLink],
  templateUrl: './article-list.html',
  styleUrl: './article-list.scss',
})
export class ArticleList {
  private readonly articleService = inject(ArticleService);

  readonly articles = toSignal(this.articleService.getArticles(), { initialValue: [] });
}
