import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day009TwoWayBinding } from './day009-two-way-binding';

describe('Day009TwoWayBinding', () => {
  let component: Day009TwoWayBinding;
  let fixture: ComponentFixture<Day009TwoWayBinding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day009TwoWayBinding],
    }).compileComponents();

    fixture = TestBed.createComponent(Day009TwoWayBinding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
