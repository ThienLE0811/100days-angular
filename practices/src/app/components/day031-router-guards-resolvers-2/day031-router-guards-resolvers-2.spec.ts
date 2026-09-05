import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day031RouterGuardsResolvers2 } from './day031-router-guards-resolvers-2';

describe('Day031RouterGuardsResolvers2', () => {
  let component: Day031RouterGuardsResolvers2;
  let fixture: ComponentFixture<Day031RouterGuardsResolvers2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day031RouterGuardsResolvers2],
    }).compileComponents();

    fixture = TestBed.createComponent(Day031RouterGuardsResolvers2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
