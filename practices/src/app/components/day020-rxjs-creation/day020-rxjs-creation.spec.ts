import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day020RxjsCreation } from './day020-rxjs-creation';

describe('Day020RxjsCreation', () => {
  let component: Day020RxjsCreation;
  let fixture: ComponentFixture<Day020RxjsCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day020RxjsCreation],
    }).compileComponents();

    fixture = TestBed.createComponent(Day020RxjsCreation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
