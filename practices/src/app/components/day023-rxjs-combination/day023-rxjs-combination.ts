import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Observable,
  Subject,
  Subscription,
  combineLatest,
  concat,
  delay,
  endWith,
  forkJoin,
  from,
  interval,
  map,
  merge,
  of,
  pairwise,
  race,
  startWith,
  take,
  timer,
  withLatestFrom,
  zip,
} from 'rxjs';

/**
 * ============================================================================
 * INTERFACES & DATA MODELS (Based on docs/Day023-rxjs-combination.md)
 * ============================================================================
 */
export interface ActivityLog {
  id: number;
  time: string;
  type: 'NEXT' | 'COMPLETE' | 'RACE' | 'PAIR' | 'INFO';
  operator: string;
  message: string;
}

export interface CombinationDecisionSpec {
  operator: string;
  category: 'Static Creation' | 'Pipeable Operator';
  whenToUse: string;
  emitsWhen: string;
  autoComplete: string;
  angularUseCase: string;
}

@Component({
  selector: 'app-day023-rxjs-combination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day023-rxjs-combination.html',
  styleUrl: './day023-rxjs-combination.scss',
})
export class Day023RxjsCombination implements OnInit, OnDestroy {
  // Navigation Tabs
  activeTab: 'forkjoin-combine' | 'zip-concat-merge' | 'race' | 'pipeable' | 'cheatsheet' =
    'forkjoin-combine';

  // ============================================================================
  // DEMO 1: forkJoin() vs combineLatest()
  // ============================================================================
  // forkJoin state (Mock Dropdown APIs)
  isForkJoinLoading: boolean = false;
  forkJoinResults: {
    accounts: string[];
    departments: string[];
    stores: string[];
  } | null = null;
  private forkJoinSub?: Subscription;

  // combineLatest state (Pagination VM$)
  currentPage: number = 1;
  currentSize: number = 10;
  totalCount: number = 100;
  searchTerm: string = 'Angular';
  private page$ = new Subject<number>();
  private size$ = new Subject<number>();
  private search$ = new Subject<string>();
  combineLatestVm: {
    page: number;
    size: number;
    total: number;
    search: string;
    displayRange: string;
  } | null = null;
  private combineLatestSub?: Subscription;

  // ============================================================================
  // DEMO 2: zip() vs concat() vs merge()
  // ============================================================================
  // zip() state
  zipResults: Array<{ age: number; name: string; isAdmin: boolean }> = [];

  // concat() vs merge() state
  concatMergeMode: 'concat' | 'merge' = 'concat';
  streamExecutionItems: Array<{ id: number; streamName: string; value: string; time: string }> = [];
  isStreamRunning: boolean = false;
  private streamSub?: Subscription;

  // ============================================================================
  // DEMO 3: race()
  // ============================================================================
  isBannerVisible: boolean = false;
  bannerWinner: string = '';
  private bannerUserClose$ = new Subject<string>();
  private bannerNavigate$ = new Subject<string>();
  private raceSub?: Subscription;

  // ============================================================================
  // DEMO 4: withLatestFrom(), startWith(), endWith(), pairwise()
  // ============================================================================
  // withLatestFrom
  liveExchangeRate: number = 25400; // USD to VND
  private liveExchangeRateSub?: Subscription;
  orderSubmissionLogs: Array<{ orderId: number; amountUsd: number; rate: number; totalVnd: number }> =
    [];
  private orderCounter: number = 1;

  // startWith / endWith
  productStreamState: 'IDLE' | 'LOADING' | 'COMPLETED' = 'IDLE';
  productStreamItems: string[] = [];
  private productSub?: Subscription;

  // pairwise
  stockPrice: number = 100;
  pairwiseDeltas: Array<{ prev: number; curr: number; diff: number; trend: 'UP' | 'DOWN' | 'EQUAL' }> =
    [];

  // ============================================================================
  // ACTIVITY LOGGER & SUBSCRIPTIONS
  // ============================================================================
  logs: ActivityLog[] = [];
  private logIdCounter: number = 1;
  private destroy$ = new Subject<void>();

