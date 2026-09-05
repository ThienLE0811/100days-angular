import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Observable,
  Observer,
  Subscription,
  defer,
  from,
  fromEvent,
  fromEventPattern,
  interval,
  of,
  throwError,
  timer,
} from 'rxjs';

/**
 * ============================================================================
 * INTERFACES & DATA MODELS
 * ============================================================================
 */
export interface ActivityLog {
  id: number;
  time: string;
  type: 'NEXT' | 'ERROR' | 'COMPLETE' | 'TEARDOWN' | 'INFO';
  operator: string;
  message: string;
}

export interface OperatorCard {
  id: string;
  name: string;
  badge: string;
  signature: string;
  autoComplete: boolean;
  summary: string;
  angularNote: string;
}

export interface DeferExperimentResult {
  subscriberName: string;
  subscribedAt: string;
  randomValue: number;
  timestampMs: number;
}

/**
 * Mock SignalR / WebSocket Hub for fromEventPattern demonstration
 */
class MockSignalRHub {
  private handlers: { [eventName: string]: Array<(data: any) => void> } = {};
  public isConnected: boolean = false;
  private messageInterval?: ReturnType<typeof setInterval>;
  private counter: number = 1;

  public connection = {
    on: (eventName: string, handler: (data: any) => void) => {
      if (!this.handlers[eventName]) {
        this.handlers[eventName] = [];
      }
      this.handlers[eventName].push(handler);
    },
    off: (eventName: string, handler: (data: any) => void) => {
      if (this.handlers[eventName]) {
        this.handlers[eventName] = this.handlers[eventName].filter((h) => h !== handler);
      }
    },
    start: () => {
      this.isConnected = true;
      this.messageInterval = setInterval(() => {
        const payload = {
          hubEvent: 'ReceiveMessage',
          msgId: this.counter++,
          body: `Live notification from Mock SignalR Hub #${this.counter - 1}`,
          serverTime: new Date().toLocaleTimeString(),
        };
        (this.handlers['ReceiveMessage'] || []).forEach((cb) => cb(payload));
      }, 1500);
    },
    stop: () => {
      this.isConnected = false;
      if (this.messageInterval) {
        clearInterval(this.messageInterval);
        this.messageInterval = undefined;
      }
    },
  };
}

@Component({
  selector: 'app-day020-rxjs-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day020-rxjs-creation.html',
  styleUrl: './day020-rxjs-creation.scss',
})
export class Day020RxjsCreation implements OnInit, AfterViewInit, OnDestroy {
  // ============================================================================
  // NAVIGATION & UI STATE
  // ============================================================================
  activeTab: 'of-from' | 'events' | 'time' | 'defer' | 'error' | 'cheatsheet' = 'of-from';

  // ============================================================================
  // DEMO 1: of() vs from()
  // ============================================================================
  ofResults: Array<{ id: number; type: string; value: any; isComplete: boolean }> = [];
  fromResults: Array<{ id: number; type: string; value: any; isComplete: boolean }> = [];
  ofInputValue: string = 'Angular,RxJS,TypeScript';
  promiseDelayMs: number = 800;
  isPromiseLoading: boolean = false;
  ofVsFromComparisonNotes: string = '';

  // ============================================================================
  // DEMO 2: fromEvent() & fromEventPattern()
  // ============================================================================
  @ViewChild('demoClickBtn') demoClickBtnRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('demoInputBox') demoInputBoxRef!: ElementRef<HTMLInputElement>;
  @ViewChild('mouseTrackBox') mouseTrackBoxRef!: ElementRef<HTMLDivElement>;

  // fromEvent state
  isFromEventSubscribed: boolean = false;
  fromEventClickCount: number = 0;
  fromEventLastKey: string = '';
  fromEventLastMousePos: { x: number; y: number } = { x: 0, y: 0 };
  private fromEventSubs: Subscription = new Subscription();

  // fromEventPattern state (Mock SignalR Hub)
  private mockHub = new MockSignalRHub();
  private mockHubRefCount: number = 0;
  private signalRSub?: Subscription;
  isSignalRSubscribed: boolean = false;
  signalRMessages: Array<{ msgId: number; body: string; serverTime: string }> = [];

