import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day017ContentchildContentchildren } from './day017-contentchild-contentchildren';

describe('Day017ContentchildContentchildren', () => {
  let component: Day017ContentchildContentchildren;
  let fixture: ComponentFixture<Day017ContentchildContentchildren>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day017ContentchildContentchildren],
    }).compileComponents();

    fixture = TestBed.createComponent(Day017ContentchildContentchildren);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
