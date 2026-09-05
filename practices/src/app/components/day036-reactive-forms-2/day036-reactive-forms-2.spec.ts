import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day036ReactiveForms2 } from './day036-reactive-forms-2';

describe('Day036ReactiveForms2', () => {
  let component: Day036ReactiveForms2;
  let fixture: ComponentFixture<Day036ReactiveForms2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day036ReactiveForms2],
    }).compileComponents();

    fixture = TestBed.createComponent(Day036ReactiveForms2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