  // ============================================================================
  // DEMO 3: interval() & timer()
  // ============================================================================
  // Interval
  intervalMs: number = 1000;
  intervalCurrentValue: number | null = null;
  intervalStatus: 'IDLE' | 'RUNNING' | 'STOPPED' = 'IDLE';
  intervalEmittedItems: number[] = [];
  private intervalSub?: Subscription;

  // Timer One-off
  timerOneOffDelay: number = 1500;
  timerOneOffStatus: 'IDLE' | 'COUNTING' | 'COMPLETED' = 'IDLE';
  timerOneOffProgress: number = 0;
  timerOneOffValue: number | null = null;
  private timerOneOffSub?: Subscription;

  // Timer Periodic
  timerPeriodicDelay: number = 1000;
  timerPeriodicPeriod: number = 1000;
  timerPeriodicStatus: 'IDLE' | 'RUNNING' | 'STOPPED' = 'IDLE';
  timerPeriodicValues: number[] = [];
  private timerPeriodicSub?: Subscription;

  // ============================================================================
  // DEMO 4: defer() vs of() (Lazy Observable Factory)
  // ============================================================================
  // of(Math.random())
  cachedOfRandomObservable = of(Math.random());
  ofSubscriberResults: DeferExperimentResult[] = [];

  // defer(() => of(Math.random()))
  deferRandomObservable = defer(() => of(Math.random()));
  deferSubscriberResults: DeferExperimentResult[] = [];

  deferTimestampObservable = defer(() => {
    const now = new Date();
    return of({
      time: now.toLocaleTimeString() + '.' + now.getMilliseconds(),
      epoch: now.getTime(),
    });
  });
  deferTimestampResults: Array<{ id: number; time: string; epoch: number }> = [];

  // ============================================================================
  // DEMO 5: throwError()
  // ============================================================================
  customErrorMessage: string = 'Lỗi kết nối cơ sở dữ liệu (503 Service Unavailable)';
  throwErrorStatus: 'IDLE' | 'EMITTED' = 'IDLE';
  throwErrorDetail: string = '';
  private throwErrorSub?: Subscription;

