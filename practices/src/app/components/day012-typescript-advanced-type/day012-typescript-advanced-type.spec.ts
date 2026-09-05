import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day012TypescriptAdvancedType } from './day012-typescript-advanced-type';

describe('Day012TypescriptAdvancedType', () => {
  let component: Day012TypescriptAdvancedType;
  let fixture: ComponentFixture<Day012TypescriptAdvancedType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day012TypescriptAdvancedType],
    }).compileComponents();

    fixture = TestBed.createComponent(Day012TypescriptAdvancedType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
