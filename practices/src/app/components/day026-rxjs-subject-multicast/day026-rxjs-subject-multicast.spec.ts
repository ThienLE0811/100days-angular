import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day026RxjsSubjectMulticast } from './day026-rxjs-subject-multicast';

describe('Day026RxjsSubjectMulticast', () => {
  let component: Day026RxjsSubjectMulticast;
  let fixture: ComponentFixture<Day026RxjsSubjectMulticast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day026RxjsSubjectMulticast],
    }).compileComponents();

    fixture = TestBed.createComponent(Day026RxjsSubjectMulticast);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create Day026RxjsSubjectMulticast component', () => {
    expect(component).toBeTruthy();
  });

  it('should deliver current value to late subscriber with BehaviorSubject', () => {
    component.onSubjectTypeSelect('BehaviorSubject');

    // Observer A subscribes and gets initial value 0
    component.subscribeObserverA();
    expect(component.observerALogs.length).toBe(1);
    expect(component.observerALogs[0].value).toBe(0);

    // Emit 1 and 2
    component.emitNextValue();
    component.emitNextValue();
    expect(component.observerALogs.length).toBe(3);

    // Observer B subscribes late and immediately gets current value 2
    component.subscribeObserverB();
    expect(component.observerBLogs.length).toBe(1);
    expect(component.observerBLogs[0].value).toBe(2);
  });

  it('should replay buffered values to late subscriber with ReplaySubject(3)', () => {
    component.onSubjectTypeSelect('ReplaySubject');

    // Emit 1, 2, 3, 4 before B subscribes
    component.emitNextValue();
    component.emitNextValue();
    component.emitNextValue();
    component.emitNextValue();

    // Observer B subscribes late: receives 3 buffered items (2, 3, 4)
    component.subscribeObserverB();
    expect(component.observerBLogs.length).toBe(3);
    expect(component.observerBLogs[0].value).toBe(2);
    expect(component.observerBLogs[1].value).toBe(3);
    expect(component.observerBLogs[2].value).toBe(4);
  });

  it('should emit only the final value on complete with AsyncSubject', () => {
    component.onSubjectTypeSelect('AsyncSubject');
    component.subscribeObserverA();

    component.emitNextValue(); // 1
    component.emitNextValue(); // 2
    component.emitNextValue(); // 3
    // AsyncSubject does not emit before complete
    expect(component.observerALogs.length).toBe(0);

    // Complete triggers emission of last value 3
    component.completeSubject();
    expect(component.observerALogs.length).toBe(2); // value 3 and complete
    expect(component.observerALogs[0].value).toBe(3);
    expect(component.observerALogs[1].value).toContain('Complete');
  });

  it('should miss past emissions with plain Subject for late subscriber', () => {
    component.onSubjectTypeSelect('Subject');
    component.emitNextValue(); // 1
    component.emitNextValue(); // 2

    // Observer B subscribes late: gets nothing from the past
    component.subscribeObserverB();
    expect(component.observerBLogs.length).toBe(0);

    // Only future emissions are received
    component.emitNextValue(); // 3
    expect(component.observerBLogs.length).toBe(1);
    expect(component.observerBLogs[0].value).toBe(3);
  });

  it('should toggle between Unicast and Multicast simulation modes', () => {
    component.toggleUnicastMode(false);
    expect(component.unicastMode).toBe(false);

    component.toggleUnicastMode(true);
    expect(component.unicastMode).toBe(true);
  });

  it('should cache HTTP request for multiple subscribers using shareReplay()', () => {
    component.useShareReplay = true;

    // Component A triggers first network request
    component.subscribeComponentA();
    expect(component.httpNetworkRequestCount).toBe(1);
    expect(component.componentAListening).toBe(true);

    // Component B & C reuse the cached stream without additional network calls
    component.subscribeComponentB();
    component.subscribeComponentC();
    expect(component.httpNetworkRequestCount).toBe(1);

    // Force refresh clears cache
    component.forceRefreshCache();
    expect(component.componentAListening).toBe(false);
    expect(component.cachedJokeData).toBeNull();
  });

  it('should manage reactive cart state using BehaviorSubject', () => {
    expect(component.cartTotalCount).toBe(1);
    expect(component.cartTotalPrice).toBe(49);

    // Add item
    component.addItemToCart('RxJS Advanced', 30);
    expect(component.cartTotalCount).toBe(2);
    expect(component.cartTotalPrice).toBe(79);

    // Clear cart
    component.clearCart();
    expect(component.cartTotalCount).toBe(0);
    expect(component.cartTotalPrice).toBe(0);
  });

  it('should include all 6 specifications in cheatsheet', () => {
    expect(component.cheatsheetSpecs.length).toBe(6);
    const names = component.cheatsheetSpecs.map((s) => s.name);
    expect(names).toContain('Subject');
    expect(names).toContain('BehaviorSubject');
    expect(names).toContain('ReplaySubject(buffer, windowTime)');
    expect(names).toContain('AsyncSubject');
    expect(names).toContain('share()');
    expect(names).toContain('shareReplay(config)');
  });

  it('should clear activity logs when clearLogs() is called', () => {
    expect(component.logs.length).toBeGreaterThan(0);
    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
