import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AsyncSubject,
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
  delay,
  finalize,
  interval,
  map,
  of,
  share,
  shareReplay,
  take,
  tap,
  timer,
} from 'rxjs';

/**
 * ============================================================================
 * INTERFACES & DATA MODELS (Based on docs/Day026-rxjs-subject-multicast.md)
 * ============================================================================
 */
export interface ActivityLog {
  id: number;
  time: string;
  type: 'NEXT' | 'EMIT' | 'SUB_A' | 'SUB_B' | 'COMPLETE' | 'CACHE' | 'RESET' | 'INFO';
  operator: string;
  message: string;
}

export interface SubjectDecisionSpec {
  name: string;
  type: 'Subject Variant' | 'Multicast Operator';
  initialValueRequired: string;
  lateSubscriberReceives: string;
  behaviorOnComplete: string;
  angularUseCase: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-day026-rxjs-subject-multicast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day026-rxjs-subject-multicast.html',
  styleUrl: './day026-rxjs-subject-multicast.scss',
})
export class Day026RxjsSubjectMulticast implements OnInit, OnDestroy {
  // Navigation Tabs
  activeTab: 'subject-types' | 'unicast-multicast' | 'share-replay' | 'event-bus' | 'cheatsheet' =
    'subject-types';

  // ============================================================================
  // DEMO 1: The 4 Subject Variants (Subject, BehaviorSubject, ReplaySubject, AsyncSubject)
  // ============================================================================
  selectedSubjectType: 'Subject' | 'BehaviorSubject' | 'ReplaySubject' | 'AsyncSubject' =
    'BehaviorSubject';
  private activeSubject?: Subject<any>;
  subjectEmissionCounter: number = 1;
  isSubjectCompleted: boolean = false;

  // Observers state
  observerALogs: Array<{ value: any; time: string; note: string }> = [];
  observerBLogs: Array<{ value: any; time: string; note: string }> = [];
  isObserverASubscribed: boolean = false;
  isObserverBSubscribed: boolean = false;
  private subA?: Subscription;
  private subB?: Subscription;

  // ============================================================================
  // DEMO 2: Unicast vs Multicast (YouTube Live Metaphor)
  // ============================================================================
  unicastMode: boolean = true; // true: Unicast (Cold), false: Multicast (Hot with share)
  isLiveRunning: boolean = false;
  unicastViewerAValues: number[] = [];
  unicastViewerBValues: number[] = [];
  private unicastStream$?: Observable<number>;
  private unicastSubA?: Subscription;
  private unicastSubB?: Subscription;

  // ============================================================================
  // DEMO 3: share() vs shareReplay() (HTTP Caching)
  // ============================================================================
  useShareReplay: boolean = true;
  httpNetworkRequestCount: number = 0;
  cachedJokeData: string | null = null;
  componentAListening: boolean = false;
  componentBListening: boolean = false;
  componentCListening: boolean = false;
  componentAResult: string = '';
  componentBResult: string = '';
  componentCResult: string = '';
  isFetchingApi: boolean = false;
  private cachedApi$?: Observable<string>;
  private subCompA?: Subscription;
  private subCompB?: Subscription;
  private subCompC?: Subscription;

  // ============================================================================
  // DEMO 4: Subject as Event Bus / State Service (Cart State)
  // ============================================================================
  private cartSubject = new BehaviorSubject<CartItem[]>([
    { id: 1, name: 'Angular 19 Mastery Course', price: 49 },
  ]);
  cartItems$: Observable<CartItem[]> = this.cartSubject.asObservable();
  cartItemsList: CartItem[] = [];
  cartTotalCount: number = 0;
  cartTotalPrice: number = 0;
  private cartSub?: Subscription;

  // ============================================================================
  // ACTIVITY LOGGER & CLEANUP
  // ============================================================================
  logs: ActivityLog[] = [];
  private logIdCounter: number = 1;
  private destroy$ = new Subject<void>();

