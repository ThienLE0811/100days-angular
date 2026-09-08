import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { ArticleService } from '../article.service';

@Component({
  selector: 'app-day027-article-detail',
  imports: [RouterLink],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.scss',
})
export class ArticleDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);

  readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: '',
  });

  readonly article = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => this.articleService.getArticleBySlug(params.get('slug') ?? '')),
    ),
    { initialValue: undefined },
  );
}
