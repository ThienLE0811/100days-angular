import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day020RxjsCreation } from './day020-rxjs-creation';

describe('Day020RxjsCreation', () => {
  let component: Day020RxjsCreation;
  let fixture: ComponentFixture<Day020RxjsCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day020RxjsCreation],
    }).compileComponents();

    fixture = TestBed.createComponent(Day020RxjsCreation);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create Day020RxjsCreation component', () => {
    expect(component).toBeTruthy();
  });

  it('should demonstrate of() primitive emission and auto-complete', () => {
    component.runOfPrimitiveDemo();
    expect(component.ofResults.length).toBe(2); // value + complete
    expect(component.ofResults[0].value).toBe('hello');
    expect(component.ofResults[1].isComplete).toBe(true);
  });

  it('should demonstrate of() array emission as a single value', () => {
    component.runOfArrayDemo();
    expect(component.ofResults.length).toBe(2);
    expect(component.ofResults[0].value).toBe(JSON.stringify([1, 2, 3]));
    expect(component.ofResults[1].isComplete).toBe(true);
  });

  it('should demonstrate from() array unpacking individual items', () => {
    component.runFromArrayDemo();
    // 3 items + 1 complete
    expect(component.fromResults.length).toBe(4);
    expect(component.fromResults[0].value).toBe(1);
    expect(component.fromResults[1].value).toBe(2);
    expect(component.fromResults[2].value).toBe(3);
    expect(component.fromResults[3].isComplete).toBe(true);
  });

  it('should demonstrate from() string unpacking individual characters', () => {
    component.runFromStringDemo();
    // 'hello world' is 11 chars + 1 complete = 12 items
    expect(component.fromResults.length).toBe(12);
    expect(component.fromResults[0].value).toBe('h');
    expect(component.fromResults[component.fromResults.length - 1].isComplete).toBe(true);
  });

  it('should demonstrate defer() generating new instances on each subscription', () => {
    component.resetOfVsDeferExperiment();

    // of(Math.random())
    component.runSubscribeToOfRandom();
    component.runSubscribeToOfRandom();
    expect(component.ofSubscriberResults.length).toBe(2);
    expect(component.ofSubscriberResults[0].randomValue).toBe(
      component.ofSubscriberResults[1].randomValue
    );

    // defer(() => of(Math.random()))
    component.runSubscribeToDeferRandom();
    component.runSubscribeToDeferRandom();
    expect(component.deferSubscriberResults.length).toBe(2);
    expect(component.deferSubscriberResults[0].randomValue).not.toBe(
      component.deferSubscriberResults[1].randomValue
    );
  });

  it('should demonstrate throwError() emitting error notification immediately', () => {
    component.customErrorMessage = 'Test Error Notification';
    component.runThrowErrorDemo();
    expect(component.throwErrorStatus).toBe('EMITTED');
    expect(component.throwErrorDetail).toContain('Test Error Notification');
  });

  it('should handle interval start and stop correctly', () => {
    component.startInterval();
    expect(component.intervalStatus).toBe('RUNNING');

    component.stopInterval();
    expect(component.intervalStatus).toBe('STOPPED');
  });

  it('should clear logs when clearLogs() is invoked', () => {
    component.runOfPrimitiveDemo();
    expect(component.logs.length).toBeGreaterThan(0);

    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