  // ============================================================================
  // CHEATSHEET & DECISION MATRIX
  // ============================================================================
  readonly cheatsheetSpecs: SubjectDecisionSpec[] = [
    {
      name: 'Subject',
      type: 'Subject Variant',
      initialValueRequired: 'Không',
      lateSubscriberReceives: 'Chỉ nhận giá trị phát ra SAU khi đã subscribe (bỏ lỡ dữ liệu quá khứ).',
      behaviorOnComplete: 'Sau khi complete, late subscriber chỉ nhận tín hiệu complete.',
      angularUseCase: 'Event Bus, phát tín hiệu hành động (VD: clickSearch$, destroy$).',
    },
    {
      name: 'BehaviorSubject',
      type: 'Subject Variant',
      initialValueRequired: 'Bắt buộc (initialValue)',
      lateSubscriberReceives: 'Nhận ngay lập tức GIÁ TRỊ HIỆN TẠI (current value) mới nhất.',
      behaviorOnComplete: 'Sau khi complete, late subscriber chỉ nhận tín hiệu complete (không nhận current value nữa).',
      angularUseCase: 'Quản lý state: Thông tin user đăng nhập (currentUser$), giỏ hàng, theme mode.',
    },
    {
      name: 'ReplaySubject(buffer, windowTime)',
      type: 'Subject Variant',
      initialValueRequired: 'Không',
      lateSubscriberReceives: 'Nhận lại toàn bộ N giá trị trong buffer (hoặc theo khung thời gian windowTime).',
      behaviorOnComplete: 'Kể cả sau khi complete, late subscriber VẪN nhận đủ các giá trị buffer rồi mới complete.',
      angularUseCase: 'Lưu trữ lịch sử chat gần nhất, danh sách thông báo gần đây, route history.',
    },
    {
      name: 'AsyncSubject',
      type: 'Subject Variant',
      initialValueRequired: 'Không',
      lateSubscriberReceives: 'CHỈ nhận giá trị CUỐI CÙNG của stream và CHỈ KHI stream đã complete.',
      behaviorOnComplete: 'Phát giá trị cuối cùng rồi complete ngay lập tức cho mọi subscriber (giống Promise).',
      angularUseCase: 'Tính toán nặng chỉ cần lấy kết quả cuối cùng, export file, fetch cấu hình 1 lần.',
    },
    {
      name: 'share()',
      type: 'Multicast Operator',
      initialValueRequired: 'Không',
      lateSubscriberReceives: 'Nhận giá trị theo thời gian thực (nối vào execution đang chạy). Tự hủy khi subscribers = 0.',
      behaviorOnComplete: 'Complete theo source stream. Khi có subscriber mới sau đó sẽ tạo execution mới.',
      angularUseCase: 'Multicast sự kiện DOM (mousemove, scroll), tránh tạo nhiều listeners độc lập.',
    },
    {
      name: 'shareReplay(config)',
      type: 'Multicast Operator',
      initialValueRequired: 'Không',
      lateSubscriberReceives: 'Nhận lại N giá trị đã phát gần nhất từ cache ReplaySubject.',
      behaviorOnComplete: 'Vẫn lưu giữ cache và replay cho subscriber mới đến sau.',
      angularUseCase: 'HTTP Request Caching trong Angular Service, ngăn chặn gọi trùng API khi dùng nhiều AsyncPipe.',
    },
  ];

  ngOnInit(): void {
    this.addLog(
      'INFO',
      'System',
      'Khởi tạo Day026RxjsSubjectMulticast: Sẵn sàng khám phá Subject, Multicasting, share & shareReplay!'
    );
    this.resetSubjectSimulator();
    this.setupCartSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subA?.unsubscribe();
    this.subB?.unsubscribe();
    this.unicastSubA?.unsubscribe();
    this.unicastSubB?.unsubscribe();
    this.subCompA?.unsubscribe();
    this.subCompB?.unsubscribe();
    this.subCompC?.unsubscribe();
    this.cartSub?.unsubscribe();
  }

  // ============================================================================
  // 1. DEMO: The 4 Subject Variants
  // ============================================================================
  onSubjectTypeSelect(type: 'Subject' | 'BehaviorSubject' | 'ReplaySubject' | 'AsyncSubject'): void {
    this.selectedSubjectType = type;
    this.resetSubjectSimulator();
    this.addLog('INFO', 'Simulator', `Chuyển sang thử nghiệm: ${type}`);
  }

  resetSubjectSimulator(): void {
    this.subA?.unsubscribe();
    this.subB?.unsubscribe();
    this.isObserverASubscribed = false;
    this.isObserverBSubscribed = false;
    this.observerALogs = [];
    this.observerBLogs = [];
    this.isSubjectCompleted = false;
    this.subjectEmissionCounter = 1;

    switch (this.selectedSubjectType) {
      case 'Subject':
        this.activeSubject = new Subject<number>();
        break;
      case 'BehaviorSubject':
        this.activeSubject = new BehaviorSubject<number>(0); // 0 là giá trị khởi tạo
        break;
      case 'ReplaySubject':
        this.activeSubject = new ReplaySubject<number>(3); // Buffer 3 giá trị
        break;
      case 'AsyncSubject':
        this.activeSubject = new AsyncSubject<number>();
        break;
    }

    this.addLog(
      'RESET',
      this.selectedSubjectType,
      `Đã khởi tạo mới ${this.selectedSubjectType}${
        this.selectedSubjectType === 'BehaviorSubject'
          ? ' với giá trị ban đầu = 0'
          : this.selectedSubjectType === 'ReplaySubject'
          ? ' với buffer = 3'
          : ''
      }`
    );
  }