  // ============================================================================
  // CHEAT SHEET & REFERENCE
  // ============================================================================
  readonly operatorsList: OperatorCard[] = [
    {
      id: 'of',
      name: 'of(...values)',
      badge: 'Synchronous / Any Value',
      signature: 'of(1, 2, "hello", { a: 1 })',
      autoComplete: true,
      summary:
        'Nhận vào danh sách đối số bất kỳ (primitive, object, array, function) và emit từng đối số một, sau đó TỰ ĐỘNG COMPLETE ngay lập tức.',
      angularNote:
        'Thường dùng để mock Observable trong unit test, hoặc trả về fallback value trong catchError: catchError(() => of(fallbackData)).',
    },
    {
      id: 'from',
      name: 'from(iterableOrPromise)',
      badge: 'Iterable or Promise',
      signature: 'from([1, 2, 3]) | from(Promise.resolve(val))',
      autoComplete: true,
      summary:
        'Chuyển đổi một Iterable (Array, Map, Set, String) hoặc một Promise thành Observable. Tự động unwrap Promise resolved value và emit các phần tử của Array tuần tự.',
      angularNote:
        'Chuyển đổi các thư viện dựa trên Promise (ví dụ: Fetch API, Capacitor Plugins, Firebase SDK) thành Observable trong Angular.',
    },
    {
      id: 'fromEvent',
      name: 'fromEvent(target, eventName)',
      badge: 'DOM Events',
      signature: 'fromEvent(buttonElement, "click")',
      autoComplete: false,
      summary:
        'Lắng nghe sự kiện từ DOM element hoặc Node EventEmitter. KHÔNG TỰ ĐỘNG COMPLETE vì không biết khi nào người dùng ngừng tương tác. CẦN UNSUBSCRIBE để tránh Memory Leak.',
      angularNote:
        'Thường dùng với ViewChild để lắng nghe window resize, scroll, hoặc custom drag-and-drop nâng cao mà template event binding không tối ưu bằng stream.',
    },
    {
      id: 'fromEventPattern',
      name: 'fromEventPattern(addHandler, removeHandler, project?)',
      badge: 'Custom Event APIs',
      signature: 'fromEventPattern(addHandler, removeHandler, [projectFn])',
      autoComplete: false,
      summary:
        'Phiên bản nâng cao của fromEvent, cho phép bọc bất kỳ API nào có cơ chế đăng ký và hủy đăng ký listener (ví dụ SignalR Hub, Socket.io, Node listeners, third-party SDKs).',
      angularNote:
        'Cầu nối tuyệt vời giữa các realtime websocket/message brokers (như Azure SignalR, Firebase onSnapshot) với kiến trúc RxJS của Angular.',
    },
    {
      id: 'interval',
      name: 'interval(periodMs)',
      badge: 'Periodic Counter',
      signature: 'interval(1000) // 0, 1, 2, 3, ...',
      autoComplete: false,
      summary:
        'Phát ra chuỗi số nguyên tăng dần (0, 1, 2, ...) sau mỗi chu kỳ thời gian (giống setInterval). KHÔNG TỰ ĐỘNG COMPLETE, phải chủ động hủy qua subscription hoặc take/takeUntil.',
      angularNote:
        'Dùng cho các chức năng đếm giờ, polling dữ liệu tự động định kỳ (ví dụ: refresh token, poll status).',
    },
    {
      id: 'timer',
      name: 'timer(dueTime, period?)',
      badge: 'Delay or Delay+Periodic',
      signature: 'timer(1000) (hoàn tất) HOẶC timer(1000, 500) (vô hạn)',
      autoComplete: true,
      summary:
        'Cách 1: timer(delay) đợi delay rồi phát số 0 và TỰ COMPLETE (giống setTimeout). Cách 2: timer(delay, period) đợi delay rồi phát định kỳ (không tự complete).',
      angularNote:
        'Tạo độ trễ trước khi gọi API, timeout retry, debounce manual, hoặc kích hoạt tác vụ nền sau một khoảng chờ.',
    },
    {
      id: 'throwError',
      name: 'throwError(errorFactory)',
      badge: 'Error Notification',
      signature: 'throwError(() => new Error("Something went wrong"))',
      autoComplete: false,
      summary:
        'Tạo một Observable không emit giá trị nào mà ngay lập tức gửi Error Notification khi có subscriber. Từ RxJS 7+, cú pháp chuẩn là truyền factory function () => err.',
      angularNote:
        'Dùng trong HttpInterceptor hoặc service: catchError((err) => { log(err); return throwError(() => err); }).',
    },
    {
      id: 'defer',
      name: 'defer(observableFactory)',
      badge: 'Lazy Factory per Subscriber',
      signature: 'defer(() => of(new Date().getTime()))',
      autoComplete: true,
      summary:
        'Trì hoãn việc tạo Observable cho đến khi có một subscriber đăng ký. Mỗi subscriber mới sẽ được chạy factory function và nhận một Observable HOÀN TOÀN MỚI.',
      angularNote:
        'Rất mạnh trong retry logic: mỗi lần retry cần tạo lại request mới với token mới hoặc random backoff, tránh dùng lại giá trị tĩnh đã tính từ lúc khai báo.',
    },
  ];

  // ============================================================================
  // ACTIVITY LOGGER
  // ============================================================================
  logs: ActivityLog[] = [];
  private logIdCounter: number = 1;

  // General subscriptions container
  private subs = new Subscription();

  ngOnInit(): void {
    this.addLog(
      'INFO',
      'System',
      'Khởi tạo Day020RxjsCreation: Sẵn sàng khám phá các RxJS Creation Operators!'
    );
  }

  ngAfterViewInit(): void {
    this.setupFromEventListeners();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.fromEventSubs.unsubscribe();
    this.intervalSub?.unsubscribe();
    this.timerOneOffSub?.unsubscribe();
    this.timerPeriodicSub?.unsubscribe();
    this.signalRSub?.unsubscribe();
    this.throwErrorSub?.unsubscribe();
    this.mockHub.connection.stop();
  }

  // ============================================================================
  // 1. DEMO: of() vs from()
  // ============================================================================
  runOfPrimitiveDemo(): void {
    this.ofResults = [];
    this.addLog('INFO', 'of()', 'Chạy of("hello")');

    // Theo docs: of('hello').subscribe(observer);
    of('hello').subscribe(this.createObserver('of()', this.ofResults));
  }

  runOfArrayDemo(): void {
    this.ofResults = [];
    this.addLog('INFO', 'of()', 'Chạy of([1, 2, 3]) -> Chú ý: of() emit toàn bộ Array như 1 giá trị duy nhất!');

    // Theo docs: of([1, 2, 3]).subscribe(observer);
    of([1, 2, 3]).subscribe(this.createObserver('of()', this.ofResults));
  }

