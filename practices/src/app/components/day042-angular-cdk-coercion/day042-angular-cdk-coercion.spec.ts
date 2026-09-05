import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day042AngularCdkCoercion } from './day042-angular-cdk-coercion';

describe('Day042AngularCdkCoercion', () => {
  let component: Day042AngularCdkCoercion;
  let fixture: ComponentFixture<Day042AngularCdkCoercion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day042AngularCdkCoercion],
    }).compileComponents();

    fixture = TestBed.createComponent(Day042AngularCdkCoercion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
