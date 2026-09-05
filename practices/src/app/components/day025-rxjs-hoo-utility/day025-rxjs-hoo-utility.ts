import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Observable,
  Subject,
  Subscription,
  concatAll,
  concatMap,
  delay,
  exhaustMap,
  finalize,
  from,
  interval,
  map,
  merge,
  mergeAll,
  mergeMap,
  of,
  partition,
  repeat,
  switchAll,
  switchMap,
  take,
  tap,
  throwError,
  timeInterval,
  timeout,
  timer,
} from 'rxjs';

/**
 * ============================================================================
 * INTERFACES & DATA MODELS (Based on docs/Day025-rxjs-hoo-utility.md)
 * ============================================================================
 */
export interface ActivityLog {
  id: number;
  time: string;
  type: 'NEXT' | 'START' | 'CANCEL' | 'IGNORE' | 'FINALIZE' | 'TIMEOUT' | 'INFO';
  operator: string;
  message: string;
}

export interface HooDecisionSpec {
  operator: string;
  type: 'HOO (Flattening)' | 'Utility Operator';
  innerHandling: string;
  angularUseCase: string;
  riskOrGotcha: string;
  syntax: string;
}

export interface HooRequestItem {
  id: number;
  label: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'IGNORED';
  progress: number;
  result?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  isRead: boolean;
  time: string;
}

@Component({
  selector: 'app-day025-rxjs-hoo-utility',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day025-rxjs-hoo-utility.html',
  styleUrl: './day025-rxjs-hoo-utility.scss',
})
export class Day025RxjsHooUtility implements OnInit, OnDestroy {
  // Navigation tabs
  activeTab: 'big-four' | 'origin-partition' | 'tap-finalize' | 'timing-utility' | 'cheatsheet' =
    'big-four';

  // ============================================================================
  // DEMO 1: The Big Four HOOs (switchMap, mergeMap, concatMap, exhaustMap)
  // ============================================================================
  selectedHoo: 'switchMap' | 'mergeMap' | 'concatMap' | 'exhaustMap' = 'switchMap';
  hooRequests: HooRequestItem[] = [];
  private outerTrigger$ = new Subject<{ id: number; durationMs: number }>();
  private requestCounter: number = 1;
  private hooSubscription?: Subscription;

  // Real-world search demo (switchMap)
  searchQuery: string = 'Angular';
  isSearching: boolean = false;
  searchResult: string[] = [];
  private searchSubject$ = new Subject<string>();
  private searchSub?: Subscription;

  // ============================================================================
  // DEMO 2: Origin of HOOs & partition()
  // ============================================================================
  originFlattenMode: 'switchAll' | 'mergeAll' | 'concatAll' = 'switchAll';
  originLogs: string[] = [];

  // partition() demo
  allNotifications: NotificationItem[] = [
    { id: 1, title: 'Thông báo #1: PR #104 đã được merge', isRead: false, time: '10:00' },
    { id: 2, title: 'Thông báo #2: Cập nhật Angular 19 có sẵn', isRead: true, time: '09:45' },
    { id: 3, title: 'Thông báo #3: Nhắc nhở họp daily lúc 10:30', isRead: false, time: '09:30' },
    { id: 4, title: 'Thông báo #4: Backup dữ liệu tự động hoàn tất', isRead: true, time: '08:00' },
  ];
  unreadList: NotificationItem[] = [];
  readList: NotificationItem[] = [];

  // ============================================================================
  // DEMO 3: tap(), finalize(), repeat()
  // ============================================================================
  isLoadingApi: boolean = false;
  apiSuccessToggle: boolean = true;
  apiStatusMessage: string = 'Sẵn sàng gọi API';
  finalizeExecutedCount: number = 0;
  repeatCount: number = 3;
  repeatedEmissions: string[] = [];
  private apiSub?: Subscription;

  // ============================================================================
  // DEMO 4: delay(), timeInterval(), timeout()
  // ============================================================================
  // timeInterval click speed tester
  lastClickIntervalMs: number | null = null;
  clickHistory: Array<{ clickIndex: number; intervalMs: number; speedLevel: string }> = [];
  private clickSubject$ = new Subject<void>();
  private timeIntervalSub?: Subscription;
  private clickCounter: number = 1;

