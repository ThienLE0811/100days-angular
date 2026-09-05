import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day032RouterGuardsResolvers3 } from './day032-router-guards-resolvers-3';

describe('Day032RouterGuardsResolvers3', () => {
  let component: Day032RouterGuardsResolvers3;
  let fixture: ComponentFixture<Day032RouterGuardsResolvers3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day032RouterGuardsResolvers3],
    }).compileComponents();

    fixture = TestBed.createComponent(Day032RouterGuardsResolvers3);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
