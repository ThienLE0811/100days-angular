import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day021RxjsTransformation } from './day021-rxjs-transformation';

describe('Day021RxjsTransformation', () => {
  let component: Day021RxjsTransformation;
  let fixture: ComponentFixture<Day021RxjsTransformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day021RxjsTransformation],
    }).compileComponents();

    fixture = TestBed.createComponent(Day021RxjsTransformation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
