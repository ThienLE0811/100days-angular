import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface AdminArticle {
  id: string;
  title: string;
  status: 'draft' | 'published';
}

@Component({
  selector: 'app-day029-admin-panel',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel {
  readonly articles = signal<AdminArticle[]>([
    { id: '1', title: 'Feature Module & Child Routes', status: 'published' },
    { id: '2', title: "redirectTo & pathMatch: full vs prefix", status: 'published' },
    { id: '3', title: 'ActivatedRoute: snapshot vs Observable', status: 'draft' },
  ]);

  readonly editingId = signal<string | null>(null);

  readonly editForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  startEdit(article: AdminArticle): void {
    this.editingId.set(article.id);
    this.editForm.setValue({ title: article.title });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(id: string): void {
    if (this.editForm.invalid) return;

    const newTitle = this.editForm.getRawValue().title;
    this.articles.update((list) => list.map((article) => (article.id === id ? { ...article, title: newTitle } : article)));
    this.editingId.set(null);
  }

  toggleStatus(id: string): void {
    this.articles.update((list) =>
      list.map((article) =>
        article.id === id ? { ...article, status: article.status === 'published' ? 'draft' : 'published' } : article,
      ),
    );
  }

  deleteArticle(id: string): void {
    this.articles.update((list) => list.filter((article) => article.id !== id));
  }
}
