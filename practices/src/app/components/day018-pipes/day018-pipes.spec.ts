import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Day018Pipes,
  AppTitlePipe,
  IsAdultPipe,
  IsAdultImpurePipe,
  User,
} from './day018-pipes';

describe('Day018Pipes', () => {
  let component: Day018Pipes;
  let fixture: ComponentFixture<Day018Pipes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day018Pipes],
    }).compileComponents();

    fixture = TestBed.createComponent(Day018Pipes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create Day018Pipes component', () => {
    expect(component).toBeTruthy();
  });

  describe('AppTitlePipe (Custom Pipe from Day 18)', () => {
    const pipe = new AppTitlePipe();

    it('should return "Edit" when resourceId is truthy', () => {
      expect(pipe.transform('USER-123')).toBe('Edit');
    });

    it('should return "Add" when resourceId is empty, null or undefined', () => {
      expect(pipe.transform('')).toBe('Add');
      expect(pipe.transform(null)).toBe('Add');
      expect(pipe.transform(undefined)).toBe('Add');
    });

    it('should support custom parameters for addText and editText', () => {
      expect(pipe.transform('USER-123', 'Tạo Mới', 'Cập Nhật')).toBe('Cập Nhật');
      expect(pipe.transform('', 'Tạo Mới', 'Cập Nhật')).toBe('Tạo Mới');
    });
  });

  describe('IsAdultPipe (Pure Pipe)', () => {
    const pipe = new IsAdultPipe();
    const mockUsers: User[] = [
      { id: 1, name: 'Tiep Phan', age: 30, role: 'Author' },
      { id: 2, name: 'Tuan Anh', age: 16, role: 'Student' },
      { id: 3, name: 'Trung Vo', age: 28, role: 'Author' },
    ];

    it('should filter only users with age >= 18', () => {
      const filtered = pipe.transform(mockUsers);
      expect(filtered.length).toBe(2);
      expect(filtered.every((u) => u.age >= 18)).toBe(true);
      expect(filtered.find((u) => u.name === 'Tuan Anh')).toBeUndefined();
    });

    it('should handle null or undefined input gracefully', () => {
      expect(pipe.transform(null)).toEqual([]);
      expect(pipe.transform(undefined)).toEqual([]);
    });
  });

  describe('IsAdultImpurePipe (Impure Pipe)', () => {
    const pipe = new IsAdultImpurePipe();
    const mockUsers: User[] = [
      { id: 1, name: 'Adult User', age: 25, role: 'Dev' },
      { id: 2, name: 'Teen User', age: 15, role: 'Intern' },
    ];

    it('should filter only users with age >= 18', () => {
      const filtered = pipe.transform(mockUsers);
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Adult User');
    });
  });

  describe('Component Actions & State', () => {
    it('should add user via mutate (push) without changing array reference', () => {
      const initialUsersRef = component.users;
      component.newUserName = 'Nguyen Van A';
      component.newUserAge = 22;
      component.addUserMutate();

      expect(component.users).toBe(initialUsersRef); // Same reference!
      expect(component.users.length).toBe(5);
    });

    it('should add user via immutable ([...users]) changing array reference', () => {
      const initialUsersRef = component.users;
      component.newUserName = 'Tran Van B';
      component.newUserAge = 24;
      component.addUserImmutable();

      expect(component.users).not.toBe(initialUsersRef); // New reference!
      expect(component.users.length).toBe(5);
    });

    it('should toggle userId and record activity log', () => {
      component.userIdChangeAfterFiveSeconds = 'TEST-ID';
      component.toggleUserId();
      expect(component.userIdChangeAfterFiveSeconds).toBe('');

      component.toggleUserId();
      expect(component.userIdChangeAfterFiveSeconds).toContain('USR-');
    });

    it('should reset user list and clear logs', () => {
      component.newUserName = 'Sample User';
      component.addUserImmutable();
      expect(component.users.length).toBe(5);

      component.resetUserList();
      expect(component.users.length).toBe(4);

      component.clearLogs();
      expect(component.logs.length).toBe(0);
    });

    it('should increment methodExecutionCount when formatPriceWithMethod is called', () => {
      const initialCount = component.methodExecutionCount;
      const formatted = component.formatPriceWithMethod(100);
      expect(formatted).toBe('$100.00');
      expect(component.methodExecutionCount).toBe(initialCount + 1);
    });

    it('should trigger change detection and record benchmark log', () => {
      const initialDummy = component.dummyTriggerCounter;
      component.triggerChangeDetection();
      expect(component.dummyTriggerCounter).toBe(initialDummy + 1);
      expect(component.logs[0].type).toBe('BENCHMARK');
    });
  });
});
