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
  fromEvent,
  interval,
  map,
  scan,
  throttleTime,
} from 'rxjs';

/**
 * ============================================================================
 * DATA MODELS & INTERFACES
 * ============================================================================
 */
export interface ActivityLog {
  id: number;
  time: string;
  type: 'NEXT' | 'ERROR' | 'COMPLETE' | 'TEARDOWN' | 'THROTTLE' | 'INFO';
  message: string;
}

export interface StreamMarble {
  id: number;
  type: 'NEXT' | 'ERROR' | 'COMPLETE';
  value: string | number;
  timestamp: string;
}

export interface CoreConcept {
  name: string;
  badge: string;
  summary: string;
  signature: string;
  angularUsage: string;
}

@Component({
  selector: 'app-day019-intro-rxjs-observable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day019-intro-rxjs-observable.html',
  styleUrl: './day019-intro-rxjs-observable.scss',
})
export class Day019IntroRxjsObservable
  implements OnInit, AfterViewInit, OnDestroy
{
  // ============================================================================
  // 1. DEMO 1: THROTTLE USE-CASE (PURE JS VS RXJS)
  // ============================================================================
  @ViewChild('rxjsThrottleBtn') rxjsThrottleBtnRef!: ElementRef<HTMLButtonElement>;

  // Pure JS state (Theo tài liệu Day 19: rate = 500ms, lastClick = Date.now() - rate)
  pureJsRawClicks: number = 0;
  pureJsExecutedCount: number = 0;
  readonly throttleRateMs: number = 500;
  private pureJsLastClick: number = 0;
  pureJsCooldownRemaining: number = 0;
  private pureJsCooldownTimer?: ReturnType<typeof setInterval>;

  // RxJS state
  rxjsRawClicks: number = 0;
  rxjsExecutedCount: number = 0;
  rxjsCooldownRemaining: number = 0;
  private rxjsCooldownTimer?: ReturnType<typeof setInterval>;
  private rxjsThrottleSub?: Subscription;

  // Auto spam click simulator
  isAutoSpamming: boolean = false;
  private autoSpamTimer?: ReturnType<typeof setInterval>;

  // ============================================================================
  // 2. DEMO 2: PROMISE VS OBSERVABLE
  // ============================================================================
  promiseState: 'IDLE' | 'PENDING' | 'RESOLVED' = 'IDLE';
  promiseResult: string = '';
  promiseExecutionTime: number = 0;

  observableState: 'IDLE' | 'STREAMING' | 'CANCELLED' | 'COMPLETED' = 'IDLE';
  observableStreamValues: number[] = [];
  private demo2Sub?: Subscription;

  // ============================================================================
  // 3. DEMO 3: CUSTOM OBSERVABLE & TEARDOWN MECHANISM
  // ============================================================================
  // Subscriber A
  subAState: 'UNSUBSCRIBED' | 'ACTIVE' = 'UNSUBSCRIBED';
  subACurrentValue: number | null = null;
  private subASubscription?: Subscription;

  // Subscriber B
  subBState: 'UNSUBSCRIBED' | 'ACTIVE' = 'UNSUBSCRIBED';
  subBCurrentValue: number | null = null;
  private subBSubscription?: Subscription;

  // ============================================================================
  // 4. DEMO 4: STREAM LIFECYCLE SIMULATOR (NEXT / ERROR / COMPLETE)
  // ============================================================================
  lifecycleState: 'IDLE' | 'ACTIVE' | 'COMPLETED' | 'ERROR' = 'IDLE';
  marbles: StreamMarble[] = [];
  nextPayloadInput: string = 'Angular Data';
  private lifecycleObserver?: Observer<string | number>;
  private lifecycleSubscription?: Subscription;
  private marbleCounter: number = 1;
  lifecycleErrorMessage: string = '';

  // ============================================================================
  // 5. DEMO 5: COMPOSITE SUBSCRIPTION (subscription.add)
  // ============================================================================
  compositeState: 'IDLE' | 'RUNNING' | 'UNSUBSCRIBED' = 'IDLE';
  parentStreamCount: number = 0;
  childStreamCount: number = 0;
  private parentSubscription?: Subscription;

  // ============================================================================
  // 6. CORE CONCEPTS INFOGRAPHIC
  // ============================================================================
  readonly coreConcepts: CoreConcept[] = [
    {
      name: 'Observable',
      badge: 'Producer',
      summary:
        'Đại diện cho ý tưởng về một tập hợp các giá trị hoặc sự kiện trong tương lai. Kết nối Observer với Producer và cung cấp cơ chế teardown/cleanup.',
      signature: 'new Observable((observer) => { ... return () => teardown; })',
      angularUsage: 'HttpClient.get(), ActivatedRoute.params, Form.valueChanges',
    },
    {
      name: 'Observer',
      badge: 'Consumer',
      summary:
        'Tập hợp 3 callbacks để lắng nghe các thông báo từ Observable: next (nhận giá trị), error (bắt lỗi), complete (khi stream kết thúc).',
      signature: '{ next: (v) => {}, error: (e) => {}, complete: () => {} }',
      angularUsage: 'Cung cấp vào .subscribe(observer) hoặc dùng trong AsyncPipe',
    },
    {
      name: 'Subscription',
      badge: 'Controller',
      summary:
        'Đại diện cho quá trình thực thi của một Observable. Có method .unsubscribe() để hủy execution và giải phóng bộ nhớ, và .add() để gộp các sub con.',
      signature: 'const sub = obs.subscribe(...); sub.unsubscribe();',
      angularUsage: 'Quản lý trong ngOnDestroy hoặc dùng takeUntilDestroyed()',
    },
    {
      name: 'Operators',
      badge: 'Functional',
      summary:
        'Các pure functions cho phép lập trình functional với Observable, biến đổi (map, scan), lọc (filter, throttleTime) hoặc gộp stream.',
      signature: 'obs.pipe(throttleTime(500), map(x => x * 2))',
      angularUsage: 'Chaining thông qua hàm .pipe() để xử lý luồng dữ liệu sạch sẽ',
    },
    {
      name: 'Subject',
      badge: 'Multicaster',
      summary:
        'Vừa là Observable vừa là Observer đặc biệt cho phép gửi dữ liệu đến nhiều Observers cùng lúc (Multicasting) thay vì Unicast mặc định.',
      signature: 'const subject = new Subject(); subject.next(data);',
      angularUsage: 'Event bus, State Management (RxJS Store, BehaviorSubject)',
    },
    {
      name: 'Schedulers',
      badge: 'Timing',
      summary:
        'Điều khiển khi nào một subscription bắt đầu thực thi và khi nào các tín hiệu được gửi đi (asyncScheduler, queueScheduler, animFrame).',
      signature: 'observeOn(asyncScheduler)',
      angularUsage: 'Tối ưu hóa thời điểm render hoặc trì hoãn tác vụ vi mô/vĩ mô',
    },
  ];

  // ============================================================================
  // 7. ACTIVITY LOGS
  // ============================================================================
  logs: ActivityLog[] = [];
  private logIdCounter: number = 1;

  ngOnInit(): void {
    this.pureJsLastClick = Date.now() - this.throttleRateMs;
    this.addLog(
      'INFO',
      'Khởi tạo Day019IntroRxjsObservable: Đã sẵn sàng khám phá Reactive Programming & Observables!'
    );
  }

  ngAfterViewInit(): void {
    this.setupRxjsThrottle();
  }

  ngOnDestroy(): void {
    this.rxjsThrottleSub?.unsubscribe();
    this.demo2Sub?.unsubscribe();
    this.subASubscription?.unsubscribe();
    this.subBSubscription?.unsubscribe();
    this.lifecycleSubscription?.unsubscribe();
    this.parentSubscription?.unsubscribe();
    if (this.pureJsCooldownTimer) clearInterval(this.pureJsCooldownTimer);
    if (this.rxjsCooldownTimer) clearInterval(this.rxjsCooldownTimer);
    if (this.autoSpamTimer) clearInterval(this.autoSpamTimer);
  }

  // ============================================================================
  // IMPLEMENTATION: DEMO 1 (THROTTLE)
  // ============================================================================
  onPureJsButtonClick(): void {
    this.pureJsRawClicks++;
    const now = Date.now();

    // Logic từ docs Day 19:
    // if (Date.now() - lastClick >= rate) { ... }
    if (now - this.pureJsLastClick >= this.throttleRateMs) {
      this.pureJsExecutedCount++;
      this.pureJsLastClick = now;
      this.triggerPureJsCooldown();
      this.addLog(
        'THROTTLE',
        `[Pure JS] Pass Click #${this.pureJsExecutedCount} (Raw click #${this.pureJsRawClicks})`
      );
    } else {
      this.addLog(
        'THROTTLE',
        `[Pure JS] Blocked Click! (Chưa đủ ${this.throttleRateMs}ms từ lần click trước)`
      );
    }
  }

  private setupRxjsThrottle(): void {
    if (!this.rxjsThrottleBtnRef) return;

    // Logic từ docs Day 19:
    // fromEvent(btn, 'click').pipe(throttleTime(500), scan(count => count + 1, 0)).subscribe(...)
    this.rxjsThrottleSub = fromEvent(this.rxjsThrottleBtnRef.nativeElement, 'click')
      .pipe(
        throttleTime(this.throttleRateMs),
        scan((count) => count + 1, 0)
      )
      .subscribe({
        next: (count) => {
          this.rxjsExecutedCount = count;
          this.triggerRxjsCooldown();
          this.addLog(
            'THROTTLE',
            `[RxJS throttleTime(500)] Pass Click #${count} (Raw clicks: ${this.rxjsRawClicks})`
          );
        },
      });
  }

  onRxjsRawClick(): void {
    this.rxjsRawClicks++;
  }

  private triggerPureJsCooldown(): void {
    this.pureJsCooldownRemaining = this.throttleRateMs;
    if (this.pureJsCooldownTimer) clearInterval(this.pureJsCooldownTimer);
    this.pureJsCooldownTimer = setInterval(() => {
      this.pureJsCooldownRemaining -= 50;
      if (this.pureJsCooldownRemaining <= 0) {
        this.pureJsCooldownRemaining = 0;
        clearInterval(this.pureJsCooldownTimer);
      }
    }, 50);
  }

  private triggerRxjsCooldown(): void {
    this.rxjsCooldownRemaining = this.throttleRateMs;
    if (this.rxjsCooldownTimer) clearInterval(this.rxjsCooldownTimer);
    this.rxjsCooldownTimer = setInterval(() => {
      this.rxjsCooldownRemaining -= 50;
      if (this.rxjsCooldownRemaining <= 0) {
        this.rxjsCooldownRemaining = 0;
        clearInterval(this.rxjsCooldownTimer);
      }
    }, 50);
  }

  runAutoSpamSimulation(): void {
    if (this.isAutoSpamming) return;
    this.isAutoSpamming = true;
    let clicksDone = 0;
    const totalClicks = 10;
    this.addLog(
      'INFO',
      `Bắt đầu thử nghiệm Auto Spam 10 Clicks (cách nhau 100ms) trên cả hai nút...`
    );

    this.autoSpamTimer = setInterval(() => {
      // Trigger Pure JS
      this.onPureJsButtonClick();

      // Trigger RxJS
      this.onRxjsRawClick();
      this.rxjsThrottleBtnRef.nativeElement.dispatchEvent(new MouseEvent('click'));

      clicksDone++;
      if (clicksDone >= totalClicks) {
        clearInterval(this.autoSpamTimer);
        this.isAutoSpamming = false;
        this.addLog(
          'INFO',
          `Kết thúc Auto Spam! Hãy đối chiếu: 10 Clicks phát ra chỉ có ~2 Clicks được pass qua do Rate=500ms!`
        );
      }
    }, 100);
  }

  resetThrottleStats(): void {
    this.pureJsRawClicks = 0;
    this.pureJsExecutedCount = 0;
    this.pureJsLastClick = Date.now() - this.throttleRateMs;
    this.pureJsCooldownRemaining = 0;

    this.rxjsRawClicks = 0;
    this.rxjsExecutedCount = 0;
    this.rxjsCooldownRemaining = 0;

    // Reset RxJS stream subscription
    this.rxjsThrottleSub?.unsubscribe();
    this.setupRxjsThrottle();

    this.addLog('INFO', 'Đã reset thống kê của thử nghiệm Throttle.');
  }

  // ============================================================================
  // IMPLEMENTATION: DEMO 2 (PROMISE VS OBSERVABLE)
  // ============================================================================
  runPromiseDemo(): void {
    this.promiseState = 'PENDING';
    this.promiseResult = 'Đang xử lý Promise (Eager Execution)...';
    const start = Date.now();
    this.addLog('INFO', '[Promise] Bắt đầu khởi tạo Promise (Eager, thực thi ngay lập tức)');

    const samplePromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve('✅ Dữ liệu hoàn tất: "Hello from Promise!"');
      }, 1500);
    });

    samplePromise.then((data) => {
      this.promiseState = 'RESOLVED';
      this.promiseResult = data;
      this.promiseExecutionTime = Date.now() - start;
      this.addLog(
        'INFO',
        `[Promise] Resolved với 1 giá trị duy nhất sau ${this.promiseExecutionTime}ms. (Không thể emit thêm giá trị thứ 2, không thể hủy giữa chừng).`
      );
    });
  }

  subscribeObservableDemo(): void {
    this.demo2Sub?.unsubscribe();
    this.observableState = 'STREAMING';
    this.observableStreamValues = [];
    this.addLog(
      'INFO',
      '[Observable] Bắt đầu subscribe! Dữ liệu sẽ phát tuần tự nhiều giá trị theo thời gian...'
    );

    // Observable phát 1, 2, 3, 4, 5 sau mỗi 600ms
    const stream$ = interval(600).pipe(
      map((val) => val + 1)
    );

    this.demo2Sub = stream$.subscribe({
      next: (val) => {
        this.observableStreamValues.push(val);
        this.addLog('NEXT', `[Observable] Nhận giá trị mới trong stream: ${val}`);
        if (val >= 6) {
          this.observableState = 'COMPLETED';
          this.demo2Sub?.unsubscribe();
          this.addLog('COMPLETE', '[Observable] Stream tự động hoàn tất sau 6 giá trị.');
        }
      },
    });
  }

  unsubscribeObservableDemo(): void {
    if (this.demo2Sub && !this.demo2Sub.closed) {
      this.demo2Sub.unsubscribe();
      this.observableState = 'CANCELLED';
      this.addLog(
        'TEARDOWN',
        '[Observable] Đã gọi .unsubscribe()! Stream bị hủy lập tức, giải phóng tài nguyên, không nhận thêm giá trị.'
      );
    }
  }

  // ============================================================================
  // IMPLEMENTATION: DEMO 3 (CUSTOM OBSERVABLE & TEARDOWN)
  // ============================================================================
  private createCustomTickerObservable(name: string): Observable<number> {
    return new Observable<number>((observer) => {
      this.addLog(
        'INFO',
        `[Custom Observable - ${name}] Producer bắt đầu chạy vì có Subscriber đăng ký (Lazy Computation)!`
      );

      let tick = 1;
      const intervalId = setInterval(() => {
        observer.next(tick);
        this.addLog('NEXT', `[${name}] Producer phát: Tick #${tick}`);
        tick++;
      }, 1000);

      // Return Teardown logic (Theo docs Day 19)
      return () => {
        clearInterval(intervalId);
        this.addLog(
          'TEARDOWN',
          `[Custom Observable - ${name}] Teardown/Cleanup function được gọi -> Đã thực thi clearInterval(id)!`
        );
      };
    });
  }

  subscribeSubscriberA(): void {
    if (this.subASubscription && !this.subASubscription.closed) return;
    this.subAState = 'ACTIVE';
    this.subACurrentValue = 0;

    const ticker$ = this.createCustomTickerObservable('Subscriber A');
    this.subASubscription = ticker$.subscribe({
      next: (val) => {
        this.subACurrentValue = val;
      },
    });
  }

  unsubscribeSubscriberA(): void {
    if (this.subASubscription) {
      this.subASubscription.unsubscribe();
      this.subAState = 'UNSUBSCRIBED';
      this.addLog('TEARDOWN', 'Subscriber A đã hủy đăng ký (.unsubscribe())');
    }
  }

  subscribeSubscriberB(): void {
    if (this.subBSubscription && !this.subBSubscription.closed) return;
    this.subBState = 'ACTIVE';
    this.subBCurrentValue = 0;

    const ticker$ = this.createCustomTickerObservable('Subscriber B');
    this.subBSubscription = ticker$.subscribe({
      next: (val) => {
        this.subBCurrentValue = val;
      },
    });
  }

  unsubscribeSubscriberB(): void {
    if (this.subBSubscription) {
      this.subBSubscription.unsubscribe();
      this.subBState = 'UNSUBSCRIBED';
      this.addLog('TEARDOWN', 'Subscriber B đã hủy đăng ký (.unsubscribe())');
    }
  }

  // ============================================================================
  // IMPLEMENTATION: DEMO 4 (LIFECYCLE & STREAM CLOSURE SIMULATOR)
  // ============================================================================
  startNewLifecycleStream(): void {
    this.lifecycleSubscription?.unsubscribe();
    this.marbles = [];
    this.marbleCounter = 1;
    this.lifecycleState = 'ACTIVE';
    this.lifecycleErrorMessage = '';

    const stream$ = new Observable<string | number>((observer) => {
      this.lifecycleObserver = observer;
      this.addLog(
        'INFO',
        '[Lifecycle Stream] Khởi tạo Observable execution mới! Sẵn sàng phát Next, Error hoặc Complete.'
      );
      return () => {
        this.addLog('TEARDOWN', '[Lifecycle Stream] Cleanup function đã kích hoạt.');
      };
    });

    this.lifecycleSubscription = stream$.subscribe({
      next: (val) => {
        const time = new Date().toLocaleTimeString();
        this.marbles.push({
          id: this.marbleCounter++,
          type: 'NEXT',
          value: val,
          timestamp: time,
        });
        this.addLog('NEXT', `[Lifecycle] Observer nhận Next Notification: "${val}"`);
      },
      error: (err) => {
        this.lifecycleState = 'ERROR';
        this.lifecycleErrorMessage = err;
        const time = new Date().toLocaleTimeString();
        this.marbles.push({
          id: this.marbleCounter++,
          type: 'ERROR',
          value: 'X',
          timestamp: time,
        });
        this.addLog(
          'ERROR',
          `[Lifecycle] Observer nhận Error Notification: "${err}". STREAM ĐÃ ĐÓNG!`
        );
      },
      complete: () => {
        this.lifecycleState = 'COMPLETED';
        const time = new Date().toLocaleTimeString();
        this.marbles.push({
          id: this.marbleCounter++,
          type: 'COMPLETE',
          value: '|',
          timestamp: time,
        });
        this.addLog(
          'COMPLETE',
          `[Lifecycle] Observer nhận Complete Notification. STREAM ĐÃ ĐÓNG THÀNH CÔNG!`
        );
      },
    });
  }

  emitLifecycleNext(): void {
    if (this.lifecycleState !== 'ACTIVE') {
      this.addLog(
        'INFO',
        `⚠️ Cảnh báo: Stream đang ở trạng thái "${this.lifecycleState}". Tín hiệu Next bị bỏ qua vì Stream đã đóng hoặc chưa bắt đầu!`
      );
      return;
    }
    const val = this.nextPayloadInput.trim() || `Item #${this.marbleCounter}`;
    this.lifecycleObserver?.next(val);
  }

  emitLifecycleError(): void {
    if (this.lifecycleState !== 'ACTIVE') {
      this.addLog(
        'INFO',
        `⚠️ Cảnh báo: Stream đang ở trạng thái "${this.lifecycleState}". Không thể gửi Error vào stream đã đóng!`
      );
      return;
    }
    this.lifecycleObserver?.error('Mô phỏng lỗi mạng: 500 Internal Server Error');
  }

  emitLifecycleComplete(): void {
    if (this.lifecycleState !== 'ACTIVE') {
      this.addLog(
        'INFO',
        `⚠️ Cảnh báo: Stream đang ở trạng thái "${this.lifecycleState}". Không thể gửi Complete vào stream đã đóng!`
      );
      return;
    }
    this.lifecycleObserver?.complete();
  }

  unsubscribeLifecycle(): void {
    if (this.lifecycleSubscription) {
      this.lifecycleSubscription.unsubscribe();
      this.lifecycleState = 'IDLE';
      this.addLog('TEARDOWN', '[Lifecycle] Đã unsubscribe() Observable execution.');
    }
  }

  // ============================================================================
  // IMPLEMENTATION: DEMO 5 (COMPOSITE SUBSCRIPTIONS WITH .add())
  // ============================================================================
  startCompositeStreams(): void {
    this.parentSubscription?.unsubscribe();
    this.compositeState = 'RUNNING';
    this.parentStreamCount = 0;
    this.childStreamCount = 0;

    this.addLog(
      'INFO',
      '[Composite Subscription] Bắt đầu Parent Stream (500ms) và Child Stream (800ms)...'
    );

    // Stream 1 (Parent): 500ms
    const parent$ = interval(500).pipe(map((x) => x + 1));
    this.parentSubscription = parent$.subscribe((val) => {
      this.parentStreamCount = val;
    });

    // Stream 2 (Child): 800ms
    const child$ = interval(800).pipe(map((x) => x + 1));
    const childSub = child$.subscribe((val) => {
      this.childStreamCount = val;
    });

    // Theo docs Day 19: parent.add(childSub)
    this.parentSubscription.add(childSub);

    this.addLog(
      'INFO',
      'Đã thực thi parentSubscription.add(childSub). Khi hủy Parent, cả Child cũng sẽ tự động bị hủy!'
    );
  }

  unsubscribeCompositeStreams(): void {
    if (this.parentSubscription && !this.parentSubscription.closed) {
      this.parentSubscription.unsubscribe();
      this.compositeState = 'UNSUBSCRIBED';
      this.addLog(
        'TEARDOWN',
        '[Composite Subscription] parentSubscription.unsubscribe() đã được gọi! Cả Parent Stream và Child Stream đều dừng ngay lập tức!'
      );
    }
  }

  // ============================================================================
  // ACTIVITY LOGGER HELPER
  // ============================================================================
  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    type: 'NEXT' | 'ERROR' | 'COMPLETE' | 'TEARDOWN' | 'THROTTLE' | 'INFO',
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
      message,
    });

    if (this.logs.length > 30) {
      this.logs.pop();
    }
  }
}