  subscribeObserverA(): void {
    if (this.isObserverASubscribed || !this.activeSubject) return;

    this.isObserverASubscribed = true;
    this.addLog('SUB_A', this.selectedSubjectType, 'Observer A đã subscribe!');

    this.subA = this.activeSubject.subscribe({
      next: (val) => {
        this.observerALogs.push({
          value: val,
          time: new Date().toLocaleTimeString(),
          note: 'Nhận giá trị',
        });
        this.addLog('SUB_A', this.selectedSubjectType, `Observer A nhận: ${val}`);
      },
      complete: () => {
        this.observerALogs.push({
          value: '🏁 Complete',
          time: new Date().toLocaleTimeString(),
          note: 'Hoàn tất stream',
        });
        this.addLog('COMPLETE', this.selectedSubjectType, 'Observer A nhận Complete signal.');
      },
    });
  }

  subscribeObserverB(): void {
    if (this.isObserverBSubscribed || !this.activeSubject) return;

    this.isObserverBSubscribed = true;
    this.addLog(
      'SUB_B',
      this.selectedSubjectType,
      'Observer B (Late Subscriber) đã subscribe sau khi một số giá trị đã phát!'
    );

    this.subB = this.activeSubject.subscribe({
      next: (val) => {
        this.observerBLogs.push({
          value: val,
          time: new Date().toLocaleTimeString(),
          note: 'Nhận giá trị',
        });
        this.addLog('SUB_B', this.selectedSubjectType, `Observer B nhận: ${val}`);
      },
      complete: () => {
        this.observerBLogs.push({
          value: '🏁 Complete',
          time: new Date().toLocaleTimeString(),
          note: 'Hoàn tất stream',
        });
        this.addLog('COMPLETE', this.selectedSubjectType, 'Observer B nhận Complete signal.');
      },
    });
  }

  emitNextValue(): void {
    if (!this.activeSubject || this.isSubjectCompleted) return;

    const val = this.subjectEmissionCounter++;
    this.addLog('EMIT', this.selectedSubjectType, `next(${val}) được gọi!`);
    this.activeSubject.next(val);
  }

  completeSubject(): void {
    if (!this.activeSubject || this.isSubjectCompleted) return;

    this.isSubjectCompleted = true;
    this.addLog(
      'COMPLETE',
      this.selectedSubjectType,
      'complete() được gọi! Stream kết thúc.'
    );
    this.activeSubject.complete();
  }

  // ============================================================================
  // 2. DEMO: Unicast vs Multicast (YouTube Live Metaphor)
  // ============================================================================
  toggleUnicastMode(unicast: boolean): void {
    this.unicastMode = unicast;
    this.stopLiveSimulation();
    this.addLog(
      'INFO',
      unicast ? 'Unicast' : 'Multicast',
      unicast
        ? 'Chuyển sang Unicast: Mỗi người xem xem video thu sẵn từ giây số 0!'
        : 'Chuyển sang Multicast: Tất cả người xem xem buổi phát sóng Trực tiếp (Live) cùng thời điểm!'
    );
  }

  startLiveSimulation(): void {
    this.stopLiveSimulation();
    this.isLiveRunning = true;
    this.unicastViewerAValues = [];
    this.unicastViewerBValues = [];

    const base$ = interval(600).pipe(
      take(8),
      finalize(() => {
        this.isLiveRunning = false;
        this.addLog('COMPLETE', 'Broadcast', 'Buổi phát sóng đã kết thúc!');
      })
    );

    if (this.unicastMode) {
      // Unicast: cold observable
      this.unicastStream$ = base$;
    } else {
      // Multicast: hot stream chia sẻ bằng share()
      this.unicastStream$ = base$.pipe(share());
    }

    // Viewer A xem ngay lúc 0ms
    this.addLog('INFO', 'Viewer A', 'Người xem A bắt đầu xem!');
    this.unicastSubA = this.unicastStream$.subscribe((frame) => {
      this.unicastViewerAValues.push(frame);
    });

    // Viewer B vào xem trễ sau 1800ms
    timer(1800).subscribe(() => {
      if (this.isLiveRunning && this.unicastStream$) {
        this.addLog(
          'INFO',
          'Viewer B',
          'Người xem B vào xem trễ sau ~1.8s! Quan sát frame đầu tiên người B nhận được:'
        );
        this.unicastSubB = this.unicastStream$.subscribe((frame) => {
          this.unicastViewerBValues.push(frame);
        });
      }
    });
  }

  stopLiveSimulation(): void {
    this.isLiveRunning = false;
    this.unicastSubA?.unsubscribe();
    this.unicastSubB?.unsubscribe();
  }

