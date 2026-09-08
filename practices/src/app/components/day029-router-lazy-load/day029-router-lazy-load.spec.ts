import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Day029RouterLazyLoad } from './day029-router-lazy-load';

describe('Day029RouterLazyLoad', () => {
  let component: Day029RouterLazyLoad;
  let fixture: ComponentFixture<Day029RouterLazyLoad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day029RouterLazyLoad],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Day029RouterLazyLoad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
