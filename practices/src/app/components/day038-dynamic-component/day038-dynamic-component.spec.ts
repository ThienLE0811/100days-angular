import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day038DynamicComponent } from './day038-dynamic-component';

describe('Day038DynamicComponent', () => {
  let component: Day038DynamicComponent;
  let fixture: ComponentFixture<Day038DynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day038DynamicComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Day038DynamicComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
