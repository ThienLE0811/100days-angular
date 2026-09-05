import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day014NgTemplateNgTemplateOutletNgContainer } from './day014-ng-template-ng-template-outlet-ng-container';

describe('Day014NgTemplateNgTemplateOutletNgContainer', () => {
  let component: Day014NgTemplateNgTemplateOutletNgContainer;
  let fixture: ComponentFixture<Day014NgTemplateNgTemplateOutletNgContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day014NgTemplateNgTemplateOutletNgContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(Day014NgTemplateNgTemplateOutletNgContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate canWatchPG13 correctly based on userAge', () => {
    component.userAge.set(12);
    expect(component.canWatchPG13()).toBe(false);

    component.userAge.set(13);
    expect(component.canWatchPG13()).toBe(true);

    component.userAge.set(20);
    expect(component.canWatchPG13()).toBe(true);
  });

  it('should handle counter increment, decrement, and reset', () => {
    component.counter.set(2);
    component.incrementCounter();
    expect(component.counter()).toBe(3);

    component.decrementCounter();
    expect(component.counter()).toBe(2);

    component.resetCounter();
    expect(component.counter()).toBe(0);

    // Cannot decrement below 0
    component.decrementCounter();
    expect(component.counter()).toBe(0);
  });

  it('should toggle custom header override state', () => {
    expect(component.useCustomHeader()).toBe(false);
    component.toggleCustomHeader();
    expect(component.useCustomHeader()).toBe(true);
    component.toggleCustomHeader();
    expect(component.useCustomHeader()).toBe(false);
  });

  it('should record executed action message with timestamp and label', () => {
    component.onExecuteAction('save', 'Lưu vào hệ thống');
    expect(component.lastActionMessage()).toContain('Lưu vào hệ thống');
    expect(component.lastActionMessage()).toContain('save');
  });

  it('should filter users by role correctly', () => {
    component.filterRole.set('all');
    expect(component.filteredUsers().length).toBe(5);

    component.filterRole.set('Developer');
    expect(component.filteredUsers().length).toBe(2);
    expect(component.filteredUsers().every(u => u.role === 'Developer')).toBe(true);

    component.filterRole.set('Admin');
    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('Nguyễn Văn An');
  });
});
