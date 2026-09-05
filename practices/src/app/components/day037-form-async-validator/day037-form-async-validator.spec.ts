import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day037FormAsyncValidator } from './day037-form-async-validator';

describe('Day037FormAsyncValidator', () => {
  let component: Day037FormAsyncValidator;
  let fixture: ComponentFixture<Day037FormAsyncValidator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day037FormAsyncValidator],
    }).compileComponents();

    fixture = TestBed.createComponent(Day037FormAsyncValidator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
