import {
  Component,
  EventEmitter,
  forwardRef,
  Inject,
  Injectable,
  InjectionToken,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ============================================================================
// 1. INJECTION TOKENS & SERVICES CHO DEMO 4 LOẠI PROVIDER SYNTAX
// ============================================================================

// --- A. useValue Demo ---
export interface AppConfig {
  appName: string;
  version: string;
  environment: 'development' | 'production' | 'staging';
  maxTabsAllowed: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'Angular 100 Days Practice (Day 16)',
  version: '22.1.0',
  environment: 'development',
  maxTabsAllowed: 8,
};

// --- B. useClass Demo ---
@Injectable()
export class LoggerService {
  log(msg: string): string {
    return `[DefaultLogger] ${msg}`;
  }
}

@Injectable()
export class TimestampLoggerService extends LoggerService {
  override log(msg: string): string {
    const time = new Date().toLocaleTimeString();
    return `[TimestampLogger @ ${time}] ${msg}`;
  }
}

// --- C. useFactory Demo ---
export interface GreetingInfo {
  message: string;
  greetingTime: string;
}

export const GREETING_TOKEN = new InjectionToken<GreetingInfo>('GREETING_TOKEN');

export function greetingFactory(): GreetingInfo {
  const hours = new Date().getHours();
  let timeStr = 'buổi sáng ☀️';
  if (hours >= 12 && hours < 18) {
    timeStr = 'buổi chiều 🌤️';
  } else if (hours >= 18) {
    timeStr = 'buổi tối 🌙';
  }
  return {
    message: `Xin chào ${timeStr}! Chúc bạn thực hành Angular vui vẻ.`,
    greetingTime: new Date().toLocaleTimeString(),
  };
}

// ============================================================================
// 2. PARENT COMPONENT: TabGroupComponent
// ============================================================================
@Component({
  selector: 'app-tab-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="standard-tab-group">
      <!-- Header dạng thẻ đơn giản -->
      <div class="tab-header" role="tablist">
        @for (tab of tabPanelList; track tab; let idx = $index) {
          <div
            class="tab-item-header"
            [class.active]="idx === tabActiveIndex"
            role="tab"
            (click)="selectItem(idx)"
          >
            <span class="tab-title">{{ tab.title }}</span>
          </div>
        }
      </div>

      <!-- Body hiển thị tab đang active -->
      <div class="tab-body">
        @for (tab of tabPanelList; track tab; let idx = $index) {
          @if (idx === tabActiveIndex) {
            <div class="tab-content-pane">
              <ng-container *ngTemplateOutlet="tab.panelBody"></ng-container>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .standard-tab-group {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #ffffff;
        overflow: hidden;
      }
      .tab-header {
        display: flex;
        background: #f1f5f9;
        border-bottom: 1px solid #cbd5e1;
        overflow-x: auto;
      }
      .tab-item-header {
        padding: 0.6rem 1.1rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        border-right: 1px solid #e2e8f0;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
        user-select: none;
      }
      .tab-item-header:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
      .tab-item-header.active {
        background: #ffffff;
        color: #2563eb;
        border-bottom-color: #2563eb;
      }
      .tab-body {
        padding: 1.25rem;
        min-height: 120px;
      }
    `,
  ],
})
export class TabGroupComponent {
  tabPanelList: TabPanelComponent[] = [];

  @Input() tabActiveIndex = 0;
  @Output() tabActiveChange = new EventEmitter<number>();
  @Output() panelListChanged = new EventEmitter<number>();

  selectItem(idx: number): void {
    if (this.tabActiveIndex !== idx) {
      this.tabActiveIndex = idx;
      this.tabActiveChange.emit(idx);
    }
  }

  addTabPanel(tab: TabPanelComponent): void {
    this.tabPanelList.push(tab);
    this.panelListChanged.emit(this.tabPanelList.length);
  }

  removeTabPanel(tab: TabPanelComponent): void {
    let index = -1;
    const newList: TabPanelComponent[] = [];
    this.tabPanelList.forEach((item, idx) => {
      if (tab === item) {
        index = idx;
        return;
      }
      newList.push(item);
    });
    this.tabPanelList = newList;
    this.panelListChanged.emit(this.tabPanelList.length);

    if (index !== -1 && this.tabActiveIndex >= this.tabPanelList.length) {
      this.selectItem(Math.max(0, this.tabPanelList.length - 1));
    }
  }
}

// ============================================================================
// 3. CHILD COMPONENT: TabPanelComponent (Inject Parent TabGroupComponent)
// ============================================================================
@Component({
  selector: 'app-tab-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #implicitTemplate>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class TabPanelComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Tab Panel';
  @ViewChild('implicitTemplate', { static: true }) panelBody!: TemplateRef<unknown>;

  // Điểm nhấn Day 16: Inject Parent Component vào Child Component
  constructor(private tabGroup: TabGroupComponent) {}

  ngOnInit(): void {
    // Tự đăng ký với component cha khi khởi tạo
    this.tabGroup.addTabPanel(this);
  }

  ngOnDestroy(): void {
    // Tự hủy đăng ký với component cha khi bị tiêu hủy
    this.tabGroup.removeTabPanel(this);
  }
}

// ============================================================================
// 4. OVERRIDE PARENT: BsTabGroupComponent (useExisting & forwardRef)
// ============================================================================
// Khai báo provider ở ngoài class, sử dụng forwardRef để giải quyết vấn đề
// "Class 'BsTabGroupComponent' used before its declaration"
export const BsTabGroupProvider = {
  provide: TabGroupComponent,
  useExisting: forwardRef(() => BsTabGroupComponent),
};

@Component({
  selector: 'app-bs-tab-group',
  standalone: true,
  imports: [CommonModule],
  providers: [BsTabGroupProvider],
  template: `
    <div class="bs-tab-group">
      <!-- Bootstrap Nav Tabs Style -->
      <ul class="nav nav-tabs" role="tablist">
        @for (tab of tabPanelList; track tab; let idx = $index) {
          <li class="nav-item" role="presentation">
            <button
              type="button"
              class="nav-link"
              [class.active]="idx === tabActiveIndex"
              (click)="selectItem(idx)"
              role="tab"
            >
              <span class="badge-dot" [class.active-dot]="idx === tabActiveIndex"></span>
              {{ tab.title }}
            </button>
          </li>
        }
      </ul>

      <!-- Tab Content Area -->
      <div class="tab-content">
        @for (tab of tabPanelList; track tab; let idx = $index) {
          @if (idx === tabActiveIndex) {
            <div class="tab-pane active" role="tabpanel">
              <ng-container *ngTemplateOutlet="tab.panelBody"></ng-container>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .bs-tab-group {
        border-radius: 10px;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        overflow: hidden;
      }
      .nav-tabs {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0.5rem 0.5rem 0;
        background: #f8fafc;
        border-bottom: 2px solid #e2e8f0;
        gap: 0.35rem;
        overflow-x: auto;
      }
      .nav-item {
        margin: 0;
      }
      .nav-link {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.65rem 1.15rem;
        border: 1px solid transparent;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        background: transparent;
        color: #64748b;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .nav-link:hover {
        color: #1e293b;
        background: rgba(226, 232, 240, 0.5);
      }
      .nav-link.active {
        color: #0284c7;
        background: #ffffff;
        border-color: #e2e8f0;
        border-bottom-color: transparent;
        box-shadow: 0 -2px 0 0 #0284c7;
      }
      .badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #cbd5e1;
      }
      .badge-dot.active-dot {
        background: #0284c7;
        box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
      }
      .tab-content {
        padding: 1.5rem;
        min-height: 130px;
      }
    `,
  ],
})
export class BsTabGroupComponent extends TabGroupComponent {}

// ============================================================================
// 5. MAIN HOST COMPONENT: Day016DependencyInjectionInAngularPart2
// ============================================================================
export interface DiLog {
  id: number;
  time: string;
  source: 'INJECT' | 'BS_TAB' | 'STANDARD_TAB' | 'PROVIDER';
  message: string;
}

@Component({
  selector: 'app-day016-dependency-injection-in-angular-part-2',
  standalone: true,
  imports: [
    CommonModule,
    TabGroupComponent,
    TabPanelComponent,
    BsTabGroupComponent,
  ],
  providers: [
    // 1. useValue
    { provide: APP_CONFIG, useValue: DEFAULT_APP_CONFIG },
    // 2. useClass: Override LoggerService bằng TimestampLoggerService
    { provide: LoggerService, useClass: TimestampLoggerService },
    // 3. useFactory: Khởi tạo giá trị động theo hàm factory
    { provide: GREETING_TOKEN, useFactory: greetingFactory },
  ],
  templateUrl: './day016-dependency-injection-in-angular-part-2.html',
  styleUrl: './day016-dependency-injection-in-angular-part-2.scss',
})
export class Day016DependencyInjectionInAngularPart2 implements OnInit {
  standardActiveTab: number = 0;
  bsActiveTab: number = 0;

  // Danh sách tab động để thử nghiệm lifecycle ngOnInit / ngOnDestroy
  dynamicPanels: { id: number; title: string; content: string }[] = [
    { id: 1, title: 'Panel A', content: 'Nội dung Panel A - Đã tự động gọi tabGroup.addTabPanel(this) khi ngOnInit' },
    { id: 2, title: 'Panel B', content: 'Nội dung Panel B - Hoạt động độc lập nhờ DI Component Tree' },
    { id: 3, title: 'Panel C', content: 'Nội dung Panel C - Tự động removeTabPanel khi bị xóa khỏi DOM' },
  ];
  private panelCounter = 4;

  // Logs tương tác
  logs: DiLog[] = [];
  private logIdCounter = 1;

  // Inject các dependencies minh họa 4 provider types
  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    public logger: LoggerService,
    @Inject(GREETING_TOKEN) public greeting: GreetingInfo
  ) {}

  ngOnInit(): void {
    const logMsg = this.logger.log('Khởi tạo Day 16 Component thành công.');
    this.addLog('PROVIDER', logMsg);
  }

  onStandardTabChange(index: number): void {
    this.standardActiveTab = index;
    this.addLog('STANDARD_TAB', `Standard TabGroup chuyển sang index #${index}`);
  }

  onBsTabChange(index: number): void {
    this.bsActiveTab = index;
    this.addLog('BS_TAB', `BsTabGroup (useExisting) chuyển sang index #${index}`);
  }

  onPanelListChanged(count: number, source: 'STANDARD_TAB' | 'BS_TAB'): void {
    this.addLog(source, `Số lượng tab trong ${source} vừa cập nhật: ${count}`);
  }

  addDynamicPanel(): void {
    const newId = this.panelCounter++;
    this.dynamicPanels.push({
      id: newId,
      title: `Panel mới #${newId}`,
      content: `Nội dung được tạo động lúc ${new Date().toLocaleTimeString()}. TabPanelComponent đã inject parent TabGroup và tự register qua ngOnInit!`,
    });
    this.addLog('INJECT', `Đã thêm Panel #${newId} vào dynamicPanels`);
  }

  removeDynamicPanel(index: number): void {
    if (this.dynamicPanels.length <= 1) {
      this.addLog('INJECT', 'Cần giữ lại ít nhất 1 panel');
      return;
    }
    const removed = this.dynamicPanels.splice(index, 1);
    this.addLog('INJECT', `Đã xóa "${removed[0].title}". ngOnDestroy đã gọi tabGroup.removeTabPanel()!`);
  }

  clearLogs(): void {
    this.logs = [];
  }

  private addLog(source: 'INJECT' | 'BS_TAB' | 'STANDARD_TAB' | 'PROVIDER', message: string): void {
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
      source,
      message,
    });

    if (this.logs.length > 20) {
      this.logs.pop();
    }
  }
}
