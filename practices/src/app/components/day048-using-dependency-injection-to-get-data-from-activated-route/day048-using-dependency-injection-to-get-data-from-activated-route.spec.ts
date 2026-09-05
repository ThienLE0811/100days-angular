import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day048UsingDependencyInjectionToGetDataFromActivatedRoute } from './day048-using-dependency-injection-to-get-data-from-activated-route';

describe('Day048UsingDependencyInjectionToGetDataFromActivatedRoute', () => {
  let component: Day048UsingDependencyInjectionToGetDataFromActivatedRoute;
  let fixture: ComponentFixture<Day048UsingDependencyInjectionToGetDataFromActivatedRoute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day048UsingDependencyInjectionToGetDataFromActivatedRoute],
    }).compileComponents();

    fixture = TestBed.createComponent(Day048UsingDependencyInjectionToGetDataFromActivatedRoute);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
