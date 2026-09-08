import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Day028RouterFeatureChildServices } from './day028-router-feature-child-services';

describe('Day028RouterFeatureChildServices', () => {
  let component: Day028RouterFeatureChildServices;
  let fixture: ComponentFixture<Day028RouterFeatureChildServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day028RouterFeatureChildServices],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Day028RouterFeatureChildServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
