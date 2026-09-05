import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day015IntroductionDependencyInjectionInAngular } from './day015-introduction-dependency-injection-in-angular';

describe('Day015IntroductionDependencyInjectionInAngular', () => {
  let component: Day015IntroductionDependencyInjectionInAngular;
  let fixture: ComponentFixture<Day015IntroductionDependencyInjectionInAngular>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day015IntroductionDependencyInjectionInAngular],
    }).compileComponents();

    fixture = TestBed.createComponent(Day015IntroductionDependencyInjectionInAngular);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
