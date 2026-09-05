import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day022RxjsFiltering } from './day022-rxjs-filtering';

describe('Day022RxjsFiltering', () => {
  let component: Day022RxjsFiltering;
  let fixture: ComponentFixture<Day022RxjsFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day022RxjsFiltering],
    }).compileComponents();

    fixture = TestBed.createComponent(Day022RxjsFiltering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