  // ============================================================================
  // 3. DEMO: share() vs shareReplay() (HTTP Caching)
  // ============================================================================
  private getMockJokeApi(): Observable<string> {
    this.httpNetworkRequestCount++;
    this.isFetchingApi = true;
    this.addLog(
      'CACHE',
      'HTTP Client',
      `📡 Gửi HTTP GET request thực sự lên Server! (Tổng số request đã gửi: ${this.httpNetworkRequestCount})`
    );

    const randomJokes = [
      'Chuck Norris can unit test an entire application with a single assert.',
      'Why do Angular developers wear glasses? Because they don\'t C#.',
      'There are 10 types of people in the world: those who understand binary, and those who don\'t.',
      'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
    ];
    const pickedJoke = randomJokes[Math.floor(Math.random() * randomJokes.length)];

    return of(pickedJoke).pipe(
      delay(700),
      finalize(() => {
        this.isFetchingApi = false;
      })
    );
  }

  getJokeStream(): Observable<string> {
    if (!this.cachedApi$) {
      if (this.useShareReplay) {
        // Có shareReplay: chia sẻ kết quả và cache lại
        this.cachedApi$ = this.getMockJokeApi().pipe(
          tap((joke) => (this.cachedJokeData = joke)),
          shareReplay({ bufferSize: 1, refCount: true })
        );
      } else {
        // Không dùng shareReplay: mỗi lần subscribe là 1 lần gọi API mới!
        this.cachedApi$ = this.getMockJokeApi().pipe(
          tap((joke) => (this.cachedJokeData = joke))
        );
      }
    }
    return this.cachedApi$;
  }

  subscribeComponentA(): void {
    this.componentAListening = true;
    this.componentAResult = 'Đang đợi dữ liệu...';
    this.subCompA = this.getJokeStream().subscribe((joke) => {
      this.componentAResult = joke;
      this.addLog('NEXT', 'Component A', `Nhận dữ liệu: "${joke}"`);
    });
  }

  subscribeComponentB(): void {
    this.componentBListening = true;
    this.componentBResult = 'Đang đợi dữ liệu...';
    this.subCompB = this.getJokeStream().subscribe((joke) => {
      this.componentBResult = joke;
      this.addLog('NEXT', 'Component B', `Nhận dữ liệu: "${joke}"`);
    });
  }

  subscribeComponentC(): void {
    this.componentCListening = true;
    this.componentCResult = 'Đang đợi dữ liệu...';
    this.subCompC = this.getJokeStream().subscribe((joke) => {
      this.componentCResult = joke;
      this.addLog('NEXT', 'Component C', `Nhận dữ liệu: "${joke}"`);
    });
  }

  forceRefreshCache(): void {
    this.subCompA?.unsubscribe();
    this.subCompB?.unsubscribe();
    this.subCompC?.unsubscribe();
    this.componentAListening = false;
    this.componentBListening = false;
    this.componentCListening = false;
    this.componentAResult = '';
    this.componentBResult = '';
    this.componentCResult = '';
    this.cachedApi$ = undefined;
    this.cachedJokeData = null;
    this.addLog('CACHE', 'Cache Reset', 'Đã xóa sạch cache API! Lần subscribe tới sẽ gọi server mới.');
  }

  // ============================================================================
  // 4. DEMO: Subject as Event Bus / State Service
  // ============================================================================
  private setupCartSubscription(): void {
    this.cartSub = this.cartItems$.subscribe((items) => {
      this.cartItemsList = items;
      this.cartTotalCount = items.length;
      this.cartTotalPrice = items.reduce((acc, it) => acc + it.price, 0);
      this.addLog(
        'EMIT',
        'CartState (BehaviorSubject)',
        `Cập nhật giỏ hàng: ${items.length} mặt hàng, Tổng tiền: $${this.cartTotalPrice}`
      );
    });
  }

  addItemToCart(name: string, price: number): void {
    const current = this.cartSubject.getValue();
    const newItem: CartItem = {
      id: Date.now(),
      name,
      price,
    };
    this.cartSubject.next([...current, newItem]);
  }

  removeCartItem(id: number): void {
    const current = this.cartSubject.getValue();
    this.cartSubject.next(current.filter((item) => item.id !== id));
  }

  clearCart(): void {
    this.cartSubject.next([]);
  }

  // ============================================================================
  // ACTIVITY LOGGER HELPER
  // ============================================================================
  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    type: 'NEXT' | 'EMIT' | 'SUB_A' | 'SUB_B' | 'COMPLETE' | 'CACHE' | 'RESET' | 'INFO',
    operator: string,
    message: string
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
      type,
      operator,
      message,
    });

    if (this.logs.length > 40) {
      this.logs.pop();
    }
  }
}
