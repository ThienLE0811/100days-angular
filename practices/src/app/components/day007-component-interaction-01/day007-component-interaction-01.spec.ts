import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day007ComponentInteraction01 } from './day007-component-interaction-01';

describe('Day007ComponentInteraction01', () => {
  let component: Day007ComponentInteraction01;
  let fixture: ComponentFixture<Day007ComponentInteraction01>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day007ComponentInteraction01],
    }).compileComponents();

    fixture = TestBed.createComponent(Day007ComponentInteraction01);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
