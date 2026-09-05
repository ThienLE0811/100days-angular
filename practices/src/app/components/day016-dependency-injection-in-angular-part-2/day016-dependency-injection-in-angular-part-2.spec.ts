import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day016DependencyInjectionInAngularPart2 } from './day016-dependency-injection-in-angular-part-2';

describe('Day016DependencyInjectionInAngularPart2', () => {
  let component: Day016DependencyInjectionInAngularPart2;
  let fixture: ComponentFixture<Day016DependencyInjectionInAngularPart2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day016DependencyInjectionInAngularPart2],
    }).compileComponents();

    fixture = TestBed.createComponent(Day016DependencyInjectionInAngularPart2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
