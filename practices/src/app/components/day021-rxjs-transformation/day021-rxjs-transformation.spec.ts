import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day021RxjsTransformation } from './day021-rxjs-transformation';

describe('Day021RxjsTransformation', () => {
  let component: Day021RxjsTransformation;
  let fixture: ComponentFixture<Day021RxjsTransformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day021RxjsTransformation],
    }).compileComponents();

    fixture = TestBed.createComponent(Day021RxjsTransformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create Day021RxjsTransformation component', () => {
    expect(component).toBeTruthy();
  });

  it('should transform users with map() adding fullname', () => {
    component.mapMode = 'fullname';
    component.runMapDemo();
    expect(component.isMapStreaming).toBe(true);
    // Initial result array starts empty and fills as stream emits
    expect(component.mapResults).toBeDefined();
  });

  it('should extract property using map(u => u.id)', () => {
    component.mapMode = 'id';
    component.runMapDemo();
    expect(component.mapMode).toBe('id');
  });

  it('should handle pluck property extraction mode', () => {
    component.mapMode = 'pluck-id';
    component.runMapDemo();
    expect(component.mapMode).toBe('pluck-id');
  });

  it('should increment and reset scan click counter', () => {
    expect(component.scanClickCounter).toBe(0);
    component.onScanClickCounterIncrement();
    component.onScanClickCounterIncrement();
    expect(component.scanClickCounter).toBe(2);

    component.resetScanClickCounter();
    expect(component.scanClickCounter).toBe(0);
  });

  it('should run scan vs reduce demo correctly', () => {
    component.runScanVsReduceDemo();
    expect(component.isAccumulating).toBe(true);
    expect(component.scanStepResults.length).toBe(0);
  });

  it('should run toArray() demo correctly', () => {
    component.runToArrayDemo();
    expect(component.toArrayStatus).toBe('EMITTING');
  });

  it('should control buffer demo start and stop', () => {
    component.startBufferDemo();
    expect(component.isBufferActive).toBe(true);

    component.triggerBufferFlush();
    component.stopBufferDemo();
    expect(component.isBufferActive).toBe(false);
  });

  it('should control bufferTime demo start and stop', () => {
    component.startBufferTimeDemo();
    expect(component.isBufferTimeActive).toBe(true);

    component.stopBufferTimeDemo();
    expect(component.isBufferTimeActive).toBe(false);
  });

  it('should clear activity logs when clearLogs() is called', () => {
    component.onScanClickCounterIncrement();
    expect(component.logs.length).toBeGreaterThan(0);

    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
