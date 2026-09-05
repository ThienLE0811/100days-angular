import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  ContentChild,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * ============================================================================
 * DATA MODELS & INTERFACES
 * ============================================================================
 */
export interface HookLog {
  id: number;
  time: string;
  hookName: string;
  tier: 'CORE' | 'VIEW_CONTENT' | 'RECHECK' | 'DO_CHECK';
  detail: string;
}

export interface HookDefinition {
  name: string;
  interfaceName: string;
  tier: 'CORE' | 'VIEW_CONTENT' | 'RECHECK' | 'DO_CHECK';
  tierLabel: string;
  frequency: 'Rất hay dùng (95%)' | 'Khá hay dùng (60%)' | 'Ít dùng (20%)' | 'Rất ít dùng (<5%)';
  timing: string;
  useCase: string;
  bestPractice: string;
}

/**
 * ============================================================================
 * CHILD COMPONENT TRIỂN KHAI ĐẦY ĐỦ 8 LIFECYCLE HOOKS
 * ============================================================================
 */
@Component({
  selector: 'app-lifecycle-child',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="child-box" [class.unmounted]="false">
      <div class="child-header">
        <span class="child-badge">Component Con (Lifecycle Probe)</span>
        <span class="timer-badge" [class.alive]="isTimerAlive">
          {{ isTimerAlive ? '⏱ Timer ngOnDestroy: Hoạt động' : '⏱ Timer: Đã hủy' }}
        </span>
      </div>

      <div class="child-body">
        <h4 #childHeading class="child-title">{{ title }}</h4>
        <div class="child-props-grid">
          <div class="prop-item">
            <span class="prop-label">Primitive Input (count):</span>
            <strong class="prop-val">{{ count }}</strong>
          </div>
          <div class="prop-item">
            <span class="prop-label">Object Input (user.name & age):</span>
            <strong class="prop-val">{{ user.name }} ({{ user.age }} tuổi)</strong>
          </div>
        </div>

        <!-- Projected Content (<ng-content>) -->
        <div class="projected-content-area">
          <span class="area-label">&lt;ng-content&gt; Khu vực chiếu nội dung:</span>
          <div class="projected-box">
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Realtime Hook Execution Counters on Child -->
        <div class="hook-counters-panel">
          <span class="counters-title">Số lần từng Hook đã được gọi:</span>
          <div class="counters-grid">
            <div class="counter-badge core">
              <span>ngOnChanges:</span> <strong>{{ hookCounts['ngOnChanges'] || 0 }}</strong>
            </div>
            <div class="counter-badge core">
              <span>ngOnInit:</span> <strong>{{ hookCounts['ngOnInit'] || 0 }}</strong>
            </div>
            <div class="counter-badge core">
              <span>ngOnDestroy:</span> <strong>{{ hookCounts['ngOnDestroy'] || 0 }}</strong>
            </div>
            <div class="counter-badge view">
              <span>ngAfterContentInit:</span> <strong>{{ hookCounts['ngAfterContentInit'] || 0 }}</strong>
            </div>
            <div class="counter-badge view">
              <span>ngAfterViewInit:</span> <strong>{{ hookCounts['ngAfterViewInit'] || 0 }}</strong>
            </div>
            <div class="counter-badge recheck">
              <span>ngAfterContentChecked:</span> <strong>{{ hookCounts['ngAfterContentChecked'] || 0 }}</strong>
            </div>
            <div class="counter-badge recheck">
              <span>ngAfterViewChecked:</span> <strong>{{ hookCounts['ngAfterViewChecked'] || 0 }}</strong>
            </div>
            <div class="counter-badge docheck">
              <span>ngDoCheck:</span> <strong>{{ hookCounts['ngDoCheck'] || 0 }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .child-box {
        background: #ffffff;
        border: 2px solid #3b82f6;
        border-radius: 10px;
        padding: 1.25rem;
        box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        animation: childMount 0.3s ease-out;
      }
      @keyframes childMount {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .child-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 0.5rem;
      }
      .child-badge {
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        border: 1px solid #bfdbfe;
      }
      .timer-badge {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        background: #fee2e2;
        color: #991b1b;
        &.alive {
          background: #dcfce7;
          color: #15803d;
        }
      }
      .child-title {
        margin: 0 0 0.75rem;
        font-size: 1.15rem;
        color: #0f172a;
      }
      .child-props-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1rem;
        @media (max-width: 640px) { grid-template-columns: 1fr; }
      }
      .prop-item {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 0.5rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .prop-label { font-size: 0.725rem; color: #64748b; }
      .prop-val { font-size: 0.95rem; color: #1e293b; font-family: monospace; }
      .projected-content-area {
        background: #faf5ff;
        border: 1px dashed #d8b4fe;
        border-radius: 8px;
        padding: 0.75rem;
        margin-bottom: 1rem;
      }
      .area-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: #7e22ce;
        margin-bottom: 0.4rem;
        font-family: monospace;
      }
      .hook-counters-panel {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem;
      }
      .counters-title {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }
      .counters-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.4rem;
        @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
      }
      .counter-badge {
        font-size: 0.725rem;
        padding: 0.25rem 0.4rem;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid transparent;
        &.core { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
        &.view { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
        &.recheck { background: #fef3c7; color: #92400e; border-color: #fde68a; }
        &.docheck { background: #fce7f3; color: #9d174d; border-color: #fbcfe8; }
        strong { font-family: monospace; font-size: 0.8rem; }
      }
    `,
  ],
})
export class LifecycleChildComponent
  implements
    OnChanges,
    OnInit,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy
{
  @Input() title: string = '';
  @Input() count: number = 0;
  @Input() user: { name: string; age: number } = { name: '', age: 0 };

  @Output() hookEvent = new EventEmitter<{
    hook: string;
    tier: 'CORE' | 'VIEW_CONTENT' | 'RECHECK' | 'DO_CHECK';
    detail: string;
  }>();

  @ViewChild('childHeading') childHeadingRef?: ElementRef<HTMLHeadingElement>;
  @ContentChild('projectedSpan') projectedContentRef?: ElementRef;

  hookCounts: Record<string, number> = {};
  isTimerAlive: boolean = false;
  private timerId?: ReturnType<typeof setInterval>;
  private previousUserAge: number = 0;

  constructor() {
    // Constructor không phải là một lifecycle hook của Angular, nhưng là điểm khởi tạo của JS class
  }

  // ==========================================================================
  // NHÓM 1: RẤT HAY DÙNG (CORE HOOKS)
  // ==========================================================================

  /**
   * 1. ngOnChanges: Được gọi trước ngOnInit và mỗi khi có @Input() thay đổi tham chiếu/giá trị nguyên thủy.
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.recordHook('ngOnChanges', 'CORE');
    const changeDetails: string[] = [];
    for (const propName in changes) {
      const change = changes[propName];
      const isFirst = change.isFirstChange() ? ' (Lần đầu)' : '';
      changeDetails.push(
        `${propName}: ${JSON.stringify(change.previousValue)} -> ${JSON.stringify(
          change.currentValue
        )}${isFirst}`
      );
    }
    this.hookEvent.emit({
      hook: 'ngOnChanges',
      tier: 'CORE',
      detail: `Phát hiện thay đổi Input: [ ${changeDetails.join(' | ')} ]`,
    });
  }

  /**
   * 2. ngOnInit: Khởi tạo component, gọi API, load dữ liệu sau khi @Input() đầu tiên được nhận.
   */
  ngOnInit(): void {
    this.recordHook('ngOnInit', 'CORE');
    this.previousUserAge = this.user ? this.user.age : 0;

    // Khởi tạo một interval mô phỏng tác vụ ngầm (phải dọn dẹp ở ngOnDestroy)
    this.isTimerAlive = true;
    this.timerId = setInterval(() => {
      // Background heartbeat
    }, 1000);

    this.hookEvent.emit({
      hook: 'ngOnInit',
      tier: 'CORE',
      detail:
        'Component đã sẵn sàng! Inputs ban đầu đã gán. Đã khởi tạo ngầm timer cần giải phóng.',
    });
  }

  /**
   * 3. ngOnDestroy: Dọn dẹp tài nguyên (unsubscribe RxJS, clearInterval, detach events) trước khi component bị hủy.
   */
  ngOnDestroy(): void {
    this.recordHook('ngOnDestroy', 'CORE');
    if (this.timerId) {
      clearInterval(this.timerId);
      this.isTimerAlive = false;
    }
    this.hookEvent.emit({
      hook: 'ngOnDestroy',
      tier: 'CORE',
      detail:
        'Component sắp bị gỡ khỏi DOM! Đã dọn dẹp clearInterval(timerId) thành công để chống Memory Leak.',
    });
  }

  // ==========================================================================
  // NHÓM 2: KHÁ HAY DÙNG (VIEW & CONTENT INIT HOOKS)
  // ==========================================================================

  /**
   * 4. ngAfterContentInit: Được gọi 1 lần duy nhất sau khi <ng-content> đã được chiếu vào component.
   */
  ngAfterContentInit(): void {
    this.recordHook('ngAfterContentInit', 'VIEW_CONTENT');
    const hasProjected = !!this.projectedContentRef;
    this.hookEvent.emit({
      hook: 'ngAfterContentInit',
      tier: 'VIEW_CONTENT',
      detail: `Nội dung <ng-content> đã được chiếu xong! ContentChild có sẵn: ${hasProjected}`,
    });
  }

  /**
   * 5. ngAfterViewInit: Được gọi 1 lần duy nhất sau khi Component View và các @ViewChild đã render xong trên DOM.
   */
  ngAfterViewInit(): void {
    this.recordHook('ngAfterViewInit', 'VIEW_CONTENT');
    const headingText = this.childHeadingRef?.nativeElement.textContent || '';
    this.hookEvent.emit({
      hook: 'ngAfterViewInit',
      tier: 'VIEW_CONTENT',
      detail: `DOM và ViewChild đã sẵn sàng! Đọc nativeElement của h4: "${headingText}"`,
    });
  }

  // ==========================================================================
  // NHÓM 3: ÍT DÙNG HƠN (RE-CHECK HOOKS)
  // ==========================================================================

  /**
   * 6. ngAfterContentChecked: Được gọi sau mỗi chu kỳ Change Detection kiểm tra nội dung chiếu vào.
   */
  ngAfterContentChecked(): void {
    this.recordHook('ngAfterContentChecked', 'RECHECK');
    this.hookEvent.emit({
      hook: 'ngAfterContentChecked',
      tier: 'RECHECK',
      detail: 'Kiểm tra lại nội dung projected sau chu kỳ Change Detection.',
    });
  }

  /**
   * 7. ngAfterViewChecked: Được gọi sau mỗi chu kỳ Change Detection kiểm tra view component.
   */
  ngAfterViewChecked(): void {
    this.recordHook('ngAfterViewChecked', 'RECHECK');
    this.hookEvent.emit({
      hook: 'ngAfterViewChecked',
      tier: 'RECHECK',
      detail: 'Kiểm tra lại View sau chu kỳ Change Detection (Cẩn thận lỗi ExpressionChanged).',
    });
  }

  // ==========================================================================
  // NHÓM 4: RẤT ÍT DÙNG / NÂNG CAO (CUSTOM CHANGE DETECTION)
  // ==========================================================================

  /**
   * 8. ngDoCheck: Được gọi trong mọi chu kỳ Change Detection để kiểm tra thay đổi thủ công.
   */
  ngDoCheck(): void {
    this.recordHook('ngDoCheck', 'DO_CHECK');
    let extraNote = '';
    if (this.user && this.user.age !== this.previousUserAge) {
      extraNote = ` -> [BẮT ĐƯỢC THỦ CÔNG] user.age thay đổi từ ${this.previousUserAge} thành ${this.user.age} dù tham chiếu Object không đổi!`;
      this.previousUserAge = this.user.age;
    }
    this.hookEvent.emit({
      hook: 'ngDoCheck',
      tier: 'DO_CHECK',
      detail: `Kích hoạt chu kỳ Change Detection tổng thể.${extraNote}`,
    });
  }

  private recordHook(hook: string, _tier: string): void {
    this.hookCounts[hook] = (this.hookCounts[hook] || 0) + 1;
  }
}

/**
 * ============================================================================
 * MAIN HOST COMPONENT: DAY 002 HOOKS
 * ============================================================================
 */
@Component({
  selector: 'app-day002-hooks',
  standalone: true,
  imports: [CommonModule, FormsModule, LifecycleChildComponent],
  templateUrl: './day002-hooks.html',
  styleUrl: './day002-hooks.scss',
})
export class Day002Hooks {
  // State điều khiển Component Con
  isChildMounted: boolean = true;
  childTitle: string = 'Khóa Học Angular 100 Days';
  childCount: number = 100;
  childUser = { name: 'Thien Le', age: 28 };
  projectedText: string = 'Đoạn text chiếu từ Component Cha';
  isContentProjected: boolean = true;

  // Thống kê số lần kích hoạt tổng hợp từ Child
  lifecycleStats: Record<string, number> = {
    ngOnInit: 0,
    ngOnDestroy: 0,
    ngOnChanges: 0,
    ngAfterViewInit: 0,
    ngAfterContentInit: 0,
    ngAfterContentChecked: 0,
    ngAfterViewChecked: 0,
    ngDoCheck: 0,
  };

  // Activity Logs
  logs: HookLog[] = [];
  private logIdCounter: number = 1;

  // Bảng phân cấp Hooks từ Hay Dùng đến Ít Dùng
  readonly hookDefinitions: HookDefinition[] = [
    {
      name: 'ngOnInit',
      interfaceName: 'OnInit',
      tier: 'CORE',
      tierLabel: 'Rất hay dùng (Core)',
      frequency: 'Rất hay dùng (95%)',
      timing: 'Được gọi 1 lần sau khi nhận @Input() đầu tiên và trước khi view render.',
      useCase: 'Gọi API backend, gán state ban đầu, subscribe luồng dữ liệu, tính toán dữ liệu khởi tạo.',
      bestPractice: 'Không nên gọi API trong constructor! Hãy đưa toàn bộ logic khởi tạo vào ngOnInit.',
    },
    {
      name: 'ngOnDestroy',
      interfaceName: 'OnDestroy',
      tier: 'CORE',
      tierLabel: 'Rất hay dùng (Core)',
      frequency: 'Rất hay dùng (95%)',
      timing: 'Được gọi 1 lần ngay trước khi component bị gỡ bỏ khỏi DOM.',
      useCase: 'Unsubscribe RxJS subscriptions, clearInterval/clearTimeout, removeEventListener để chống Memory Leak.',
      bestPractice: 'Luôn luôn dọn dẹp các Observable stream mở hoặc sử dụng takeUntilDestroyed().',
    },
    {
      name: 'ngOnChanges',
      interfaceName: 'OnChanges',
      tier: 'CORE',
      tierLabel: 'Rất hay dùng (Core)',
      frequency: 'Rất hay dùng (95%)',
      timing: 'Được gọi trước ngOnInit và mỗi khi có @Input() thay đổi giá trị nguyên thủy hoặc tham chiếu (reference).',
      useCase: 'Theo dõi sự thay đổi của thuộc tính đầu vào và thực hiện xử lý phản hồi tương ứng.',
      bestPractice: 'Chỉ phát hiện thay đổi theo tham chiếu (Reference Check). Nếu mutate mảng/object, hook này KHÔNG chạy!',
    },
    {
      name: 'ngAfterViewInit',
      interfaceName: 'AfterViewInit',
      tier: 'VIEW_CONTENT',
      tierLabel: 'Khá hay dùng (View Init)',
      frequency: 'Khá hay dùng (60%)',
      timing: 'Được gọi 1 lần sau khi view của component và các view con (@ViewChild) đã được khởi tạo xong.',
      useCase: 'Thao tác trực tiếp với DOM, tích hợp các thư viện bên thứ ba (Chart.js, Canvas, Highcharts, jQuery plugin), auto-focus input.',
      bestPractice: 'Không nên cập nhật state binding ở hook này vì dễ gây lỗi ExpressionChangedAfterItHasBeenCheckedError.',
    },
    {
      name: 'ngAfterContentInit',
      interfaceName: 'AfterContentInit',
      tier: 'VIEW_CONTENT',
      tierLabel: 'Khá hay dùng (Content Init)',
      frequency: 'Khá hay dùng (60%)',
      timing: 'Được gọi 1 lần sau khi nội dung chiếu từ bên ngoài (<ng-content>) và @ContentChild được nạp đầy đủ.',
      useCase: 'Xây dựng các component phức tạp như Tabs, Accordion, Modal, Stepper cần truy cập nội dung con được chiếu vào.',
      bestPractice: 'Dùng kết hợp với @ContentChild/@ContentChildren để đọc TemplateRef hoặc component con.',
    },
    {
      name: 'ngAfterContentChecked',
      interfaceName: 'AfterContentChecked',
      tier: 'RECHECK',
      tierLabel: 'Ít dùng (Content Re-check)',
      frequency: 'Ít dùng (20%)',
      timing: 'Được gọi sau mỗi chu kỳ kiểm tra (Change Detection) nội dung được chiếu vào component.',
      useCase: 'Kiểm tra lại nội dung chiếu sau mỗi lần Change Detection.',
      bestPractice: 'Hook này chạy rất thường xuyên. Tránh xử lý nặng nề tại đây để không làm giật lag giao diện.',
    },
    {
      name: 'ngAfterViewChecked',
      interfaceName: 'AfterViewChecked',
      tier: 'RECHECK',
      tierLabel: 'Ít dùng (View Re-check)',
      frequency: 'Ít dùng (20%)',
      timing: 'Được gọi sau mỗi chu kỳ kiểm tra View của component và các view con.',
      useCase: 'Đo đạc lại vị trí, kích thước thanh cuộn (scroll position), cập nhật canvas sau khi view đã re-render.',
      bestPractice: 'Hết sức thận trọng khi gán lại biến template tại đây. Luôn kiểm tra điều kiện để tránh vòng lặp vô hạn.',
    },
    {
      name: 'ngDoCheck',
      interfaceName: 'DoCheck',
      tier: 'DO_CHECK',
      tierLabel: 'Rất ít dùng / Nâng cao',
      frequency: 'Rất ít dùng (<5%)',
      timing: 'Được gọi trong MỌI chu kỳ Change Detection (sau ngOnChanges và ngOnInit).',
      useCase: 'Tự cài đặt thuật toán so sánh thay đổi sâu (Deep Check) khi người dùng mutate object hoặc array mà ngOnChanges bỏ qua.',
      bestPractice: 'Cực kỳ tốn hiệu năng CPU nếu viết code phức tạp. 99% trường hợp nên dùng Immutability ([...arr], {...obj}) thay vì ngDoCheck.',
    },
  ];

  // ==========================================================================
  // CONTROLLER ACTIONS
  // ==========================================================================

  toggleChildMount(): void {
    this.isChildMounted = !this.isChildMounted;
    this.addLog(
      this.isChildMounted ? 'ngOnInit' : 'ngOnDestroy',
      'CORE',
      this.isChildMounted
        ? '[Mount] Đã khởi tạo lại Component Con -> ngOnInit chuẩn bị kích hoạt!'
        : '[Unmount] Đã hủy Component Con khỏi DOM -> ngOnDestroy được kích hoạt để dọn dẹp tài nguyên!'
    );
  }

  changePrimitiveInputs(): void {
    if (!this.isChildMounted) return;
    this.childCount += 10;
    this.childTitle = `Tiêu đề được cập nhật lần ${this.childCount / 10}`;
    this.addLog(
      'ngOnChanges',
      'CORE',
      `[Update Primitive] Đổi title="${this.childTitle}" và count=${this.childCount}. Giá trị nguyên thủy thay đổi -> ngOnChanges chạy lập tức!`
    );
  }

  // Mutate Object: Giữ nguyên reference
  mutateObjectInput(): void {
    if (!this.isChildMounted) return;
    this.childUser.age += 1;
    this.addLog(
      'ngDoCheck',
      'DO_CHECK',
      `[Mutate Object] Thực hiện childUser.age++ = ${this.childUser.age}. THAM CHIẾU KHÔNG ĐỔI: ngOnChanges KHÔNG nhận biết, chỉ có ngDoCheck bắt được!`
    );
  }

  // Immutable Object: Tạo reference mới
  immutableObjectInput(): void {
    if (!this.isChildMounted) return;
    this.childUser = {
      ...this.childUser,
      age: this.childUser.age + 1,
    };
    this.addLog(
      'ngOnChanges',
      'CORE',
      `[Immutable Object] Tạo Object mới với {...user, age: ${this.childUser.age}}. THAM CHIẾU ĐÃ ĐỔI: Cả ngOnChanges và ngDoCheck đều nhận biết!`
    );
  }

  toggleProjectedContent(): void {
    this.isContentProjected = !this.isContentProjected;
    this.addLog(
      'ngAfterContentChecked',
      'RECHECK',
      this.isContentProjected
        ? '[Content Projection] Đã bật lại nội dung chiếu <ng-content>.'
        : '[Content Projection] Đã tắt nội dung chiếu <ng-content>.'
    );
  }

  triggerDummyChangeDetection(): void {
    this.addLog(
      'ngDoCheck',
      'DO_CHECK',
      '[Change Detection] Một sự kiện vừa xảy ra (click nút) -> Angular kích hoạt chu kỳ Change Detection (ngDoCheck, ngAfterContentChecked, ngAfterViewChecked chạy lại)!'
    );
  }

  onChildHookEvent(event: {
    hook: string;
    tier: 'CORE' | 'VIEW_CONTENT' | 'RECHECK' | 'DO_CHECK';
    detail: string;
  }): void {
    this.lifecycleStats[event.hook] = (this.lifecycleStats[event.hook] || 0) + 1;
    this.addLog(event.hook, event.tier, `[${event.hook}] ${event.detail}`);
  }

  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    hookName: string,
    tier: 'CORE' | 'VIEW_CONTENT' | 'RECHECK' | 'DO_CHECK',
    detail: string
  ): void {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;

    this.logs.unshift({
      id: this.logIdCounter++,
      time,
      hookName,
      tier,
      detail,
    });

    if (this.logs.length > 35) {
      this.logs.pop();
    }
  }
}
