import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// ============================================================================
// 1. COUNTER COMPONENT (Dùng để kiểm chứng số lượng Instance được tạo ra)
// ============================================================================
let globalCounterInstanceId = 0;

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="counter-box" [class.highlight]="isNewlyCreated">
      <div class="counter-header">
        <span class="badge-instance">Instance #{{ instanceId }}</span>
        <span class="created-time">Tạo lúc: {{ createdAt }}</span>
      </div>
      <div class="counter-body">
        <span class="counter-label">{{ label }}:</span>
        <span class="counter-value">{{ count }}</span>
      </div>
      <div class="counter-actions">
        <button class="btn-sm btn-minus" (click)="decrement()">-</button>
        <button class="btn-sm btn-plus" (click)="increment()">+</button>
        <button class="btn-sm btn-reset" (click)="reset()">Reset</button>
      </div>
    </div>
  `,
  styles: [
    `
      .counter-box {
        display: inline-flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        min-width: 220px;
        transition: all 0.3s ease;
      }
      .counter-box.highlight {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        background: #eff6ff;
      }
      .counter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
      }
      .badge-instance {
        background: #0284c7;
        color: #fff;
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
        font-weight: 600;
      }
      .created-time {
        color: #64748b;
        font-family: monospace;
      }
      .counter-body {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .counter-label {
        font-weight: 500;
        color: #334155;
        font-size: 0.85rem;
      }
      .counter-value {
        font-size: 1.4rem;
        font-weight: 800;
        color: #0f172a;
        font-family: monospace;
      }
      .counter-actions {
        display: flex;
        gap: 0.35rem;
      }
      .btn-sm {
        flex: 1;
        padding: 0.25rem 0.5rem;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.8rem;
        transition: background 0.15s ease;
      }
      .btn-sm:hover {
        background: #f1f5f9;
      }
      .btn-minus {
        color: #dc2626;
      }
      .btn-plus {
        color: #16a34a;
      }
      .btn-reset {
        color: #64748b;
      }
    `,
  ],
})
export class CounterComponent implements OnInit, OnDestroy {
  @Input() label: string = 'Counter';
  instanceId: number = 0;
  createdAt: string = '';
  count: number = 0;
  isNewlyCreated: boolean = true;

  constructor() {
    globalCounterInstanceId++;
    this.instanceId = globalCounterInstanceId;
    const now = new Date();
    this.createdAt = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isNewlyCreated = false;
    }, 1500);
  }

  ngOnDestroy(): void {
    // Component unmounts
  }

  increment(): void {
    this.count++;
  }

  decrement(): void {
    this.count--;
  }

  reset(): void {
    this.count = 0;
  }
}

// ============================================================================
// 2. TAB PANEL CONTENT DIRECTIVE (@Directive ng-template[tabPanelContent])
// ============================================================================
@Directive({
  selector: 'ng-template[tabPanelContent]',
  standalone: true,
})
export class TabPanelContentDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}

// ============================================================================
// 3. TAB PANEL COMPONENT (@ContentChild TemplateRef)
// ============================================================================
@Component({
  selector: 'app-tab-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Template ngầm định (implicit) dùng khi không khai báo ng-template lazy -->
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class TabPanelComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() badge: string = '';

  // 1. Implicit template: hứng lấy <ng-content> thông thường (Eager initialization)
  @ViewChild(TemplateRef, { static: true }) implicitBody!: TemplateRef<unknown>;

  // 2. Explicit template: query ng-template có gắn directive [tabPanelContent] (Lazy initialization)
  @ContentChild(TabPanelContentDirective, { static: true, read: TemplateRef })
  explicitBody?: TemplateRef<unknown>;

  // Ưu tiên trả về explicit (lazy) template nếu có; nếu không thì dùng implicit template
  get panelBody(): TemplateRef<unknown> {
    return this.explicitBody || this.implicitBody;
  }
}

// ============================================================================
// 4. TAB GROUP COMPONENT (@ContentChildren & QueryList.changes)
// ============================================================================
@Component({
  selector: 'app-tab-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-tab-group">
      <!-- Tab Headers -->
      <div class="tab-nav-bar" role="tablist">
        @for (tab of tabPanelList; track $index; let idx = $index) {
          <button
            type="button"
            class="tab-nav-item"
            [class.active]="idx === tabActiveIndex"
            (click)="selectItem(idx)"
            role="tab"
            [attr.aria-selected]="idx === tabActiveIndex"
          >
            @if (tab.icon) {
              <span class="tab-icon">{{ tab.icon }}</span>
            }
            <span class="tab-title">{{ tab.title }}</span>
            @if (tab.badge) {
              <span class="tab-badge">{{ tab.badge }}</span>
            }
          </button>
        }
      </div>

      <!-- Tab Body (Render với *ngTemplateOutlet) -->
      <div class="tab-content-area">
        @for (tab of tabPanelList; track $index; let idx = $index) {
          @if (idx === tabActiveIndex) {
            <div class="tab-pane-container">
              <ng-container *ngTemplateOutlet="tab.panelBody"></ng-container>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .custom-tab-group {
        display: flex;
        flex-direction: column;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        overflow: hidden;
        background: #ffffff;
      }
      .tab-nav-bar {
        display: flex;
        gap: 0.25rem;
        background: #f1f5f9;
        padding: 0.4rem 0.5rem 0;
        border-bottom: 1px solid #e2e8f0;
        overflow-x: auto;
      }
      .tab-nav-item {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 1rem;
        border: 1px solid transparent;
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        background: transparent;
        color: #64748b;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .tab-nav-item:hover {
        color: #1e293b;
        background: rgba(255, 255, 255, 0.6);
      }
      .tab-nav-item.active {
        color: #2563eb;
        background: #ffffff;
        border-color: #cbd5e1;
        box-shadow: 0 -2px 0 0 #2563eb;
      }
      .tab-icon {
        font-size: 1rem;
      }
      .tab-badge {
        background: #e2e8f0;
        color: #475569;
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.1rem 0.4rem;
        border-radius: 9999px;
      }
      .tab-nav-item.active .tab-badge {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .tab-content-area {
        padding: 1.25rem;
        min-height: 140px;
      }
      .tab-pane-container {
        animation: fadeIn 0.2s ease-in-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(3px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class TabGroupComponent implements AfterContentInit, OnDestroy {
  @Input() tabActiveIndex: number = 0;
  @Output() tabActiveChange = new EventEmitter<number>();
  @Output() tabListChanged = new EventEmitter<number>();

  // Query tất cả các TabPanelComponent được chiếu (project) vào giữa <app-tab-group> ... </app-tab-group>
  @ContentChildren(TabPanelComponent)
  tabPanelList!: QueryList<TabPanelComponent>;

  private changesSub?: Subscription;

  ngAfterContentInit(): void {
    // Lắng nghe sự kiện changes của QueryList khi các tab con được thêm/xóa động
    this.changesSub = this.tabPanelList.changes.subscribe((updatedList: QueryList<TabPanelComponent>) => {
      this.tabListChanged.emit(updatedList.length);
      if (this.tabPanelList.length <= this.tabActiveIndex) {
        this.selectItem(0);
      }
    });
  }

  ngOnDestroy(): void {
    this.changesSub?.unsubscribe();
  }

  selectItem(idx: number): void {
    if (this.tabActiveIndex !== idx) {
      this.tabActiveIndex = idx;
      this.tabActiveChange.emit(idx);
    }
  }
}

// ============================================================================
// 5. MAIN DEMO COMPONENT (Day017ContentchildContentchildren)
// ============================================================================
export interface ActivityLog {
  id: number;
  time: string;
  source: 'EAGER' | 'LAZY' | 'DYNAMIC' | 'QUERY';
  message: string;
}

export interface DynamicTab {
  id: number;
  title: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-day017-contentchild-contentchildren',
  standalone: true,
  imports: [
    CommonModule,
    CounterComponent,
    TabPanelContentDirective,
    TabPanelComponent,
    TabGroupComponent,
  ],
  templateUrl: './day017-contentchild-contentchildren.html',
  styleUrl: './day017-contentchild-contentchildren.scss',
})
export class Day017ContentchildContentchildren {
  // Tab active indexes cho các phần demo
  eagerActiveTab: number = 0;
  lazyActiveTab: number = 0;
  dynamicActiveTab: number = 0;

  // Danh sách dynamic tabs phục vụ minh họa ContentChildren.changes
  dynamicTabs: DynamicTab[] = [
    { id: 1, title: 'Thông tin chung', icon: '📋', description: 'Tab 1: Thông tin cấu hình hệ thống' },
    { id: 2, title: 'Thống kê lượng truy cập', icon: '📊', description: 'Tab 2: Biểu đồ và dữ liệu phân tích' },
    { id: 3, title: 'Cài đặt tài khoản', icon: '⚙️', description: 'Tab 3: Tùy chỉnh quyền và bảo mật' },
  ];
  private nextTabId: number = 4;

  // Activity logs
  logs: ActivityLog[] = [];
  private logCounter = 1;

  constructor() {
    this.addLog('QUERY', 'Day 017 Component đã sẵn sàng. Global Counter ID hiện tại: ' + globalCounterInstanceId);
  }

  get totalGlobalCounters(): number {
    return globalCounterInstanceId;
  }

  onEagerTabChange(index: number): void {
    this.eagerActiveTab = index;
    this.addLog('EAGER', `Chuyển sang Tab Eager index #${index + 1}`);
  }

  onLazyTabChange(index: number): void {
    this.lazyActiveTab = index;
    this.addLog(
      'LAZY',
      `Chuyển sang Tab Lazy index #${index + 1} (TemplateRef được render on-demand!)`
    );
  }

  onDynamicTabChange(index: number): void {
    this.dynamicActiveTab = index;
    this.addLog('DYNAMIC', `Chuyển sang Dynamic Tab index #${index}`);
  }

  onDynamicTabListChanged(count: number): void {
    this.addLog(
      'QUERY',
      `@ContentChildren(TabPanelComponent).changes vừa kích hoạt! Số lượng tab hiện tại: ${count}`
    );
  }

  addDynamicTab(): void {
    const newId = this.nextTabId++;
    const icons = ['📁', '🔔', '💬', '🚀', '💡', '🎨'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    this.dynamicTabs.push({
      id: newId,
      title: `Tab mới #${newId}`,
      icon: randomIcon,
      description: `Nội dung được tạo động lúc ${new Date().toLocaleTimeString()} - ID ${newId}`,
    });
    this.addLog('DYNAMIC', `Đã thêm Dynamic Tab #${newId}`);
  }

  removeDynamicTab(index: number): void {
    if (this.dynamicTabs.length <= 1) {
      this.addLog('DYNAMIC', 'Cần giữ lại ít nhất 1 tab để minh họa');
      return;
    }
    const removed = this.dynamicTabs.splice(index, 1);
    this.addLog('DYNAMIC', `Đã xóa "${removed[0].title}" (ID: ${removed[0].id})`);
  }

  clearLogs(): void {
    this.logs = [];
  }

  private addLog(source: 'EAGER' | 'LAZY' | 'DYNAMIC' | 'QUERY', message: string): void {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;

    this.logs.unshift({
      id: this.logCounter++,
      time,
      source,
      message,
    });

    if (this.logs.length > 25) {
      this.logs.pop();
    }
  }
}
