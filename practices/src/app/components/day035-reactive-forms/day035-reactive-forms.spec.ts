import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day035ReactiveForms } from './day035-reactive-forms';

describe('Day035ReactiveForms', () => {
  let component: Day035ReactiveForms;
  let fixture: ComponentFixture<Day035ReactiveForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day035ReactiveForms],
    }).compileComponents();

    fixture = TestBed.createComponent(Day035ReactiveForms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
