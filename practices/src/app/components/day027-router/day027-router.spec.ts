import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day027Router } from './day027-router';

describe('Day027Router', () => {
  let component: Day027Router;
  let fixture: ComponentFixture<Day027Router>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day027Router],
    }).compileComponents();

    fixture = TestBed.createComponent(Day027Router);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
