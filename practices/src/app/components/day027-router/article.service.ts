import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Article } from './article.model';

const ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'gioi-thieu-angular-router',
    title: 'Giới thiệu Angular Router',
    excerpt: 'Vì sao ứng dụng SPA cần Router để biết đang hiển thị view nào.',
    content:
      'Với ứng dụng Single Page Application, mỗi khi bạn tương tác thì trình duyệt không reload lại toàn bộ trang như mô hình server side rendering (postback). Angular Router chính là thứ giúp ứng dụng biết được người dùng đang muốn xem view nào dựa vào URL, và load đúng component tương ứng vào <router-outlet>.',
  },
  {
    id: '2',
    slug: 'router-outlet-va-router-link',
    title: '<router-outlet> và routerLink',
    excerpt: 'Hai directive không thể thiếu khi làm việc với Angular Router.',
    content:
      'routerLink được gán trên thẻ <a> để khai báo URL sẽ điều hướng tới, thay cho href thông thường. <router-outlet> là nơi Angular Router render component tương ứng với route đang active. Component article-list và article-detail mà bạn đang xem chính là được load thông qua <router-outlet> đặt trong component Day027Router.',
  },
  {
    id: '3',
    slug: 'lay-tham-so-tu-url',
    title: 'Lấy tham số động từ URL với ActivatedRoute',
    excerpt: 'Cách khai báo route param :slug và đọc giá trị của nó trong component.',
    content:
      'Khi khai báo route với path dạng ":slug", Angular Router cho phép bạn định nghĩa một parameter động trên URL. Trong component tương ứng, inject ActivatedRoute rồi đọc paramMap để lấy giá trị slug, từ đó truy vấn đúng dữ liệu cần hiển thị. Nhờ vậy URL có thể copy, chia sẻ hoặc reload mà vẫn hiển thị đúng nội dung.',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  getArticles(): Observable<Article[]> {
    return of(ARTICLES).pipe(delay(300));
  }

  getArticleBySlug(slug: string): Observable<Article | undefined> {
    return of(ARTICLES.find((article) => article.slug === slug));
  }
}
