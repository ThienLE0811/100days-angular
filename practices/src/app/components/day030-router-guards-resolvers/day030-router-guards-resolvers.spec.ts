import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day030RouterGuardsResolvers } from './day030-router-guards-resolvers';

describe('Day030RouterGuardsResolvers', () => {
  let component: Day030RouterGuardsResolvers;
  let fixture: ComponentFixture<Day030RouterGuardsResolvers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day030RouterGuardsResolvers],
    }).compileComponents();

    fixture = TestBed.createComponent(Day030RouterGuardsResolvers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
