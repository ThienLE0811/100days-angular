import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day023RxjsCombination } from './day023-rxjs-combination';

describe('Day023RxjsCombination', () => {
  let component: Day023RxjsCombination;
  let fixture: ComponentFixture<Day023RxjsCombination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day023RxjsCombination],
    }).compileComponents();

    fixture = TestBed.createComponent(Day023RxjsCombination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
