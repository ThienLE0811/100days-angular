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
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create Day019IntroRxjsObservable component', () => {
    expect(component).toBeTruthy();
    expect(component.coreConcepts.length).toBe(6);
  });

  describe('Throttle Logic (Pure JS vs RxJS)', () => {
    it('should throttle Pure JS clicks according to 500ms rate', () => {
      component.resetThrottleStats();
      expect(component.pureJsRawClicks).toBe(0);
      expect(component.pureJsExecutedCount).toBe(0);

      // Click 1: Passed immediately
      component.onPureJsButtonClick();
      expect(component.pureJsRawClicks).toBe(1);
      expect(component.pureJsExecutedCount).toBe(1);

      // Click 2 immediately after: Blocked by throttle
      component.onPureJsButtonClick();
      expect(component.pureJsRawClicks).toBe(2);
      expect(component.pureJsExecutedCount).toBe(1);
    });

    it('should track raw clicks for RxJS button', () => {
      component.onRxjsRawClick();
      expect(component.rxjsRawClicks).toBe(1);
      component.onRxjsRawClick();
      expect(component.rxjsRawClicks).toBe(2);
    });

    it('should reset throttle stats cleanly', () => {
      component.onPureJsButtonClick();
      component.onRxjsRawClick();
      component.resetThrottleStats();

      expect(component.pureJsRawClicks).toBe(0);
      expect(component.pureJsExecutedCount).toBe(0);
      expect(component.rxjsRawClicks).toBe(0);
      expect(component.rxjsExecutedCount).toBe(0);
    });
  });

  describe('Promise vs Observable', () => {
    it('should initialize Promise demo with PENDING state', () => {
      component.runPromiseDemo();
      expect(component.promiseState).toBe('PENDING');
      expect(component.promiseResult).toContain('Đang xử lý Promise');
    });

    it('should start Observable demo with STREAMING state and support cancellation', () => {
      component.subscribeObservableDemo();
      expect(component.observableState).toBe('STREAMING');

      component.unsubscribeObservableDemo();
      expect(component.observableState).toBe('CANCELLED');
    });
  });

  describe('Custom Observable & Teardown', () => {
    it('should manage Subscriber A subscription and unsubscription', () => {
      expect(component.subAState).toBe('UNSUBSCRIBED');
      component.subscribeSubscriberA();
      expect(component.subAState).toBe('ACTIVE');

      component.unsubscribeSubscriberA();
      expect(component.subAState).toBe('UNSUBSCRIBED');
    });

    it('should manage Subscriber B subscription independently from A', () => {
      component.subscribeSubscriberA();
      component.subscribeSubscriberB();
      expect(component.subAState).toBe('ACTIVE');
      expect(component.subBState).toBe('ACTIVE');

      component.unsubscribeSubscriberB();
      expect(component.subBState).toBe('UNSUBSCRIBED');
      expect(component.subAState).toBe('ACTIVE');

      component.unsubscribeSubscriberA();
      expect(component.subAState).toBe('UNSUBSCRIBED');
    });
  });

  describe('Stream Lifecycle Simulator (Next / Error / Complete)', () => {
    it('should initialize new stream and emit Next marbles', () => {
      component.startNewLifecycleStream();
      expect(component.lifecycleState).toBe('ACTIVE');
      expect(component.marbles.length).toBe(0);

      component.nextPayloadInput = 'Packet Alpha';
      component.emitLifecycleNext();
      expect(component.marbles.length).toBe(1);
      expect(component.marbles[0].type).toBe('NEXT');
      expect(component.marbles[0].value).toBe('Packet Alpha');
    });

    it('should close stream upon Complete and ignore further Next calls', () => {
      component.startNewLifecycleStream();
      component.nextPayloadInput = 'First Packet';
      component.emitLifecycleNext();
      expect(component.marbles.length).toBe(1);

      // Complete stream
      component.emitLifecycleComplete();
      expect(component.lifecycleState).toBe('COMPLETED');
      expect(component.marbles.length).toBe(2);
      expect(component.marbles[1].type).toBe('COMPLETE');

      // Subsequent Next calls must be ignored
      component.nextPayloadInput = 'Ignored Packet';
      component.emitLifecycleNext();
      expect(component.marbles.length).toBe(2);
    });

    it('should close stream upon Error and ignore further Next calls', () => {
      component.startNewLifecycleStream();
      component.emitLifecycleError();

      expect(component.lifecycleState).toBe('ERROR');
      expect(component.marbles.some((m) => m.type === 'ERROR')).toBe(true);

      // Subsequent Next calls must be ignored
      component.emitLifecycleNext();
      expect(component.marbles.filter((m) => m.type === 'NEXT').length).toBe(0);
    });

    it('should unsubscribe lifecycle stream', () => {
      component.startNewLifecycleStream();
      expect(component.lifecycleState).toBe('ACTIVE');

      component.unsubscribeLifecycle();
      expect(component.lifecycleState).toBe('IDLE');
    });
  });

  describe('Composite Subscriptions (subscription.add)', () => {
    it('should start composite streams and cancel both via parent unsubscribe', () => {
      component.startCompositeStreams();
      expect(component.compositeState).toBe('RUNNING');

      component.unsubscribeCompositeStreams();
      expect(component.compositeState).toBe('UNSUBSCRIBED');
    });
  });

  describe('Activity Logging', () => {
    it('should record logs and clear logs when requested', () => {
      expect(component.logs.length).toBeGreaterThan(0);
      component.clearLogs();
      expect(component.logs.length).toBe(0);
    });
  });
});