  // timeout() & fallback
  apiDelaySettingMs: number = 800; // Có thể chọn 800ms (thành công) hoặc 2000ms (timeout)
  timeoutThresholdMs: number = 1200;
  timeoutResult: string = '';
  isTimeoutRunning: boolean = false;
  private timeoutSub?: Subscription;

  // ============================================================================
  // ACTIVITY LOGGER & CLEANUP
  // ============================================================================
  logs: ActivityLog[] = [];
  private logIdCounter: number = 1;
  private destroy$ = new Subject<void>();

  // ============================================================================
  // CHEATSHEET & DECISION MATRIX
  // ============================================================================
  readonly cheatsheetSpecs: HooDecisionSpec[] = [
    {
      operator: 'switchMap()',
      type: 'HOO (Flattening)',
      innerHandling: 'Unsubscribe Inner cũ ngay khi Outer phát giá trị mới (chỉ giữ 1 active stream).',
      angularUseCase: 'Autocomplete search, lọc bảng, chuyển trang (chỉ quan tâm kết quả mới nhất).',
      riskOrGotcha: 'Không dùng cho Create/Update/Delete vì request có thể bị hủy giữa chừng.',
      syntax: 'query$.pipe(switchMap(q => api.search(q)))',
    },
    {
      operator: 'mergeMap()',
      type: 'HOO (Flattening)',
      innerHandling: 'Giữ nhiều Inner chạy song song đồng thời (concurrency không giới hạn).',
      angularUseCase: 'Tải song song nhiều ảnh/file, gọi các API độc lập không phụ thuộc thứ tự.',
      riskOrGotcha: 'Nguy cơ Memory Leak nếu Inner stream là long-lived (như interval/webSocket) không tự complete.',
      syntax: 'userIds$.pipe(mergeMap(id => api.getUser(id)))',
    },
    {
      operator: 'concatMap()',
      type: 'HOO (Flattening)',
      innerHandling: 'Xếp hàng Inner stream theo thứ tự: Chờ Inner 1 complete rồi mới chạy Inner 2.',
      angularUseCase: 'Upload danh sách file tuần tự, animation bước 1 ➡️ bước 2, ghi log database.',
      riskOrGotcha: 'Nếu một Inner bị treo hoặc không bao giờ complete thì toàn bộ hàng đợi phía sau bị tắc nghẽn.',
      syntax: 'files$.pipe(concatMap(file => api.upload(file)))',
    },
    {
      operator: 'exhaustMap()',
      type: 'HOO (Flattening)',
      innerHandling: 'Bỏ qua hoàn toàn các Outer mới trong khi Inner hiện tại vẫn đang chạy.',
      angularUseCase: 'Chống spam click: Nút Đăng nhập, Thanh toán đơn hàng, Nộp biểu mẫu.',
      riskOrGotcha: 'Người dùng click liên tục thì các click sau sẽ bị hủy bỏ hoàn toàn cho đến khi request đầu xong.',
      syntax: 'loginClick$.pipe(exhaustMap(creds => api.login(creds)))',
    },
    {
      operator: 'partition()',
      type: 'HOO (Flattening)',
      innerHandling: 'Tách 1 Source Observable thành 2 Destination Observables [Pass$, Fail$] theo predicate.',
      angularUseCase: 'Phân loại thông báo (Đã đọc vs Chưa đọc), phân loại sự kiện WebSocket theo type.',
      riskOrGotcha: 'Là Higher-order Function trả về mảng 2 Observable chứ không dùng trong pipe().',
      syntax: 'const [reads$, unreads$] = partition(notifs$, n => n.isRead)',
    },
    {
      operator: 'tap()',
      type: 'Utility Operator',
      innerHandling: 'Thực thi Side-effect (log dữ liệu, bật loader) mà hoàn toàn không biến đổi stream.',
      angularUseCase: 'Debug dữ liệu giữa các bước pipe, cập nhật state phụ trợ trong component.',
      riskOrGotcha: 'Tránh mutate (thay đổi) trực tiếp object bên trong tap vì có thể gây bug khó lần vết.',
      syntax: 'source$.pipe(tap(val => console.log(val)))',
    },
    {
      operator: 'finalize()',
      type: 'Utility Operator',
      innerHandling: 'Chạy callback dọn dẹp khi Observable kết thúc (Complete HOẶC Error).',
      angularUseCase: 'Tắt spinner loading: this.loading = false (cho cả trường hợp thành công lẫn lỗi).',
      riskOrGotcha: 'Chỉ kích hoạt khi stream kết thúc; nếu stream chưa complete hoặc bị leak sẽ không chạy.',
      syntax: 'api$.pipe(finalize(() => this.loading = false))',
    },
    {
      operator: 'repeat(count)',
      type: 'Utility Operator',
      innerHandling: 'Lặp lại Source Observable khi nó phát tín hiệu Complete tối đa count lần.',
      angularUseCase: 'Polling dữ liệu định kỳ, thử tải lại sau khi complete.',
      riskOrGotcha: 'Chỉ lặp khi COMPLETE (khác với retry chỉ lặp khi ERROR).',
      syntax: 'data$.pipe(repeat(3))',
    },
    {
      operator: 'timeInterval()',
      type: 'Utility Operator',
      innerHandling: 'Đo khoảng thời gian (ms) trôi qua giữa 2 lần phát tín hiệu liên tiếp.',
      angularUseCase: 'Đo tốc độ click chuột, phát hiện double-click, đo thời gian người dùng thao tác.',
      riskOrGotcha: 'Giá trị trả về là đối tượng { value, interval } thay vì giá trị nguyên bản.',
      syntax: 'click$.pipe(timeInterval())',
    },
    {
      operator: 'timeout()',
      type: 'Utility Operator',
      innerHandling: 'Ném ra TimeoutError nếu Source không phát tín hiệu nào trong khoảng thời gian quy định.',
      angularUseCase: 'Ngắt kết nối HTTP request khi server phản hồi quá chậm quá 5 giây.',
      riskOrGotcha: 'Cần bọc catchError nếu muốn cung cấp giá trị fallback thay vì làm sập stream.',
      syntax: 'http.get(...).pipe(timeout(5000), catchError(...))',
    },
  ];