  // ============================================================================
  // DECISION MATRIX / CHEATSHEET
  // ============================================================================
  readonly decisionSpecs: CombinationDecisionSpec[] = [
    {
      operator: 'forkJoin([...])',
      category: 'Static Creation',
      whenToUse: 'Khi cần gọi nhiều API song song và chờ TẤT CẢ cùng hoàn tất (giống Promise.all).',
      emitsWhen: 'Tất cả Observables con đã COMPLETE.',
      autoComplete: 'Có (Complete ngay sau 1 lần emit)',
      angularUseCase: 'Tải cùng lúc danh mục Dropdown, quyền người dùng, và config khi khởi tạo component.',
    },
    {
      operator: 'combineLatest([...])',
      category: 'Static Creation',
      whenToUse: 'Khi cần phối hợp nhiều state (long-lived) và luôn cập nhật giao diện khi BẤT KỲ state nào đổi.',
      emitsWhen: 'Tất cả con đã emit ít nhất 1 lần, sau đó emit mỗi khi có 1 con thay đổi.',
      autoComplete: 'Không (Sống cho đến khi tất cả con complete)',
      angularUseCase: 'Tạo viewModel vm$ kết hợp Pagination, Filter, Search và Sort với AsyncPipe trong template.',
    },
    {
      operator: 'zip(...)',
      category: 'Static Creation',
      whenToUse: 'Khi cần ghép từng cặp phần tử theo đúng THỨ TỰ CHỈ MỤC (1st với 1st, 2nd với 2nd).',
      emitsWhen: 'Tất cả con đều có phần tử mới ở cùng chỉ mục.',
      autoComplete: 'Có (Complete khi stream ngắn nhất complete)',
      angularUseCase: 'Ghép tọa độ mousedown và mouseup, hoặc tổng hợp các thuộc tính từ các stream có cùng số lượng.',
    },
    {
      operator: 'concat(...)',
      category: 'Static Creation',
      whenToUse: 'Khi cần thực thi tuần tự theo thứ tự: Stream A chạy xong và complete ➡️ mới chạy Stream B.',
      emitsWhen: 'Từng stream con phát tín hiệu theo thứ tự xếp hàng.',
      autoComplete: 'Có (Khi stream con cuối cùng complete)',
      angularUseCase: 'Upload từng file một theo hàng đợi, hoặc chạy animation bước 1 rồi mới đến bước 2.',
    },
    {
      operator: 'merge(...)',
      category: 'Static Creation',
      whenToUse: 'Khi muốn gộp nhiều stream lại thành 1 dòng chảy đồng thời mà KHÔNG quan tâm thứ tự.',
      emitsWhen: 'Bất kỳ stream con nào phát tín hiệu.',
      autoComplete: 'Có (Khi toàn bộ stream con complete)',
      angularUseCase: 'Lắng nghe valueChanges từ nhiều FormControl trong FormGroup, hoặc gộp các loại sự kiện click/touch.',
    },
    {
      operator: 'race(...)',
      category: 'Static Creation',
      whenToUse: 'Khi có nhiều sự kiện cạnh tranh và bạn CHỈ QUAN TÂM sự kiện nào xảy ra ĐẦU TIÊN (kẻ chiến thắng).',
      emitsWhen: 'Observable nào nhanh nhất phát giá trị đầu tiên.',
      autoComplete: 'Theo stream chiến thắng',
      angularUseCase: 'Tự động đóng Alert Banner: sau 5s timer HOẶC user click nút đóng HOẶC user chuyển route.',
    },
    {
      operator: 'withLatestFrom(...)',
      category: 'Pipeable Operator',
      whenToUse: 'Khi Outer Observable phát, muốn lấy thêm giá trị MỚI NHẤT của Inner Observable làm ngữ cảnh.',
      emitsWhen: 'CHỈ khi Outer stream phát tín hiệu (Inner stream phát sẽ không kích hoạt emit).',
      autoComplete: 'Theo Outer stream',
      angularUseCase: 'Khi user click nút "Submit Order", lấy kèm token và tỷ giá tiền tệ mới nhất.',
    },
    {
      operator: 'startWith(...) / endWith(...)',
      category: 'Pipeable Operator',
      whenToUse: 'Chèn thêm giá trị khởi đầu (ngay lập tức) hoặc giá trị kết thúc (khi complete) cho stream.',
      emitsWhen: 'startWith phát ngay khi subscribe; endWith phát khi source complete.',
      autoComplete: 'Theo source stream',
      angularUseCase: 'startWith([]) để template hiển thị mảng rỗng trước khi API load xong, tránh lỗi null pointer.',
    },
    {
      operator: 'pairwise()',
      category: 'Pipeable Operator',
      whenToUse: 'Khi cần so sánh giá trị hiện tại với giá trị LIỀN TRƯỚC ĐÓ theo cặp [previous, current].',
      emitsWhen: 'Từ lần emit thứ 2 trở đi của source stream.',
      autoComplete: 'Theo source stream',
      angularUseCase: 'Tính độ chênh lệch giá cổ phiếu, phát hiện hướng cuộn trang (scroll up/down), hoặc route history.',
    },
  ];

