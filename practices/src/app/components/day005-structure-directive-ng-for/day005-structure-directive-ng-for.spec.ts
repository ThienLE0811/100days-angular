import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day005StructureDirectiveNgFor } from './day005-structure-directive-ng-for';

describe('Day005StructureDirectiveNgFor', () => {
  let component: Day005StructureDirectiveNgFor;
  let fixture: ComponentFixture<Day005StructureDirectiveNgFor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day005StructureDirectiveNgFor],
    }).compileComponents();

    fixture = TestBed.createComponent(Day005StructureDirectiveNgFor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
