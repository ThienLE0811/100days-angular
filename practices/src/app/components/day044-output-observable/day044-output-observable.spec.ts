import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day044OutputObservable } from './day044-output-observable';

describe('Day044OutputObservable', () => {
  let component: Day044OutputObservable;
  let fixture: ComponentFixture<Day044OutputObservable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day044OutputObservable],
    }).compileComponents();

    fixture = TestBed.createComponent(Day044OutputObservable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
