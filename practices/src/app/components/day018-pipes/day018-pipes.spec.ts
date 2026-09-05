import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day018Pipes } from './day018-pipes';

describe('Day018Pipes', () => {
  let component: Day018Pipes;
  let fixture: ComponentFixture<Day018Pipes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day018Pipes],
    }).compileComponents();

    fixture = TestBed.createComponent(Day018Pipes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