  ngOnInit(): void {
    this.setupCombineLatestVm();
    this.setupExchangeRateTicker();
    this.addLog(
      'INFO',
      'System',
      'Khởi tạo Day023RxjsCombination: Đã sẵn sàng khám phá tất cả các Combination Operators!'
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.forkJoinSub?.unsubscribe();
    this.combineLatestSub?.unsubscribe();
    this.streamSub?.unsubscribe();
    this.raceSub?.unsubscribe();
    this.liveExchangeRateSub?.unsubscribe();
    this.productSub?.unsubscribe();
  }

  // ============================================================================
  // 1. DEMO: forkJoin() vs combineLatest()
  // ============================================================================
  runForkJoinDemo(): void {
    this.forkJoinSub?.unsubscribe();
    this.isForkJoinLoading = true;
    this.forkJoinResults = null;

    this.addLog(
      'INFO',
      'forkJoin()',
      'Bắt đầu gọi 3 mock HTTP APIs song song: Accounts (600ms), Departments (1000ms), Stores (800ms)...'
    );

    // Mô phỏng đúng tài liệu Day 23:
    // forkJoin([getAccountDropdown(), getDepartmentDropdown(), getStoreDropdown()])
    const accounts$ = of(['Acc #101', 'Acc #102', 'Acc #103']).pipe(delay(600));
    const departments$ = of(['Phòng IT', 'Phòng Kế Toán', 'Phòng Marketing']).pipe(delay(1000));
    const stores$ = of(['Chi nhánh Hà Nội', 'Chi nhánh TP.HCM']).pipe(delay(800));

    // Sử dụng Dictionary/Object format như tài liệu
    this.forkJoinSub = forkJoin({
      accounts: accounts$,
      departments: departments$,
      stores: stores$,
    }).subscribe({
      next: (res) => {
        this.isForkJoinLoading = false;
        this.forkJoinResults = res;
        this.addLog(
          'COMPLETE',
          'forkJoin()',
          `Cả 3 APIs đã hoàn tất! Kết quả gộp: ${res.accounts.length} accounts, ${res.departments.length} departments, ${res.stores.length} stores.`
        );
      },
    });
  }

  private setupCombineLatestVm(): void {
    // Mô phỏng ví dụ thực tế PaginationComponent trong docs Day 23
    this.combineLatestSub = combineLatest([
      this.page$.pipe(startWith(this.currentPage)),
      this.size$.pipe(startWith(this.currentSize)),
      this.search$.pipe(startWith(this.searchTerm)),
    ]).subscribe(([page, size, search]) => {
      const fromItem = (page - 1) * size + 1;
      const toItem = Math.min(page * size, this.totalCount);
      this.combineLatestVm = {
        page,
        size,
        total: this.totalCount,
        search,
        displayRange: `${fromItem} - ${toItem} của ${this.totalCount}`,
      };
      this.addLog(
        'NEXT',
        'combineLatest()',
        `VM$ cập nhật: Trang ${page} | Kích cỡ ${size} | Tìm kiếm: "${search}" (${this.combineLatestVm.displayRange})`
      );
    });
  }

  onPageChange(delta: number): void {
    const next = this.currentPage + delta;
    if (next >= 1 && next <= Math.ceil(this.totalCount / this.currentSize)) {
      this.currentPage = next;
      this.page$.next(this.currentPage);
    }
  }

  onSizeChange(newSize: number): void {
    this.currentSize = newSize;
    this.currentPage = 1;
    this.size$.next(this.currentSize);
    this.page$.next(this.currentPage);
  }

  onSearchChange(): void {
    this.search$.next(this.searchTerm);
  }

  // ============================================================================
  // 2. DEMO: zip() vs concat() vs merge()
  // ============================================================================
  runZipDemo(): void {
    this.zipResults = [];
    this.addLog(
      'INFO',
      'zip()',
      'Ghép theo cặp chỉ mục: age$ (29, 28, 30), name$ ("Chau", "Trung", "Tiep"), isAdmin$ (true, false, true)'
    );

    // Theo ví dụ từ docs Day 23
    const age$ = of(29, 28, 30);
    const name$ = of('Chau', 'Trung', 'Tiep');
    const isAdmin$ = of(true, false, true);

    zip(age$, name$, isAdmin$)
      .pipe(map(([age, name, isAdmin]) => ({ age, name, isAdmin })))
      .subscribe({
        next: (tuple) => {
          this.zipResults.push(tuple);
          this.addLog('NEXT', 'zip()', `Ghép bộ # : ${JSON.stringify(tuple)}`);
        },
        complete: () => {
          this.addLog('COMPLETE', 'zip()', 'Hoàn tất zip! Các phần tử ghép thành công theo đúng thứ tự.');
        },
      });
  }

  runConcatOrMergeDemo(mode: 'concat' | 'merge'): void {
    this.streamSub?.unsubscribe();
    this.concatMergeMode = mode;
    this.streamExecutionItems = [];
    this.isStreamRunning = true;

    this.addLog(
      'INFO',
      `${mode}()`,
      mode === 'concat'
        ? 'concat(): Stream A (500ms x 3) chạy tuần tự XONG thì Stream B (300ms x 3) mới bắt đầu!'
        : 'merge(): Cả Stream A và Stream B chạy SONG SONG đồng thời, tín hiệu nào đến trước emit trước!'
    );

    // Stream A: phát A1, A2, A3 mỗi 500ms
    const streamA$ = interval(500).pipe(
      take(3),
      map((x) => ({ streamName: 'Stream A (500ms)', value: `A#${x + 1}` }))
    );

    // Stream B: phát B1, B2, B3 mỗi 300ms
    const streamB$ = interval(300).pipe(
      take(3),
      map((x) => ({ streamName: 'Stream B (300ms)', value: `B#${x + 1}` }))
    );

    const combined$ = mode === 'concat' ? concat(streamA$, streamB$) : merge(streamA$, streamB$);

    this.streamSub = combined$.subscribe({
      next: (item) => {
        this.streamExecutionItems.push({
          id: this.streamExecutionItems.length + 1,
          streamName: item.streamName,
          value: item.value,
          time: new Date().toLocaleTimeString(),
        });
        this.addLog('NEXT', `${mode}()`, `[${item.streamName}] Emit: ${item.value}`);
      },
      complete: () => {
        this.isStreamRunning = false;
        this.addLog('COMPLETE', `${mode}()`, `Chuỗi stream ${mode} đã hoàn tất.`);
      },
    });
  }

  // ============================================================================
  // 3. DEMO: race()
  // ============================================================================
  openRaceAlertBanner(): void {
    this.raceSub?.unsubscribe();
    this.isBannerVisible = true;
    this.bannerWinner = '';

    this.addLog(
      'RACE',
      'race()',
      'Banner mở! Cuộc đua (race) giữa 3 ứng viên: (1) Hẹn giờ tắt sau 5s, (2) User bấm nút đóng, (3) Chuyển trang!'
    );

    // Theo docs Day 23:
    // race(timer(5000), this.userClick$, this.navigate$).subscribe(...)
    const autoCloseTimer$ = timer(5000).pipe(map(() => '⏱️ Hết thời gian 5 giây (Auto Timer)'));
    const userClickClose$ = this.bannerUserClose$.asObservable();
    const navigateAway$ = this.bannerNavigate$.asObservable();

    this.raceSub = race(autoCloseTimer$, userClickClose$, navigateAway$).subscribe({
      next: (winner) => {
        this.bannerWinner = winner;
        this.isBannerVisible = false;
        this.addLog(
          'RACE',
          'race()',
          `🏆 CHIẾN THẮNG CUỘC ĐUA: "${winner}". Banner đã đóng ngay lập tức, các ứng viên còn lại bị hủy bỏ!`
        );
      },
    });
  }

  triggerUserCloseBanner(): void {
    this.bannerUserClose$.next('🖱️ Người dùng bấm nút "Đóng Banner"');
  }

  triggerNavigateAway(): void {
    this.bannerNavigate$.next('🚀 Người dùng chuyển sang trang khác (Navigation)');
  }

  // ============================================================================
  // 4. DEMO: Pipeable Operators (withLatestFrom, startWith, endWith, pairwise)
  // ============================================================================
  private setupExchangeRateTicker(): void {
    // Mock live fluctuating exchange rate
    this.liveExchangeRateSub = interval(2000).subscribe(() => {
      const delta = (Math.random() - 0.5) * 50;
      this.liveExchangeRate = Math.round(this.liveExchangeRate + delta);
    });
  }

  submitOrderWithLatestRate(): void {
    // Theo docs Day 23: Outer Observable (button click) kết hợp withLatestFrom(inner Observable)
    const amountUsd = 100;
    const currentRate = this.liveExchangeRate;
    const totalVnd = amountUsd * currentRate;

    this.orderSubmissionLogs.unshift({
      orderId: this.orderCounter++,
      amountUsd,
      rate: currentRate,
      totalVnd,
    });
    if (this.orderSubmissionLogs.length > 5) this.orderSubmissionLogs.pop();

    this.addLog(
      'NEXT',
      'withLatestFrom()',
      `Đặt hàng #${this.orderCounter - 1}: $${amountUsd} USD x Tỷ giá thời gian thực ${currentRate.toLocaleString('vi-VN')} VND = ${totalVnd.toLocaleString('vi-VN')} VND`
    );
  }

  runStartWithEndWithDemo(): void {
    this.productSub?.unsubscribe();
    this.productStreamState = 'LOADING';
    this.productStreamItems = [];

    this.addLog(
      'INFO',
      'startWith & endWith',
      'Khởi chạy stream sản phẩm: startWith(["[Đang tải sản phẩm...]"]) phát ngay lập tức, endWith(["[Hết danh mục]"]) phát khi complete!'
    );

    // Stream gốc delay 800ms
    const products$ = of('MacBook Pro M3', 'iPhone 16 Pro', 'iPad Air').pipe(delay(800));

    this.productSub = products$
      .pipe(
        startWith('⏳ [startWith]: Đang chuẩn bị danh mục hàng...'),
        endWith('🏁 [endWith]: Đã tải hết tất cả sản phẩm.')
      )
      .subscribe({
        next: (item) => {
          this.productStreamItems.push(item);
          this.addLog('NEXT', 'startWith/endWith', item);
        },
        complete: () => {
          this.productStreamState = 'COMPLETED';
          this.addLog('COMPLETE', 'startWith/endWith', 'Stream sản phẩm hoàn tất!');
        },
      });
  }

  updateStockPrice(delta: number): void {
    const nextPrice = Math.max(10, this.stockPrice + delta);

    // pairwise(): ghép [giá trước, giá mới]
    from([[this.stockPrice, nextPrice]]).subscribe(([prev, curr]) => {
      const diff = curr - prev;
      const trend = diff > 0 ? 'UP' : diff < 0 ? 'DOWN' : 'EQUAL';
      this.pairwiseDeltas.unshift({ prev, curr, diff, trend });
      if (this.pairwiseDeltas.length > 5) this.pairwiseDeltas.pop();

      this.addLog(
        'PAIR',
        'pairwise()',
        `Cặp [trước, sau]: $${prev} ➡️ $${curr} (Biến động: ${diff > 0 ? '+' : ''}${diff})`
      );
    });

    this.stockPrice = nextPrice;
  }

  // ============================================================================
  // ACTIVITY LOGGER HELPER
  // ============================================================================
  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    type: 'NEXT' | 'COMPLETE' | 'RACE' | 'PAIR' | 'INFO',
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
