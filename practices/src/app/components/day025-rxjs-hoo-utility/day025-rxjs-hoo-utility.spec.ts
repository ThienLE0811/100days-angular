import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day025RxjsHooUtility } from './day025-rxjs-hoo-utility';

describe('Day025RxjsHooUtility', () => {
  let component: Day025RxjsHooUtility;
  let fixture: ComponentFixture<Day025RxjsHooUtility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day025RxjsHooUtility],
    }).compileComponents();

    fixture = TestBed.createComponent(Day025RxjsHooUtility);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create Day025RxjsHooUtility component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch between Big Four HOO operators', () => {
    expect(component.selectedHoo).toBe('switchMap');

    component.onHooOperatorChange('mergeMap');
    expect(component.selectedHoo).toBe('mergeMap');

    component.onHooOperatorChange('concatMap');
    expect(component.selectedHoo).toBe('concatMap');

    component.onHooOperatorChange('exhaustMap');
    expect(component.selectedHoo).toBe('exhaustMap');

    component.onHooOperatorChange('switchMap');
    expect(component.selectedHoo).toBe('switchMap');
  });

  it('should manage requests in simulator and clear requests', () => {
    component.triggerNewRequest(500);
    expect(component.hooRequests.length).toBe(1);
    expect(component.hooRequests[0].status).toBe('RUNNING');

    component.clearRequests();
    expect(component.hooRequests.length).toBe(0);
  });

  it('should mark rapid requests in exhaustMap as IGNORED while previous is running', () => {
    component.onHooOperatorChange('exhaustMap');
    component.triggerNewRequest(2000);
    expect(component.hooRequests[0].status).toBe('RUNNING');

    // Immediate second request should be IGNORED
    component.triggerNewRequest(500);
    expect(component.hooRequests.length).toBe(2);
    expect(component.hooRequests[0].status).toBe('IGNORED');
    expect(component.hooRequests[0].result).toContain('exhaustMap');
  });

  it('should run origin flattening demos for switchAll, mergeAll, and concatAll', () => {
    component.runOriginDemo('switchAll');
    expect(component.originFlattenMode).toBe('switchAll');

    component.runOriginDemo('mergeAll');
    expect(component.originFlattenMode).toBe('mergeAll');

    component.runOriginDemo('concatAll');
    expect(component.originFlattenMode).toBe('concatAll');
  });

  it('should partition notifications into unread and read lists', () => {
    component.executePartitionDemo();
    expect(component.unreadList.length).toBe(2);
    expect(component.readList.length).toBe(2);

    // Toggle unread item to read
    const unreadItem = component.unreadList[0];
    component.toggleNotificationStatus(unreadItem);

    expect(component.unreadList.length).toBe(1);
    expect(component.readList.length).toBe(3);
  });

  it('should demonstrate repeat() emitting specified number of times', () => {
    component.repeatCount = 4;
    component.runRepeatDemo();
    expect(component.repeatedEmissions.length).toBe(4);
    expect(component.repeatedEmissions[0]).toContain('Polling');
  });

  it('should record user clicks and measure intervals using timeInterval()', () => {
    expect(component.clickHistory.length).toBe(0);

    component.onUserClickTester();
    expect(component.clickHistory.length).toBe(1);
    expect(component.lastClickIntervalMs).not.toBeNull();

    component.onUserClickTester();
    expect(component.clickHistory.length).toBe(2);
  });

  it('should include all 10 operators in cheatsheet specifications', () => {
    expect(component.cheatsheetSpecs.length).toBe(10);
    const opNames = component.cheatsheetSpecs.map((s) => s.operator);
    expect(opNames).toContain('switchMap()');
    expect(opNames).toContain('mergeMap()');
    expect(opNames).toContain('concatMap()');
    expect(opNames).toContain('exhaustMap()');
    expect(opNames).toContain('partition()');
    expect(opNames).toContain('tap()');
    expect(opNames).toContain('finalize()');
    expect(opNames).toContain('repeat(count)');
    expect(opNames).toContain('timeInterval()');
    expect(opNames).toContain('timeout()');
  });

  it('should clear activity logs when clearLogs() is called', () => {
    expect(component.logs.length).toBeGreaterThan(0);
    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
