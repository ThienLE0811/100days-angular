import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day045AngularObservableSubscriptionUnsubscribe } from './day045-angular-observable-subscription-unsubscribe';

describe('Day045AngularObservableSubscriptionUnsubscribe', () => {
  let component: Day045AngularObservableSubscriptionUnsubscribe;
  let fixture: ComponentFixture<Day045AngularObservableSubscriptionUnsubscribe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day045AngularObservableSubscriptionUnsubscribe],
    }).compileComponents();

    fixture = TestBed.createComponent(Day045AngularObservableSubscriptionUnsubscribe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
