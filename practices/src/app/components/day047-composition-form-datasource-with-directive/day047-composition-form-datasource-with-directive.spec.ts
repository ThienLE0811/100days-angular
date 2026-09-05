import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day047CompositionFormDatasourceWithDirective } from './day047-composition-form-datasource-with-directive';

describe('Day047CompositionFormDatasourceWithDirective', () => {
  let component: Day047CompositionFormDatasourceWithDirective;
  let fixture: ComponentFixture<Day047CompositionFormDatasourceWithDirective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day047CompositionFormDatasourceWithDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(Day047CompositionFormDatasourceWithDirective);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
