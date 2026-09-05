import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day043AngularDisableControlDirective } from './day043-angular-disable-control-directive';

describe('Day043AngularDisableControlDirective', () => {
  let component: Day043AngularDisableControlDirective;
  let fixture: ComponentFixture<Day043AngularDisableControlDirective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day043AngularDisableControlDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(Day043AngularDisableControlDirective);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
