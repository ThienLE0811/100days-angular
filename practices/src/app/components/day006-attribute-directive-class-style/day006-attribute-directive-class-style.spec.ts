import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day006AttributeDirectiveClassStyle } from './day006-attribute-directive-class-style';

describe('Day006AttributeDirectiveClassStyle', () => {
  let component: Day006AttributeDirectiveClassStyle;
  let fixture: ComponentFixture<Day006AttributeDirectiveClassStyle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day006AttributeDirectiveClassStyle],
    }).compileComponents();

    fixture = TestBed.createComponent(Day006AttributeDirectiveClassStyle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