  runOfSequenceDemo(): void {
    this.ofResults = [];
    this.addLog(
      'INFO',
      'of()',
      'Chạy of(1, 2, 3, "hello", "world", { foo: "bar" }, [4, 5, 6])'
    );

    // Theo docs Day 20: of(1, 2, 3, 'hello', 'world', { foo: 'bar' }, [4, 5, 6])
    of(1, 2, 3, 'hello', 'world', { foo: 'bar' }, [4, 5, 6]).subscribe(
      this.createObserver('of()', this.ofResults)
    );
  }

  runFromArrayDemo(): void {
    this.fromResults = [];
    this.addLog(
      'INFO',
      'from()',
      'Chạy from([1, 2, 3]) -> Chú ý: from() emit TỪNG phần tử riêng biệt theo sequence!'
    );

    // Theo docs: from([1, 2, 3]).subscribe(observer);
    from([1, 2, 3]).subscribe(this.createObserver('from()', this.fromResults));
  }

  runFromStringDemo(): void {
    this.fromResults = [];
    this.addLog(
      'INFO',
      'from()',
      'Chạy from("hello world") -> Iterable chuỗi ký tự được tách thành từng chữ cái!'
    );

    // Theo docs: from('hello world').subscribe(observer);
    from('hello world').subscribe(this.createObserver('from()', this.fromResults));
  }

  runFromMapAndSetDemo(): void {
    this.fromResults = [];
    this.addLog('INFO', 'from()', 'Chạy from(Map) và from(Set)');

    // Theo docs Day 20: Map & Set
    const map = new Map<number, string>();
    map.set(1, 'hello');
    map.set(2, 'bye');

    from(map).subscribe({
      next: (val) => {
        this.fromResults.push({
          id: this.fromResults.length + 1,
          type: 'Map Entry [key, value]',
          value: JSON.stringify(val),
          isComplete: false,
        });
        this.addLog('NEXT', 'from(Map)', `Map Entry: ${JSON.stringify(val)}`);
      },
      complete: () => {
        this.addLog('COMPLETE', 'from(Map)', 'Hoàn tất emit Map');
      },
    });

    const set = new Set<number>([100, 200, 300]);
    from(set).subscribe({
      next: (val) => {
        this.fromResults.push({
          id: this.fromResults.length + 1,
          type: 'Set Value',
          value: val,
          isComplete: false,
        });
        this.addLog('NEXT', 'from(Set)', `Set Item: ${val}`);
      },
      complete: () => {
        this.addLog('COMPLETE', 'from(Set)', 'Hoàn tất emit Set');
      },
    });
  }

