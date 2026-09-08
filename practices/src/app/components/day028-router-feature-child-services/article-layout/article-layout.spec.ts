import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ArticleLayout } from './article-layout';

describe('ArticleLayout', () => {
  let component: ArticleLayout;
  let fixture: ComponentFixture<ArticleLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleLayout],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
