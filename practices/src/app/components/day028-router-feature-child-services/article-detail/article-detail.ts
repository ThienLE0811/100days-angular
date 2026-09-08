import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ArticleService } from '../article.service';

@Component({
  selector: 'app-day028-article-detail',
  imports: [],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.scss',
})
export class ArticleDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);

  readonly snapshotSlug = this.route.snapshot.paramMap.get('slug') ?? '';
  readonly snapshotArticle = this.articleService.getArticleBySlug(this.snapshotSlug);

  readonly observableSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: this.snapshotSlug },
  );

  readonly observableArticle = computed(() => this.articleService.getArticleBySlug(this.observableSlug()));
}