  runFromPromiseDemo(): void {
    this.fromResults = [];
    this.isPromiseLoading = true;
    this.addLog(
      'INFO',
      'from()',
      `Khởi tạo Promise với delay ${this.promiseDelayMs}ms, from() sẽ unwrap kết quả khi resolved!`
    );

    const mockPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`Resolved Data từ Promise tại ${new Date().toLocaleTimeString()}`);
      }, this.promiseDelayMs);
    });

    // Theo docs: from(Promise.resolve('hello world')).subscribe(observer);
    from(mockPromise).subscribe({
      next: (val) => {
        this.isPromiseLoading = false;
        this.fromResults.push({
          id: this.fromResults.length + 1,
          type: 'Promise Resolved',
          value: val,
          isComplete: false,
        });
        this.addLog('NEXT', 'from(Promise)', val);
      },
      complete: () => {
        this.isPromiseLoading = false;
        this.fromResults.push({
          id: this.fromResults.length + 1,
          type: 'COMPLETE',
          value: 'Stream hoàn tất!',
          isComplete: true,
        });
        this.addLog('COMPLETE', 'from(Promise)', 'Stream hoàn tất sau khi Promise resolve!');
      },
    });
  }

  // ============================================================================
  // 2. DEMO: fromEvent() & fromEventPattern()
  // ============================================================================
  private setupFromEventListeners(): void {
    if (!this.demoClickBtnRef || !this.demoInputBoxRef || !this.mouseTrackBoxRef) {
      return;
    }

    this.subscribeFromEvents();
  }

  subscribeFromEvents(): void {
    if (this.isFromEventSubscribed) return;
    this.isFromEventSubscribed = true;
    this.fromEventSubs = new Subscription();

    // 1. fromEvent click
    const click$ = fromEvent<MouseEvent>(this.demoClickBtnRef.nativeElement, 'click');
    const clickSub = click$.subscribe({
      next: () => {
        this.fromEventClickCount++;
        this.addLog(
          'NEXT',
          'fromEvent(btn, "click")',
          `Click event #${this.fromEventClickCount} phát ra!`
        );
      },
    });
    this.fromEventSubs.add(clickSub);

    // 2. fromEvent input
    const input$ = fromEvent<Event>(this.demoInputBoxRef.nativeElement, 'input');
    const inputSub = input$.subscribe({
      next: (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.fromEventLastKey = target.value;
        this.addLog(
          'NEXT',
          'fromEvent(input, "input")',
          `Giá trị input: "${target.value}"`
        );
      },
    });
    this.fromEventSubs.add(inputSub);

    // 3. fromEvent mousemove on tracking box
    const mouseMove$ = fromEvent<MouseEvent>(this.mouseTrackBoxRef.nativeElement, 'mousemove');
    const mouseSub = mouseMove$.subscribe({
      next: (ev: MouseEvent) => {
        this.fromEventLastMousePos = { x: ev.offsetX, y: ev.offsetY };
      },
    });
    this.fromEventSubs.add(mouseSub);

    this.addLog(
      'INFO',
      'fromEvent()',
      'Đã đăng ký (subscribed) 3 sự kiện: click, input, mousemove. Lưu ý: Stream này KHÔNG TỰ COMPLETE!'
    );
  }

  unsubscribeFromEvents(): void {
    if (this.isFromEventSubscribed) {
      this.fromEventSubs.unsubscribe();
      this.isFromEventSubscribed = false;
      this.addLog(
        'TEARDOWN',
        'fromEvent()',
        'Đã gọi .unsubscribe() để hủy đăng ký tất cả Event Listeners! Ngăn chặn rò rỉ bộ nhớ (Memory Leak).'
      );
    }
  }

  // fromEventPattern Demo (SignalR / Custom Event Hub)
  toggleSignalRSubscription(): void {
    if (this.isSignalRSubscribed) {
      this.signalRSub?.unsubscribe();
      this.isSignalRSubscribed = false;
      this.addLog(
        'TEARDOWN',
        'fromEventPattern()',
        'Đã hủy đăng ký SignalR Hub qua removeHandler. Websocket connection đã được đóng an toàn!'
      );
      return;
    }

    this.isSignalRSubscribed = true;
    this.signalRMessages = [];
    this.addLog(
      'INFO',
      'fromEventPattern()',
      'Đang khởi tạo fromEventPattern(addHandler, removeHandler) kết nối với Mock SignalR Hub...'
    );

    // Triển khai đúng như tài liệu Day 20:
    // fromEventPattern((handler) => { hub.connection.on(...); hub.connection.start(); }, (handler) => { hub.connection.off(...); hub.connection.stop(); })
    const hubStream$ = fromEventPattern<any>(
      (handler) => {
        this.mockHub.connection.on('ReceiveMessage', handler);
        if (this.mockHubRefCount === 0) {
          this.mockHub.connection.start();
          this.addLog('INFO', 'fromEventPattern()', '[addHandler] WebSocket Hub Connection.start()');
        }
        this.mockHubRefCount++;
      },
      (handler) => {
        this.mockHubRefCount--;
        this.mockHub.connection.off('ReceiveMessage', handler);
        if (this.mockHubRefCount === 0) {
          this.mockHub.connection.stop();
          this.addLog('INFO', 'fromEventPattern()', '[removeHandler] WebSocket Hub Connection.stop()');
        }
      },
      // projectFunction: chuyển đổi dữ liệu trước khi emit
      (data: any) => ({
        msgId: data.msgId,
        body: data.body,
        serverTime: data.serverTime,
      })
    );

    this.signalRSub = hubStream$.subscribe({
      next: (msg) => {
        this.signalRMessages.unshift(msg);
        if (this.signalRMessages.length > 8) this.signalRMessages.pop();
        this.addLog(
          'NEXT',
          'fromEventPattern(SignalR)',
          `Nhận message #${msg.msgId}: ${msg.body}`
        );
      },
    });
  }

  // ============================================================================
  // 3. DEMO: interval() & timer()
  // ============================================================================
  startInterval(): void {
    this.stopInterval();
    this.intervalStatus = 'RUNNING';
    this.intervalEmittedItems = [];
    this.addLog('INFO', 'interval()', `Bắt đầu interval(${this.intervalMs}ms)`);

    // Theo docs: interval(1000).subscribe(observer)
    this.intervalSub = interval(this.intervalMs).subscribe({
      next: (val) => {
        this.intervalCurrentValue = val;
        this.intervalEmittedItems.push(val);
        if (this.intervalEmittedItems.length > 10) {
          this.intervalEmittedItems.shift();
        }
        this.addLog('NEXT', 'interval()', `Giá trị tick: ${val}`);
      },
    });
  }

  stopInterval(): void {
    if (this.intervalSub && !this.intervalSub.closed) {
      this.intervalSub.unsubscribe();
      this.intervalStatus = 'STOPPED';
      this.addLog('TEARDOWN', 'interval()', 'Đã hủy interval subscription.');
    }
  }

  startTimerOneOff(): void {
    this.timerOneOffSub?.unsubscribe();
    this.timerOneOffStatus = 'COUNTING';
    this.timerOneOffValue = null;
    this.timerOneOffProgress = 0;
    this.addLog(
      'INFO',
      'timer()',
      `Khởi chạy timer(${this.timerOneOffDelay}ms) - Một lần duy nhất, sau đó TỰ COMPLETE!`
    );

    // Visual progress ticker
    const startTime = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.timerOneOffProgress = Math.min(100, Math.round((elapsed / this.timerOneOffDelay) * 100));
      if (this.timerOneOffProgress >= 100) {
        clearInterval(progressTimer);
      }
    }, 40);

    // Theo docs: timer(1000).subscribe(observer)
    this.timerOneOffSub = timer(this.timerOneOffDelay).subscribe({
      next: (val) => {
        this.timerOneOffValue = val;
        this.addLog('NEXT', 'timer(delay)', `Emit giá trị sau delay: ${val}`);
      },
      complete: () => {
        clearInterval(progressTimer);
        this.timerOneOffProgress = 100;
        this.timerOneOffStatus = 'COMPLETED';
        this.addLog('COMPLETE', 'timer(delay)', 'Stream tự động COMPLETE thành công!');
      },
    });
  }

  startTimerPeriodic(): void {
    this.stopTimerPeriodic();
    this.timerPeriodicStatus = 'RUNNING';
    this.timerPeriodicValues = [];
    this.addLog(
      'INFO',
      'timer()',
      `Khởi chạy timer(${this.timerPeriodicDelay}ms, ${this.timerPeriodicPeriod}ms) - Delay ban đầu rồi phát tuần hoàn vô hạn!`
    );

    // Theo docs: timer(1000, 1000).subscribe(observer)
    this.timerPeriodicSub = timer(this.timerPeriodicDelay, this.timerPeriodicPeriod).subscribe({
      next: (val) => {
        this.timerPeriodicValues.push(val);
        if (this.timerPeriodicValues.length > 10) {
          this.timerPeriodicValues.shift();
        }
        this.addLog('NEXT', 'timer(delay, period)', `Emit định kỳ: ${val}`);
      },
    });
  }

  stopTimerPeriodic(): void {
    if (this.timerPeriodicSub && !this.timerPeriodicSub.closed) {
      this.timerPeriodicSub.unsubscribe();
      this.timerPeriodicStatus = 'STOPPED';
      this.addLog('TEARDOWN', 'timer()', 'Đã hủy timer tuần hoàn.');
    }
  }

  // ============================================================================
  // 4. DEMO: defer() vs of() (The Classic Experiment from Docs)
  // ============================================================================
  // Theo docs Day 20:
  // of(): const now$ = of(Math.random()); -> 3 lần subscribe nhận cùng 1 giá trị!
  // defer(): const now$ = defer(() => of(Math.random())); -> 3 lần subscribe nhận 3 giá trị khác nhau!
  runSubscribeToOfRandom(): void {
    const subscriberIndex = this.ofSubscriberResults.length + 1;
    this.cachedOfRandomObservable.subscribe((val) => {
      this.ofSubscriberResults.push({
        subscriberName: `Subscriber #${subscriberIndex}`,
        subscribedAt: new Date().toLocaleTimeString(),
        randomValue: val,
        timestampMs: Date.now(),
      });
      this.addLog(
        'NEXT',
        'of(Math.random())',
        `Subscriber #${subscriberIndex} nhận giá trị: ${val} (TẤT CẢ GIỐNG NHAU VÌ ĐÃ TÍNH TRƯỚC)`
      );
    });
  }

  runSubscribeToDeferRandom(): void {
    const subscriberIndex = this.deferSubscriberResults.length + 1;
    this.deferRandomObservable.subscribe((val) => {
      this.deferSubscriberResults.push({
        subscriberName: `Subscriber #${subscriberIndex}`,
        subscribedAt: new Date().toLocaleTimeString(),
        randomValue: val,
        timestampMs: Date.now(),
      });
      this.addLog(
        'NEXT',
        'defer(() => of(random))',
        `Subscriber #${subscriberIndex} nhận giá trị: ${val} (MỖI LẦN ĐỀU MỚI TINH!)`
      );
    });
  }

  runSubscribeToDeferTimestamp(): void {
    this.deferTimestampObservable.subscribe((data) => {
      this.deferTimestampResults.unshift({
        id: this.deferTimestampResults.length + 1,
        time: data.time,
        epoch: data.epoch,
      });
      if (this.deferTimestampResults.length > 5) this.deferTimestampResults.pop();
      this.addLog(
        'NEXT',
        'defer(Timestamp)',
        `Mỗi lần subscribe chạy lại factory: ${data.time}`
      );
    });
  }

  resetOfVsDeferExperiment(): void {
    this.cachedOfRandomObservable = of(Math.random());
    this.ofSubscriberResults = [];
    this.deferSubscriberResults = [];
    this.deferTimestampResults = [];
    this.addLog(
      'INFO',
      'defer() vs of()',
      'Đã reset thử nghiệm và tạo lại Observable of(Math.random()). Hãy thử subscribe từng bên!'
    );
  }

  // ============================================================================
  // 5. DEMO: throwError()
  // ============================================================================
  runThrowErrorDemo(): void {
    this.throwErrorStatus = 'EMITTED';
    this.throwErrorDetail = '';
    this.addLog('INFO', 'throwError()', 'Subscribe vào throwError()...');

    // Theo docs Day 20 & RxJS 7+ chuẩn:
    // throwError(() => 'an error').subscribe(observer);
    const err$ = throwError(() => new Error(this.customErrorMessage));

    this.throwErrorSub = err$.subscribe({
      next: (val) => {
        this.addLog('NEXT', 'throwError()', `Next: ${val}`);
      },
      error: (err: Error) => {
        this.throwErrorDetail = err.message || String(err);
        this.addLog(
          'ERROR',
          'throwError()',
          `Observer bắt được Error Notification: "${this.throwErrorDetail}". Stream kết thúc do lỗi!`
        );
      },
      complete: () => {
        this.addLog('COMPLETE', 'throwError()', 'Complete (không bao giờ chạy khi có error)');
      },
    });
  }

  // ============================================================================
  // OBSERVER FACTORY HELPER
  // ============================================================================
  private createObserver(
    opName: string,
    targetList: Array<{ id: number; type: string; value: any; isComplete: boolean }>
  ): Observer<any> {
    return {
      next: (val: any) => {
        targetList.push({
          id: targetList.length + 1,
          type: typeof val === 'object' ? 'Object/Array' : typeof val,
          value: typeof val === 'object' ? JSON.stringify(val) : val,
          isComplete: false,
        });
        this.addLog('NEXT', opName, `Value: ${JSON.stringify(val)}`);
      },
      error: (err: any) => {
        this.addLog('ERROR', opName, `Lỗi: ${err}`);
      },
      complete: () => {
        targetList.push({
          id: targetList.length + 1,
          type: 'COMPLETE',
          value: 'complete',
          isComplete: true,
        });
        this.addLog('COMPLETE', opName, 'Đã nhận thông báo Complete');
      },
    };
  }

  // ============================================================================
  // ACTIVITY LOGGER HELPER
  // ============================================================================
  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    type: 'NEXT' | 'ERROR' | 'COMPLETE' | 'TEARDOWN' | 'INFO',
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
