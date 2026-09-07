import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AppToggleItemComponent,
  Day010TemplateVariableViewchildViewchildren,
} from './day010-template-variable-viewchild-viewchildren';
import { FormsModule } from '@angular/forms';

describe('Day010TemplateVariableViewchildViewchildren', () => {
  let component: Day010TemplateVariableViewchildViewchildren;
  let fixture: ComponentFixture<Day010TemplateVariableViewchildViewchildren>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day010TemplateVariableViewchildViewchildren, AppToggleItemComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Day010TemplateVariableViewchildViewchildren);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the main component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default state correctly', () => {
    expect(component.currentTab()).toBe('all');
    expect(component.smartDevices().length).toBe(5);
    expect(component.sampleInputText).toBe('Angular 100 Days of Code');
    expect(component.activeCount()).toBe(3);
    expect(component.totalPowerWatts()).toBe(1260);
  });

  it('should resolve static: true ViewChild in ngOnInit and log readiness', () => {
    expect(component.staticNativeInputRef).toBeDefined();
    expect(component.staticInitLog()).toContain('static: true thành công');
    expect(component.staticNativeInputRef.nativeElement.value).toBe('StaticInputValue_Success');
  });

  it('should resolve dynamic ViewChild and ViewChildren in ngAfterViewInit', () => {
    expect(component.singleTargetToggleRef).toBeDefined();
    expect(component.singleTargetToggleDomRef).toBeDefined();
    expect(component.allDevicesQueryList).toBeDefined();
    expect(component.allDevicesQueryList.length).toBeGreaterThanOrEqual(5);
    expect(component.afterViewInitLog()).toContain('thành công');
  });

  it('should control target component via ViewChild methods', () => {
    // Initial state
    expect(component.singleTargetToggleRef.checked).toBe(false);

    // Turn on via ViewChild
    component.turnOnViaViewChild();
    fixture.detectChanges();
    expect(component.singleTargetToggleRef.checked).toBe(true);
    expect(component.isSingleToggleChecked()).toBe(true);
    expect(component.lastActionMessage()).toContain('turnOn()');

    // Turn off via ViewChild
    component.turnOffViaViewChild();
    fixture.detectChanges();
    expect(component.singleTargetToggleRef.checked).toBe(false);
    expect(component.isSingleToggleChecked()).toBe(false);
    expect(component.lastActionMessage()).toContain('turnOff()');

    // Toggle via ViewChild
    component.toggleViaViewChild();
    fixture.detectChanges();
    expect(component.singleTargetToggleRef.checked).toBe(true);
    expect(component.lastActionMessage()).toContain('toggle()');
  });

  it('should manipulate DOM directly via read: ElementRef', () => {
    expect(component.singleTargetToggleDomRef).toBeDefined();
    component.highlightViaReadElementRef();
    fixture.detectChanges();

    const nativeEl = component.singleTargetToggleDomRef.nativeElement;
    expect(nativeEl.style.transform).toBe('scale(1.04)');
    expect(component.lastActionMessage()).toContain('read: ElementRef');
  });

  it('should control batch items via ViewChildren QueryList', () => {
    // Turn all on
    component.turnAllOnViaViewChildren();
    fixture.detectChanges();
    expect(component.smartDevices().every((d) => d.checked)).toBe(true);
    expect(component.activeCount()).toBe(component.smartDevices().length);
    expect(component.lastActionMessage()).toContain('turnOn()');

    // Turn all off
    component.turnAllOffViaViewChildren();
    fixture.detectChanges();
    expect(component.smartDevices().every((d) => !d.checked)).toBe(true);
    expect(component.activeCount()).toBe(0);
    expect(component.totalPowerWatts()).toBe(0);
    expect(component.lastActionMessage()).toContain('tắt khẩn cấp');
  });

  it('should dynamically add and remove devices in smartDevices', () => {
    const initialCount = component.smartDevices().length;

    // Add new device
    component.addNewDevice();
    expect(component.lastActionMessage()).toContain('Đã thêm');
    fixture.detectChanges();
    expect(component.smartDevices().length).toBe(initialCount + 1);
    expect(component.lastActionMessage()).toContain('QueryList.changes');

    // Remove device
    component.removeLastDevice();
    expect(component.lastActionMessage()).toContain('Đã gỡ');
    fixture.detectChanges();
    expect(component.smartDevices().length).toBe(initialCount);
    expect(component.lastActionMessage()).toContain('QueryList.changes');
  });

  it('should handle device checkedChange events', () => {
    const target = component.smartDevices()[0];
    const newChecked = !target.checked;

    component.onDeviceToggleChange(target.id, newChecked);
    fixture.detectChanges();

    const updated = component.smartDevices().find((d) => d.id === target.id);
    expect(updated?.checked).toBe(newChecked);
  });

  it('should handle form submission based on validity', () => {
    // Valid submission
    component.onFormSubmit(true);
    expect(component.lastActionMessage()).toContain('HỢP LỆ (Valid)');

    // Invalid submission
    component.onFormSubmit(false);
    expect(component.lastActionMessage()).toContain('KHÔNG HỢP LỆ (Invalid)');
  });

  it('should switch navigation tabs smoothly', () => {
    component.currentTab.set('view-child');
    fixture.detectChanges();
    expect(component.currentTab()).toBe('view-child');

    component.currentTab.set('export-as');
    fixture.detectChanges();
    expect(component.currentTab()).toBe('export-as');
  });
});

describe('AppToggleItemComponent', () => {
  let fixture: ComponentFixture<AppToggleItemComponent>;
  let component: AppToggleItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppToggleItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppToggleItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should toggle checked state and emit checkedChange', () => {
    let emittedValue: boolean | undefined;
    component.checkedChange.subscribe((val) => (emittedValue = val));

    expect(component.checked).toBe(false);
    component.toggle();
    expect(component.checked).toBe(true);
    expect(emittedValue).toBe(true);

    component.turnOff();
    expect(component.checked).toBe(false);
    expect(emittedValue).toBe(false);

    component.turnOn();
    expect(component.checked).toBe(true);
    expect(emittedValue).toBe(true);
  });
});
