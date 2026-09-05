import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day004StructureDirectiveIfElse } from './day004-structure-directive-if-else';

describe('Day004StructureDirectiveIfElse', () => {
  let component: Day004StructureDirectiveIfElse;
  let fixture: ComponentFixture<Day004StructureDirectiveIfElse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day004StructureDirectiveIfElse],
    }).compileComponents();

    fixture = TestBed.createComponent(Day004StructureDirectiveIfElse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
