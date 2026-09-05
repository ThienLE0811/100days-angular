import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day034TemplateDrivenForms2 } from './day034-template-driven-forms-2';

describe('Day034TemplateDrivenForms2', () => {
  let component: Day034TemplateDrivenForms2;
  let fixture: ComponentFixture<Day034TemplateDrivenForms2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day034TemplateDrivenForms2],
    }).compileComponents();

    fixture = TestBed.createComponent(Day034TemplateDrivenForms2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
