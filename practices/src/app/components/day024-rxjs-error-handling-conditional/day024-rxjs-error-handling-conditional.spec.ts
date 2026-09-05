import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day024RxjsErrorHandlingConditional } from './day024-rxjs-error-handling-conditional';

describe('Day024RxjsErrorHandlingConditional', () => {
  let component: Day024RxjsErrorHandlingConditional;
  let fixture: ComponentFixture<Day024RxjsErrorHandlingConditional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day024RxjsErrorHandlingConditional],
    }).compileComponents();

    fixture = TestBed.createComponent(Day024RxjsErrorHandlingConditional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
