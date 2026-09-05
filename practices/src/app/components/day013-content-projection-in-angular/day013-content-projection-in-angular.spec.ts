import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day013ContentProjectionInAngular } from './day013-content-projection-in-angular';

describe('Day013ContentProjectionInAngular', () => {
  let component: Day013ContentProjectionInAngular;
  let fixture: ComponentFixture<Day013ContentProjectionInAngular>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day013ContentProjectionInAngular],
    }).compileComponents();

    fixture = TestBed.createComponent(Day013ContentProjectionInAngular);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
