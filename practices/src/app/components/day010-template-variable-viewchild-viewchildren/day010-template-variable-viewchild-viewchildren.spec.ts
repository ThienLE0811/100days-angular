import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day010TemplateVariableViewchildViewchildren } from './day010-template-variable-viewchild-viewchildren';

describe('Day010TemplateVariableViewchildViewchildren', () => {
  let component: Day010TemplateVariableViewchildViewchildren;
  let fixture: ComponentFixture<Day010TemplateVariableViewchildViewchildren>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day010TemplateVariableViewchildViewchildren],
    }).compileComponents();

    fixture = TestBed.createComponent(Day010TemplateVariableViewchildViewchildren);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
