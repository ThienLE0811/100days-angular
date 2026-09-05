import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day033TemplateDrivenForms } from './day033-template-driven-forms';

describe('Day033TemplateDrivenForms', () => {
  let component: Day033TemplateDrivenForms;
  let fixture: ComponentFixture<Day033TemplateDrivenForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day033TemplateDrivenForms],
    }).compileComponents();

    fixture = TestBed.createComponent(Day033TemplateDrivenForms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
