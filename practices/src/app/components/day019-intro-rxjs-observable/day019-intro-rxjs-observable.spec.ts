import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day019IntroRxjsObservable } from './day019-intro-rxjs-observable';

describe('Day019IntroRxjsObservable', () => {
  let component: Day019IntroRxjsObservable;
  let fixture: ComponentFixture<Day019IntroRxjsObservable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day019IntroRxjsObservable],
    }).compileComponents();

    fixture = TestBed.createComponent(Day019IntroRxjsObservable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
