import { Injectable } from '@angular/core';
import { Article } from './article.model';

const ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'feature-module-va-child-routes',
    title: 'Feature Module & Child Routes',
    excerpt: 'Nhóm route liên quan dưới một prefix chung với layout component chứa router-outlet.',
    content:
      'Thay vì khai báo lặp lại "article" và "article/:slug" ở hai route riêng biệt, ta có thể gom chúng vào một route cha "article" với thuộc tính children. Route cha có thể activate một "layout component" — component này bắt buộc phải chứa <router-outlet> để các route con render vào đó. Đây chính là bản chất của Feature Module trong bài viết gốc, chỉ khác là ứng dụng standalone hiện đại không cần NgModule/forChild nữa.',
    publishedAt: '2020-07-13',
  },
  {
    id: '2',
    slug: 'redirect-va-pathmatch',
    title: 'redirectTo & pathMatch: full vs prefix',
    excerpt: 'Vì sao route rỗng luôn cần khai báo pathMatch: "full" khi redirect.',
    content:
      'pathMatch có 2 giá trị: "full" so khớp toàn bộ path còn lại giống toán tử == , còn "prefix" (giá trị mặc định) chỉ cần khớp phần đầu của path. Route rỗng ("") ở trang này được redirect sang "article" với pathMatch: "full" — nếu quên khai báo full, path rỗng sẽ dùng prefix mặc định và có thể khớp nhầm với những path khác, gây redirect loop hoặc sai route.',
    publishedAt: '2020-07-14',
  },
  {
    id: '3',
    slug: 'activatedroute-snapshot-vs-observable',
    title: 'ActivatedRoute: snapshot vs Observable',
    excerpt: 'Component bị Angular Router tái sử dụng khi chuyển giữa các route cùng config.',
    content:
      'Khi điều hướng giữa các route dùng chung một config (ví dụ từ bài viết này sang bài viết khác cùng path ":slug"), Angular Router mặc định sẽ tái sử dụng lại component đã activate thay vì tạo mới. route.snapshot chỉ được đọc đúng một lần lúc component khởi tạo nên sẽ không cập nhật khi component được tái sử dụng. Ngược lại, route.paramMap là một Observable nên sẽ emit giá trị mới mỗi khi route thay đổi, kể cả khi component không bị destroy.',
    publishedAt: '2020-07-15',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  getArticles(): Article[] {
    return ARTICLES;
  }

  getArticleBySlug(slug: string): Article | undefined {
    return ARTICLES.find((article) => article.slug === slug);
  }
}
