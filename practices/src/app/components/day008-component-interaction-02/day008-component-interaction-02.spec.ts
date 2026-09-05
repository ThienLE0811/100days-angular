import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day008ComponentInteraction02 } from './day008-component-interaction-02';

describe('Day008ComponentInteraction02', () => {
  let component: Day008ComponentInteraction02;
  let fixture: ComponentFixture<Day008ComponentInteraction02>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day008ComponentInteraction02],
    }).compileComponents();

    fixture = TestBed.createComponent(Day008ComponentInteraction02);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
