import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day039MicroFrontends } from './day039-micro-frontends';

describe('Day039MicroFrontends', () => {
  let component: Day039MicroFrontends;
  let fixture: ComponentFixture<Day039MicroFrontends>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day039MicroFrontends],
    }).compileComponents();

    fixture = TestBed.createComponent(Day039MicroFrontends);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
