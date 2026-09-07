import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day009TwoWayBinding } from './day009-two-way-binding';

describe('Day009TwoWayBinding', () => {
  let component: Day009TwoWayBinding;
  let fixture: ComponentFixture<Day009TwoWayBinding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day009TwoWayBinding],
    }).compileComponents();

    fixture = TestBed.createComponent(Day009TwoWayBinding);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the main component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with userName from Day 9 doc', () => {
    expect(component.userName).toBe('Tiep Phan');
  });

  it('should update userName on deconstructed input change', () => {
    component.onDeconstructedNameChange('Angular Expert');
    fixture.detectChanges();

    expect(component.userName).toBe('Angular Expert');
    expect(component.lastActionMessage()).toContain('Angular Expert');
  });

  it('should toggle state from parent action and child event', () => {
    expect(component.toggleState).toBe(false);

    // Flip from parent
    component.flipToggleFromParent();
    fixture.detectChanges();
    expect(component.toggleState).toBe(true);

    // Event from child
    component.onToggleChangeFromParent(false);
    fixture.detectChanges();
    expect(component.toggleState).toBe(false);
    expect(component.lastActionMessage()).toContain('checkedChange: TẮT');
  });

  it('should update stepper value correctly', () => {
    expect(component.stepperQuantity).toBe(3);

    component.onStepperChange(5);
    fixture.detectChanges();
    expect(component.stepperQuantity).toBe(5);

    component.setStepperFromParent(10);
    fixture.detectChanges();
    expect(component.stepperQuantity).toBe(10);
    expect(component.lastActionMessage()).toContain('10');
  });

  it('should update rating score and handle rating change', () => {
    expect(component.userRating).toBe(4);

    component.onRatingChange(5);
    fixture.detectChanges();
    expect(component.userRating).toBe(5);
    expect(component.lastActionMessage()).toContain('5 sao');
  });

  it('should generate valid JSON state and reset device settings', () => {
    const json = component.deviceConfigJson();
    expect(json).toContain('MacBook Pro M3 Max');
    expect(json).toContain('"wifi": true');

    // Modify some device properties
    component.deviceName = 'Dell XPS 15';
    component.deviceWifi = false;
    component.deviceVolume = 50;
    fixture.detectChanges();

    expect(component.deviceConfigJson()).toContain('Dell XPS 15');
    expect(component.deviceConfigJson()).toContain('"wifi": false');

    // Reset
    component.resetDeviceSettings();
    fixture.detectChanges();
    expect(component.deviceName).toBe('MacBook Pro M3 Max');
    expect(component.deviceWifi).toBe(true);
    expect(component.lastActionMessage()).toContain('mặc định');
  });
});