  ngOnInit(): void {
    this.addLog(
      'INFO',
      'System',
      'Khởi tạo Day025RxjsHooUtility: Sẵn sàng khám phá Higher Order Observables và Utility Operators!'
    );
    this.initHooPipeline();
    this.initSearchPipeline();
    this.initTimeIntervalPipeline();
    this.executePartitionDemo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.hooSubscription?.unsubscribe();
    this.searchSub?.unsubscribe();
    this.apiSub?.unsubscribe();
    this.timeIntervalSub?.unsubscribe();
    this.timeoutSub?.unsubscribe();
  }

  // ============================================================================
  // 1. DEMO: The Big Four HOOs (switchMap, mergeMap, concatMap, exhaustMap)
  // ============================================================================
  onHooOperatorChange(operator: 'switchMap' | 'mergeMap' | 'concatMap' | 'exhaustMap'): void {
    this.selectedHoo = operator;
    this.initHooPipeline();
    this.addLog(
      'INFO',
      'Operator Switch',
      `Đã chuyển chế độ HOO sang: ${operator}()`
    );
  }

  private initHooPipeline(): void {
    this.hooSubscription?.unsubscribe();

    // Mapping projectFunction tạo ra 1 Observable mô phỏng HTTP request mất durationMs
    const projectFn = (req: { id: number; durationMs: number }) => {
      this.updateRequestStatus(req.id, 'RUNNING');
      this.addLog(
        'START',
        this.selectedHoo,
        `Bắt đầu xử lý Request #${req.id} (Dự kiến: ${req.durationMs}ms)`
      );

      return timer(req.durationMs).pipe(
        map(() => `Kết quả thành công của Request #${req.id}`),
        finalize(() => {
          // Khi request bị cancel (do switchMap) hoặc complete
          const item = this.hooRequests.find((r) => r.id === req.id);
          if (item && item.status === 'RUNNING') {
            item.status = 'COMPLETED';
          }
        })
      );
    };

    let stream$: Observable<string>;

    switch (this.selectedHoo) {
      case 'switchMap':
        stream$ = this.outerTrigger$.pipe(
          switchMap((req) => {
            // Khi có request mới, đánh dấu các request cũ đang RUNNING thành CANCELLED
            this.hooRequests.forEach((r) => {
              if (r.id !== req.id && r.status === 'RUNNING') {
                r.status = 'CANCELLED';
                this.addLog(
                  'CANCEL',
                  'switchMap()',
                  `Hủy bỏ Request #${r.id} đang chạy vì có Request mới #${req.id}!`
                );
              }
            });
            return projectFn(req);
          })
        );
        break;

      case 'mergeMap':
        stream$ = this.outerTrigger$.pipe(mergeMap(projectFn));
        break;

      case 'concatMap':
        stream$ = this.outerTrigger$.pipe(concatMap(projectFn));
        break;

      case 'exhaustMap':
        stream$ = this.outerTrigger$.pipe(
          exhaustMap((req) => {
            return projectFn(req);
          })
        );
        break;
    }

    this.hooSubscription = stream$.subscribe({
      next: (result) => {
        this.addLog('NEXT', this.selectedHoo, `Emit: "${result}"`);
        // Tìm và đánh dấu kết quả
        const match = result.match(/#(\d+)/);
        if (match) {
          const id = parseInt(match[1], 10);
          const item = this.hooRequests.find((r) => r.id === id);
          if (item) {
            item.status = 'COMPLETED';
            item.result = result;
          }
        }
      },
    });
  }

  triggerNewRequest(durationMs: number = 1500): void {
    const id = this.requestCounter++;

    // Kiểm tra exhaustMap: nếu đang có request RUNNING thì request mới sẽ bị bỏ qua
    if (this.selectedHoo === 'exhaustMap') {
      const hasActive = this.hooRequests.some((r) => r.status === 'RUNNING');
      if (hasActive) {
        this.hooRequests.unshift({
          id,
          label: `Request #${id} (${durationMs}ms)`,
          status: 'IGNORED',
          progress: 0,
          result: 'Bị exhaustMap() bỏ qua vì request trước chưa hoàn tất!',
        });
        this.addLog(
          'IGNORE',
          'exhaustMap()',
          `Bỏ qua Request #${id}: exhaustMap từ chối nhận request mới khi đang xử lý!`
        );
        return;
      }
    }

    const newItem: HooRequestItem = {
      id,
      label: `Request #${id} (${durationMs}ms)`,
      status: this.selectedHoo === 'concatMap' && this.hooRequests.some((r) => r.status === 'RUNNING') ? 'PENDING' : 'RUNNING',
      progress: 0,
    };

    this.hooRequests.unshift(newItem);
    if (this.hooRequests.length > 8) this.hooRequests.pop();

    this.outerTrigger$.next({ id, durationMs });
  }

  triggerRapidRequests(): void {
    this.addLog(
      'INFO',
      this.selectedHoo,
      'Gửi liên tiếp 3 requests (800ms, 1200ms, 600ms) để quan sát sự khác biệt!'
    );
    this.triggerNewRequest(800);
    setTimeout(() => this.triggerNewRequest(1200), 200);
    setTimeout(() => this.triggerNewRequest(600), 400);
  }

  clearRequests(): void {
    this.hooRequests = [];
  }

  private updateRequestStatus(id: number, status: 'RUNNING' | 'COMPLETED' | 'CANCELLED'): void {
    const item = this.hooRequests.find((r) => r.id === id);
    if (item) {
      item.status = status;
    }
  }

  // Real-world Search Autocomplete with switchMap
  private initSearchPipeline(): void {
    this.searchSub = this.searchSubject$
      .pipe(
        tap((q) => {
          this.isSearching = true;
          this.addLog('INFO', 'switchMap() Search', `Gõ từ khóa: "${q}"...`);
        }),
        // Mô phỏng delay 400ms của API tìm kiếm
        switchMap((query) => {
          const allCourses = [
            'Angular 19 Signals & RxJS',
            'Angular Router Deep Dive',
            'Angular Forms Architecture',
            'RxJS Higher Order Observables',
            'NgRx ComponentStore & SignalStore',
            'TypeScript Advanced Generics',
          ];
          const filtered = allCourses.filter((c) =>
            c.toLowerCase().includes(query.toLowerCase())
          );
          return of(filtered).pipe(delay(400));
        }),
        tap(() => (this.isSearching = false))
      )
      .subscribe((results) => {
        this.searchResult = results;
        this.addLog(
          'NEXT',
          'switchMap() Search',
          `Kết quả tìm kiếm mới nhất: ${results.length} khóa học.`
        );
      });
  }

  onSearchInputChange(): void {
    this.searchSubject$.next(this.searchQuery);
  }

  // ============================================================================
  // 2. DEMO: Origin of HOOs & partition()
  // ============================================================================
  runOriginDemo(mode: 'switchAll' | 'mergeAll' | 'concatAll'): void {
    this.originFlattenMode = mode;
    this.originLogs = [];

    this.addLog(
      'INFO',
      `${mode}()`,
      `Khởi chạy mô phỏng: map(() => timer) kết hợp ${mode}() để biến Observable<Observable> thành Observable phẳng!`
    );

    // Tạo Higher Order Observable: Outer emit 2 lần, mỗi lần map ra 1 timer(500)
    const outer$ = of(1, 2).pipe(
      map((outerVal) => {
        return of(`Giá trị Inner từ Outer #${outerVal}`).pipe(delay(outerVal * 300));
      })
    );

    let flattened$: Observable<string>;
    if (mode === 'switchAll') flattened$ = outer$.pipe(switchAll());
    else if (mode === 'mergeAll') flattened$ = outer$.pipe(mergeAll());
    else flattened$ = outer$.pipe(concatAll());

    flattened$.subscribe((val) => {
      this.originLogs.push(val);
      this.addLog('NEXT', mode, val);
    });
  }

  executePartitionDemo(): void {
    // partition() tách Source thành [Pass$, Fail$]
    const source$ = from(this.allNotifications);
    const [unread$, read$] = partition(source$, (item: NotificationItem) => !item.isRead);

    this.unreadList = [];
    this.readList = [];

    unread$.subscribe((item) => this.unreadList.push(item));
    read$.subscribe((item) => this.readList.push(item));

    this.addLog(
      'INFO',
      'partition()',
      `Tách danh sách thông báo: ${this.unreadList.length} chưa đọc (Pass$), ${this.readList.length} đã đọc (Fail$).`
    );
  }

  toggleNotificationStatus(item: NotificationItem): void {
    item.isRead = !item.isRead;
    this.executePartitionDemo();
  }

  // ============================================================================
  // 3. DEMO: tap(), finalize(), repeat()
  // ============================================================================
  runTapAndFinalizeDemo(): void {
    this.apiSub?.unsubscribe();
    this.isLoadingApi = true;
    this.apiStatusMessage = 'Đang gọi API giả lập (mất 800ms)...';

    this.addLog(
      'START',
      'tap() & finalize()',
      `Bắt đầu request. Thiết lập kịch bản: ${this.apiSuccessToggle ? 'Thành công' : 'Gặp lỗi 500'}`
    );

    const mockApi$ = timer(800).pipe(
      tap(() => {
        this.addLog('INFO', 'tap()', 'Side-effect trong tap(): Đã nhận phản hồi sơ bộ từ server!');
      }),
      switchMap(() => {
        if (!this.apiSuccessToggle) {
          return throwError(() => new Error('Lỗi máy chủ nội bộ (500 Internal Server Error)'));
        }
        return of({ status: 200, message: 'Dữ liệu người dùng tải thành công!' });
      }),
      finalize(() => {
        // finalize() luôn chạy dù có success hay error!
        this.isLoadingApi = false;
        this.finalizeExecutedCount++;
        this.addLog(
          'FINALIZE',
          'finalize()',
          'finalize() đã kích hoạt: Tắt loading spinner an toàn cho mọi tình huống!'
        );
      })
    );

    this.apiSub = mockApi$.subscribe({
      next: (res) => {
        this.apiStatusMessage = `✅ 200 OK: ${res.message}`;
        this.addLog('NEXT', 'API', res.message);
      },
      error: (err) => {
        this.apiStatusMessage = `❌ Thất bại: ${err.message}`;
        this.addLog('NEXT', 'API Error', err.message);
      },
    });
  }

  runRepeatDemo(): void {
    this.repeatedEmissions = [];
    this.addLog(
      'INFO',
      'repeat()',
      `Chạy stream: of("Dữ liệu polling").pipe(repeat(${this.repeatCount}))`
    );

    of('🔄 Tín hiệu Polling dữ liệu mới')
      .pipe(repeat(this.repeatCount))
      .subscribe((val) => {
        this.repeatedEmissions.push(val);
        this.addLog('NEXT', 'repeat()', `Lặp lại #${this.repeatedEmissions.length}: ${val}`);
      });
  }

  // ============================================================================
  // 4. DEMO: delay(), timeInterval(), timeout()
  // ============================================================================
  private initTimeIntervalPipeline(): void {
    this.timeIntervalSub = this.clickSubject$
      .pipe(
        timeInterval(),
        map((intervalInfo) => {
          const ms = intervalInfo.interval;
          let speedLevel = 'Bình thường';
          if (ms < 300) speedLevel = '⚡ Siêu nhanh (Double-Click)!';
          else if (ms < 700) speedLevel = '🚀 Nhanh';
          else speedLevel = '🐢 Chậm rãi';

          return { clickIndex: this.clickCounter++, intervalMs: ms, speedLevel };
        })
      )
      .subscribe((info) => {
        this.lastClickIntervalMs = info.intervalMs;
        this.clickHistory.unshift(info);
        if (this.clickHistory.length > 6) this.clickHistory.pop();

        this.addLog(
          'NEXT',
          'timeInterval()',
          `Click #${info.clickIndex}: Cách lần click trước ${info.intervalMs}ms (${info.speedLevel})`
        );
      });
  }

  onUserClickTester(): void {
    this.clickSubject$.next();
  }

  runTimeoutDemo(): void {
    this.timeoutSub?.unsubscribe();
    this.isTimeoutRunning = true;
    this.timeoutResult = `Đang gọi API với độ trễ ${this.apiDelaySettingMs}ms (Ngưỡng timeout: ${this.timeoutThresholdMs}ms)...`;

    this.addLog(
      'START',
      'timeout()',
      `Request bắt đầu (delay: ${this.apiDelaySettingMs}ms | threshold: ${this.timeoutThresholdMs}ms)`
    );

    // Giả lập API mất apiDelaySettingMs để phản hồi
    const delayedApi$ = of('Dữ liệu API chính phản hồi thành công!').pipe(
      delay(this.apiDelaySettingMs),
      timeout({
        each: this.timeoutThresholdMs,
        with: () => {
          this.addLog(
            'TIMEOUT',
            'timeout() Fallback',
            `Quá hạn ${this.timeoutThresholdMs}ms! Tự động chuyển hướng sang Dữ liệu Cache dự phòng.`
          );
          return of('📦 Dữ liệu dự phòng từ Cache (Do timeout server chính)');
        },
      }),
      finalize(() => {
        this.isTimeoutRunning = false;
      })
    );

    this.timeoutSub = delayedApi$.subscribe((res) => {
      this.timeoutResult = res;
      this.addLog('NEXT', 'timeout()', res);
    });
  }

  // ============================================================================
  // ACTIVITY LOGGER HELPER
  // ============================================================================
  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    type: 'NEXT' | 'START' | 'CANCEL' | 'IGNORE' | 'FINALIZE' | 'TIMEOUT' | 'INFO',
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
