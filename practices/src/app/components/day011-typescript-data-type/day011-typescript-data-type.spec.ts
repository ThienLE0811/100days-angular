import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day011TypescriptDataType } from './day011-typescript-data-type';

describe('Day011TypescriptDataType', () => {
  let component: Day011TypescriptDataType;
  let fixture: ComponentFixture<Day011TypescriptDataType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day011TypescriptDataType],
    }).compileComponents();

    fixture = TestBed.createComponent(Day011TypescriptDataType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
