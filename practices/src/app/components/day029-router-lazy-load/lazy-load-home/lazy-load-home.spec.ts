import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LazyLoadHome } from './lazy-load-home';

describe('LazyLoadHome', () => {
  let component: LazyLoadHome;
  let fixture: ComponentFixture<LazyLoadHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LazyLoadHome],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LazyLoadHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
