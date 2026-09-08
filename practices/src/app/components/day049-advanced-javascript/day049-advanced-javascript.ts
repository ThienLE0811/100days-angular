import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export type TabId =
  | 'event-loop'
  | 'async-generator'
  | 'closure-memory'
  | 'this-prototype'
  | 'proxy-reactivity'
  | 'cheatsheet';

export interface LogEntry {
  id: number;
  time: string;
  type: 'info' | 'microtask' | 'macrotask' | 'stack' | 'warn' | 'success' | 'error';
  label: string;
  message: string;
}

export interface QueueItem {
  id: number;
  label: string;
  type: 'microtask' | 'macrotask' | 'stack';
}

export interface GeneratorStep {
  step: number;
  yielded: any;
  done: boolean;
  description: string;
}

export interface ClosureState {
  isLeaking: boolean;
  closureRef: number[] | null;
  arraySize: number;
  listenerCount: number;
}

export interface ThisResult {
  mode: string;
  thisValue: string;
  result: string;
  explanation: string;
}

export interface ProxyLog {
  id: number;
  trap: 'get' | 'set' | 'has' | 'delete';
  prop: string;
  value?: string;
  time: string;
}

export interface CheatsheetRow {
  problem: string;
  solution: string;
  category: string;
  badge: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

@Component({
  selector: 'app-day049-advanced-javascript',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day049-advanced-javascript.html',
  styleUrl: './day049-advanced-javascript.scss',
})
export class Day049AdvancedJavascript implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private isDestroyed = false;

  activeTab: TabId = 'event-loop';

  // ── Activity Log ──────────────────────────────────────────────────────────
  logs: LogEntry[] = [];
  private logId = 1;

  // ============================================================================
  // TAB 1: Event Loop Visualizer
  // ============================================================================
  callStack: QueueItem[] = [];
  microtaskQueue: QueueItem[] = [];
  macrotaskQueue: QueueItem[] = [];
  selectedScenario: 'basic' | 'nested-promise' | 'mixed' | 'zone-angular' = 'basic';
  readonly scenarioKeys: Array<'basic' | 'nested-promise' | 'mixed' | 'zone-angular'> =
    ['basic', 'nested-promise', 'mixed', 'zone-angular'];
  isEventLoopRunning = false;
  private itemId = 1;
  eventLoopStepLog: string[] = [];

  readonly eventLoopScenarios: Record<string, { label: string; description: string; code: string }> = {
    basic: {
      label: 'Basic Async',
      description: 'setTimeout (Macrotask) vs Promise.then (Microtask)',
      code: `console.log('1 - Sync');\nsetTimeout(() => console.log('2 - Macro'), 0);\nPromise.resolve().then(() => console.log('3 - Micro'));\nconsole.log('4 - Sync');`
    },
    'nested-promise': {
      label: 'Nested Promises',
      description: 'Microtask trong Microtask — tất cả đều hoàn thành trước Macrotask',
      code: `setTimeout(() => console.log('A - Macro'), 0);\nPromise.resolve()\n  .then(() => {\n    console.log('B - Micro 1');\n    return Promise.resolve();\n  })\n  .then(() => console.log('C - Micro 2'));\nconsole.log('D - Sync');`
    },
    mixed: {
      label: 'Mixed Real-world',
      description: 'async/await + setTimeout + Promise — thứ tự thực tế trong Angular service',
      code: `async function fetchData() {\n  console.log('1 - Start fetch');\n  await Promise.resolve();\n  console.log('3 - After await');\n}\nfetchData();\nconsole.log('2 - After call');\nsetTimeout(() => console.log('4 - Macro'), 0);`
    },
    'zone-angular': {
      label: 'Zone.js / Angular CD',
      description: 'Zone.js patch setTimeout để kích hoạt Change Detection',
      code: `// Zone.js patch setTimeout:\nconst realSetTimeout = setTimeout;\nsetTimeout = (fn, delay) => {\n  return realSetTimeout(() => {\n    fn();\n    // zone.onMicrotaskEmpty.emit() — kích hoạt CD\n    console.log('[Zone] Trigger Change Detection!');\n  }, delay);\n};\nsetTimeout(() => console.log('Callback ran'), 100);`
    }
  };

  async runEventLoopSimulation(): Promise<void> {
    if (this.isEventLoopRunning) return;
    this.isEventLoopRunning = true;
    this.callStack = [];
    this.microtaskQueue = [];
    this.macrotaskQueue = [];
    this.eventLoopStepLog = [];
    this.triggerRender();

    const log = (msg: string) => {
      if (this.isDestroyed) return;
      this.eventLoopStepLog.push(msg);
      this.addLog('stack', 'Event Loop', msg);
      this.triggerRender();
    };

    const addToStack = async (label: string, type: QueueItem['type'] = 'stack') => {
      if (this.isDestroyed) return null;
      const item: QueueItem = { id: this.itemId++, label, type };
      this.callStack.unshift(item);
      this.triggerRender();
      await this.delay(400);
      return item;
    };

    const popStack = async () => {
      if (this.isDestroyed) return;
      await this.delay(300);
      if (this.isDestroyed) return;
      this.callStack.shift();
      this.triggerRender();
    };

    const addMicrotask = async (label: string) => {
      if (this.isDestroyed) return;
      const item: QueueItem = { id: this.itemId++, label, type: 'microtask' };
      this.microtaskQueue.push(item);
      this.addLog('microtask', 'Microtask Queue', `Enqueue: ${label}`);
      this.triggerRender();
      await this.delay(200);
    };

    const addMacrotask = async (label: string) => {
      if (this.isDestroyed) return;
      const item: QueueItem = { id: this.itemId++, label, type: 'macrotask' };
      this.macrotaskQueue.push(item);
      this.addLog('macrotask', 'Macrotask Queue', `Enqueue: ${label}`);
      this.triggerRender();
      await this.delay(200);
    };

    const drainMicrotasks = async () => {
      while (this.microtaskQueue.length > 0 && !this.isDestroyed) {
        const task = this.microtaskQueue.shift()!;
        this.triggerRender();
        await addToStack(task.label, 'microtask');
        log(`✅ Microtask: ${task.label}`);
        await popStack();
      }
    };

    switch (this.selectedScenario) {
      case 'basic':
        log('▶ Script starts...');
        await addToStack("console.log('1 - Sync')");
        log("📢 Output: '1 - Sync'");
        await popStack();

        await addToStack('setTimeout(fn, 0)');
        log('⏱ setTimeout → Web API → Macrotask Queue');
        await addMacrotask("setTimeout cb: '2 - Macro'");
        await popStack();

        await addToStack('Promise.resolve().then(fn)');
        log('⚡ Promise.then → Microtask Queue');
        await addMicrotask("Promise.then: '3 - Micro'");
        await popStack();

        await addToStack("console.log('4 - Sync')");
        log("📢 Output: '4 - Sync'");
        await popStack();

        log('🔄 Call Stack trống — xử lý Microtask Queue...');
        await drainMicrotasks();
        log("📢 Output: '3 - Micro'");

        log('🔄 Microtask Queue trống — lấy Macrotask...');
        const macro1 = this.macrotaskQueue.shift();
        if (macro1) {
          this.triggerRender();
          await addToStack(macro1.label, 'macrotask');
          log("📢 Output: '2 - Macro'");
          await popStack();
        }
        log('✅ Hoàn tất! Thứ tự: 1-Sync → 4-Sync → 3-Micro → 2-Macro');
        break;

      case 'nested-promise':
        log('▶ Script starts...');
        await addToStack('setTimeout(fn, 0)');
        await addMacrotask("Macro: 'A'");
        await popStack();

        await addToStack('Promise chain setup');
        await addMicrotask("Micro 1: log('B')");
        await popStack();

        await addToStack("console.log('D - Sync')");
        log("📢 Output: 'D - Sync'");
        await popStack();

        log('🔄 Xử lý Microtask Queue...');
        const micro1 = this.microtaskQueue.shift();
        if (micro1) {
          this.triggerRender();
          await addToStack(micro1.label, 'microtask');
          log("📢 Output: 'B - Micro 1'");
          await addMicrotask("Micro 2: log('C')");
          await popStack();
        }
        await drainMicrotasks();
        log("📢 Output: 'C - Micro 2'");

        log('🔄 Lấy Macrotask...');
        const macroA = this.macrotaskQueue.shift();
        if (macroA) {
          this.triggerRender();
          await addToStack(macroA.label, 'macrotask');
          log("📢 Output: 'A - Macro'");
          await popStack();
        }
        log('✅ Thứ tự: D → B → C → A');
        break;

      case 'zone-angular':
        log('▶ Script starts with Zone.js...');
        await addToStack('setTimeout(fn, 100) via Zone patch');
        log('⏱ Zone intercepts setTimeout → registers scheduled task');
        await addMacrotask("Callback: console.log('Ran')");
        await popStack();

        await addToStack("console.log('App running')");
        log("📢 Output: 'App running'");
        await popStack();

        log('🔄 Macrotask timer fires → Callback executes...');
        const macroZ = this.macrotaskQueue.shift();
        if (macroZ) {
          this.triggerRender();
          await addToStack(macroZ.label, 'macrotask');
          log("📢 Output: 'Callback ran'");
          log('⚡ [Zone.js] onMicrotaskEmpty.emit() → Trigger Change Detection!');
          await popStack();
        }
        log('✅ Zone.js tự động cập nhật UI sau khi async callback kết thúc');
        break;

      default:
        log('▶ Mô phỏng đang chạy...');
        await addToStack('async fetchData()');
        log("📢 '1 - Start fetch'");
        await addMicrotask("await resolves: '3 - After await'");
        await popStack();

        await addToStack("console.log('2 - After call')");
        log("📢 '2 - After call'");
        await popStack();

        await addToStack('setTimeout(fn, 0)');
        await addMacrotask("Macro: '4 - Macro'");
        await popStack();

        log('🔄 Microtask Queue...');
        await drainMicrotasks();
        log("📢 '3 - After await'");

        const macroD = this.macrotaskQueue.shift();
        if (macroD) {
          this.triggerRender();
          await addToStack(macroD.label, 'macrotask');
          log("📢 '4 - Macro'");
          await popStack();
        }
        log('✅ Thứ tự: 1 → 2 → 3 → 4');
    }

    this.isEventLoopRunning = false;
    this.triggerRender();
  }

  // ============================================================================
  // TAB 2: Async / Generator Sandbox
  // ============================================================================
  generatorSteps: GeneratorStep[] = [];
  currentGenStep = -1;
  generatorMode: 'manual' | 'fibonacci' | 'infinite' = 'manual';
  private gen: Generator<any, any, any> | null = null;
  asyncCode = `async function example() {
  console.log('A - Before await');
  const result = await fetch('/api');
  console.log('C - After await');
  return result;
}
example();
console.log('B - After call');`;
  asyncStepLog: string[] = [];
  isAsyncRunning = false;

  initGenerator(): void {
    this.generatorSteps = [];
    this.currentGenStep = -1;
    this.addLog('info', 'Generator', `Khởi tạo Generator — mode: ${this.generatorMode}`);

    switch (this.generatorMode) {
      case 'manual':
        this.gen = this.manualGenerator();
        break;
      case 'fibonacci':
        this.gen = this.fibonacciGenerator();
        break;
      case 'infinite':
        this.gen = this.infiniteCounter();
        break;
    }
  }

  private *manualGenerator(): Generator {
    yield { value: 'Step 1: Giá trị đầu tiên', note: 'Generator dừng lại tại đây' };
    yield { value: 'Step 2: Giá trị thứ hai', note: 'Generator tiếp tục khi gọi .next()' };
    yield { value: 'Step 3: Giá trị cuối', note: 'Lần .next() tiếp theo trả về done: true' };
    return { value: 'Return value (done: true)', note: 'Generator đã hoàn thành' };
  }

  private *fibonacciGenerator(): Generator {
    let [a, b] = [0, 1];
    while (true) {
      yield a;
      [a, b] = [b, a + b];
    }
  }

  private *infiniteCounter(): Generator {
    let i = 0;
    while (true) {
      yield i++;
    }
  }

  nextGenStep(): void {
    if (!this.gen) this.initGenerator();
    const result = this.gen!.next();
    const step: GeneratorStep = {
      step: ++this.currentGenStep,
      yielded: typeof result.value === 'object' ? result.value?.value ?? result.value : result.value,
      done: result.done ?? false,
      description: typeof result.value === 'object' ? result.value?.note ?? '' : this.getGenDescription(result.done ?? false)
    };
    this.generatorSteps.push(step);
    this.addLog(result.done ? 'success' : 'info', 'Generator', `Step ${step.step}: yield ${JSON.stringify(step.yielded)} | done: ${step.done}`);

    if (result.done) {
      this.gen = null;
    }
  }

  private getGenDescription(done: boolean): string {
    return done ? 'Generator đã hoàn thành (done: true)' : 'Generator đang tạm dừng (done: false)';
  }

  async runAsyncDemo(): Promise<void> {
    if (this.isAsyncRunning) return;
    this.isAsyncRunning = true;
    this.asyncStepLog = [];
    this.triggerRender();

    const log = (msg: string) => {
      if (this.isDestroyed) return;
      this.asyncStepLog.push(msg);
      this.addLog('info', 'Async/Await', msg);
      this.triggerRender();
    };

    log('▶ Gọi async function example()');
    await this.delay(600);
    log("📢 'A - Before await' (đồng bộ, trong async fn)");
    await this.delay(600);
    log('⚡ Gặp `await` → Tạm dừng function, trả quyền về caller');
    await this.delay(600);
    log("📢 'B - After call' (caller tiếp tục chạy đồng bộ)");
    await this.delay(600);
    log('🔄 fetch() hoàn thành → Promise resolve → Microtask enqueue');
    await this.delay(600);
    log('⚡ Event Loop xử lý Microtask → Resume async function');
    await this.delay(600);
    log("📢 'C - After await' (tiếp tục sau await)");
    await this.delay(400);
    log('✅ Thứ tự: A → B → C (async/await = Generator + Promise dưới hood)');

    this.isAsyncRunning = false;
    this.triggerRender();
  }

  // ============================================================================
  // TAB 3: Closure & Memory Leak Lab
  // ============================================================================
  closureState: ClosureState = {
    isLeaking: false,
    closureRef: null,
    arraySize: 0,
    listenerCount: 0
  };
  closureLog: string[] = [];
  private leakyClosures: Array<() => void> = [];
  private fakeListenerCount = 0;

  createLeakyClosure(): void {
    const heavyArray = new Array(100000).fill({ data: 'memory-consuming-data' });
    const size = heavyArray.length;

    const leakyFn = () => {
      // Hàm này giữ reference đến heavyArray trong closure
      return heavyArray.length;
    };

    this.leakyClosures.push(leakyFn);
    this.fakeListenerCount++;

    this.closureState = {
      isLeaking: true,
      closureRef: new Array(size).fill(0), // Simulate reference
      arraySize: size * this.leakyClosures.length,
      listenerCount: this.fakeListenerCount
    };

    const msg = `⚠️ Tạo Closure #${this.leakyClosures.length} — Giữ array ${size.toLocaleString()} phần tử`;
    this.closureLog.push(msg);
    this.addLog('warn', 'Memory Leak', msg);
  }

  cleanupClosures(): void {
    const count = this.leakyClosures.length;
    this.leakyClosures = [];
    this.fakeListenerCount = 0;
    this.closureState = {
      isLeaking: false,
      closureRef: null,
      arraySize: 0,
      listenerCount: 0
    };

    const msg = `✅ Dọn sạch ${count} closure — Bộ nhớ được giải phóng cho GC`;
    this.closureLog.push(msg);
    this.addLog('success', 'GC', msg);
  }

  demonstrateClosureBug(): void {
    this.closureLog.push('--- Demo cạm bẫy closure với var trong loop ---');
    this.addLog('warn', 'Closure Bug', 'Chạy demo var vs let trong vòng lặp');

    // Simulate the var bug
    const varResults: number[] = [];
    const letResults: number[] = [];

    // var bug simulation
    const varFns: Array<() => number> = [];
    for (var i = 0; i < 3; i++) {
      const captured = i; // phải capture để simulate
      varFns.push(() => captured); // In actual JS: all capture same `i`=3
    }
    // Explain the bug, not actually reproduce (since TS changes behavior)
    varResults.push(3, 3, 3); // What happens with `var` in browsers

    // let fix
    for (let j = 0; j < 3; j++) {
      letResults.push(j);
    }

    this.closureLog.push(`❌ var kết quả: [${varResults.join(', ')}] — Tất cả cùng giá trị cuối`);
    this.closureLog.push(`✅ let kết quả: [${letResults.join(', ')}] — Mỗi iteration scope riêng`);
    this.addLog('success', 'Closure', `var bug: [${varResults}] | let fix: [${letResults}]`);
  }

  // ============================================================================
  // TAB 4: `this` Binding & Prototype Playground
  // ============================================================================
  thisResults: ThisResult[] = [];
  prototypeChain: Array<{ level: string; props: string[] }> = [];

  runThisDemo(): void {
    this.thisResults = [];

    // Rule 1: Default binding
    this.thisResults.push({
      mode: 'Default Binding',
      thisValue: 'undefined (strict) / window (sloppy)',
      result: 'fn() — gọi hàm trực tiếp không qua object',
      explanation: '`this` mặc định là global object hoặc undefined trong strict mode'
    });

    // Rule 2: Implicit binding
    const obj = { name: 'Thien', greet() { return this.name; } };
    const implicitResult = obj.greet();
    this.thisResults.push({
      mode: 'Implicit Binding',
      thisValue: '{ name: "Thien", greet: fn }',
      result: `obj.greet() → "${implicitResult}"`,
      explanation: '`this` là object đứng trước dấu chấm khi gọi method'
    });

    // Rule 3: Explicit binding
    function greetFn(this: { name: string }) { return this.name; }
    const explicitResult = greetFn.call({ name: 'Explicit Thien' });
    this.thisResults.push({
      mode: 'Explicit Binding (call/apply/bind)',
      thisValue: '{ name: "Explicit Thien" }',
      result: `greet.call(user) → "${explicitResult}"`,
      explanation: '.call() / .apply() / .bind() ép buộc `this` về object chỉ định'
    });

    // Rule 4: Arrow function (lexical this)
    const component = {
      count: 42,
      getCountArrow: function() {
        const inner = () => this.count; // Arrow: lexical `this` = component
        return inner();
      },
      getCountRegular: function() {
        function inner(this: any) { return this?.count; }
        return inner(); // Regular: `this` mất → undefined
      }
    };
    this.thisResults.push({
      mode: 'Arrow Function (Lexical this)',
      thisValue: 'Kế thừa từ outer scope (component)',
      result: `Arrow → ${component.getCountArrow()} | Regular → ${component.getCountRegular() ?? 'undefined'}`,
      explanation: 'Arrow function không có `this` riêng — lý do dùng trong Angular callbacks'
    });

    this.buildPrototypeChain();
    this.addLog('success', 'this Binding', 'Chạy xong 4 quy tắc this binding');
  }

  private buildPrototypeChain(): void {
    this.prototypeChain = [
      {
        level: 'Dog instance (dog)',
        props: ['name: "Rex"', 'bark(): "Woof!"']
      },
      {
        level: 'Dog.prototype',
        props: ['constructor: Dog', 'fetch(): "Fetching..."']
      },
      {
        level: 'Animal.prototype',
        props: ['breathe(): "Breathing..."', 'eat(): "Eating..."']
      },
      {
        level: 'Object.prototype',
        props: ['toString()', 'hasOwnProperty()', 'valueOf()']
      },
      {
        level: 'null (end of chain)',
        props: ['— Không tìm thấy → undefined —']
      }
    ];
  }

  // ============================================================================
  // TAB 5: Proxy Reactivity Engine
  // ============================================================================
  proxyLogs: ProxyLog[] = [];
  proxyState: Record<string, any> = {};
  proxyInput = '';
  proxyKey = 'name';
  proxyValue = '';
  proxyCheckKey = '';
  proxyCheckResult: string | null = null;
  private proxyLogId = 1;
  private reactiveTarget: Record<string, any> = {};
  reactiveProxy!: Record<string, any>;

  initProxy(): void {
    this.proxyLogs = [];
    this.reactiveTarget = { name: 'Thien', age: 24, role: 'developer' };
    this.proxyState = { ...this.reactiveTarget };

    this.reactiveProxy = new Proxy(this.reactiveTarget, {
      get: (target, prop) => {
        const value = Reflect.get(target, prop);
        this.recordProxyLog('get', String(prop), String(value));
        return value;
      },
      set: (target, prop, value) => {
        const result = Reflect.set(target, prop, value);
        this.proxyState = { ...target };
        this.recordProxyLog('set', String(prop), String(value));
        return result;
      },
      has: (target, prop) => {
        const result = Reflect.has(target, prop);
        this.recordProxyLog('has', String(prop), String(result));
        return result;
      },
      deleteProperty: (target, prop) => {
        const result = Reflect.deleteProperty(target, prop);
        this.proxyState = { ...target };
        this.recordProxyLog('delete', String(prop));
        return result;
      }
    });

    this.addLog('success', 'Proxy', 'Khởi tạo Proxy với target: { name, age, role }');
  }

  private recordProxyLog(trap: ProxyLog['trap'], prop: string, value?: string): void {
    const now = new Date();
    this.proxyLogs.unshift({
      id: this.proxyLogId++,
      trap,
      prop,
      value,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    });
    if (this.proxyLogs.length > 20) this.proxyLogs.pop();
  }

  proxyGet(): void {
    if (!this.reactiveProxy) this.initProxy();
    const val = this.reactiveProxy[this.proxyKey];
    this.addLog('info', 'Proxy GET', `proxy.${this.proxyKey} → "${val}"`);
  }

  proxySet(): void {
    if (!this.reactiveProxy) this.initProxy();
    this.reactiveProxy[this.proxyKey] = this.proxyValue;
    this.addLog('info', 'Proxy SET', `proxy.${this.proxyKey} = "${this.proxyValue}"`);
  }

  proxyHas(): void {
    if (!this.reactiveProxy) this.initProxy();
    const result = this.proxyCheckKey in this.reactiveProxy;
    this.proxyCheckResult = `"${this.proxyCheckKey}" ${result ? 'TỒN TẠI' : 'KHÔNG TỒN TẠI'} trong proxy`;
    this.addLog('info', 'Proxy HAS', this.proxyCheckResult);
  }

  proxyDelete(): void {
    if (!this.reactiveProxy) this.initProxy();
    delete this.reactiveProxy[this.proxyKey];
    this.addLog('warn', 'Proxy DELETE', `Đã xóa proxy.${this.proxyKey}`);
  }

  // ============================================================================
  // TAB 6: Cheatsheet
  // ============================================================================
  readonly cheatsheetRows: CheatsheetRow[] = [
    { problem: 'UI bị giật sau async operation', solution: 'NgZone.runOutsideAngular() cho tác vụ không cần CD', category: 'Performance', badge: 'badge-warn' },
    { problem: 'Memory tăng dần khi navigate', solution: 'Kiểm tra unsubscribed Observables & Event Listeners', category: 'Memory', badge: 'badge-danger' },
    { problem: '`this` là undefined trong callback', solution: 'Dùng Arrow Function hoặc .bind(this)', category: 'this', badge: 'badge-info' },
    { problem: 'var trong loop cho kết quả sai', solution: 'Dùng `let` — mỗi iteration có block scope riêng', category: 'Closure', badge: 'badge-warn' },
    { problem: 'Bundle size quá lớn', solution: 'Dynamic import() + Pure ESM + kiểm tra circular deps', category: 'Module', badge: 'badge-primary' },
    { problem: 'Cần reactive state đơn giản', solution: 'Angular Signals: signal(), computed(), effect()', category: 'Reactivity', badge: 'badge-success' },
    { problem: 'Lưu metadata cho DOM element', solution: 'WeakMap — GC tự dọn khi element bị remove', category: 'Memory', badge: 'badge-danger' },
    { problem: 'Hàm tính toán nặng gọi nhiều lần', solution: 'Memoize function hoặc pure: true Pipe', category: 'Performance', badge: 'badge-warn' },
    { problem: 'HTTP request bị gọi nhiều lần', solution: 'shareReplay({ bufferSize: 1, refCount: true })', category: 'RxJS', badge: 'badge-primary' },
    { problem: 'Promise vs setTimeout thứ tự khó đoán', solution: 'Promise → Microtask (ưu tiên cao hơn Macrotask)', category: 'Event Loop', badge: 'badge-info' },
    { problem: 'Composition nhiều hàm biến đổi data', solution: 'pipe() / compose() — nền tảng của RxJS operators', category: 'FP', badge: 'badge-success' },
    { problem: 'Tree-shaking không hoạt động', solution: 'Dùng ESM, tránh side-effects, kiểm tra sideEffects field', category: 'Module', badge: 'badge-primary' }
  ];

  selectedCategory = 'all';

  get filteredCheatsheet(): CheatsheetRow[] {
    if (this.selectedCategory === 'all') return this.cheatsheetRows;
    return this.cheatsheetRows.filter(r => r.category === this.selectedCategory);
  }

  readonly categories = ['all', 'Performance', 'Memory', 'this', 'Closure', 'Module', 'Reactivity', 'RxJS', 'Event Loop', 'FP'];

  // ============================================================================
  // CODE SNIPPETS (stored in TS to avoid Angular template parser issues with { })
  // ============================================================================
  readonly codeAsyncVsGen = `// Bạn viết:
async function fetch() {
  const data = await api();
  return data;
}

// Runtime hiểu (tương đương Generator):
function* fetch() {
  const data = yield api();
  return data;
}
// + Promise runner engine`;

  readonly codeAsyncLeft = `async function fetch() {
  const data = await api();
  return data;
}`;

  readonly codeAsyncRight = `function* fetch() {
  const data = yield api();
  return data;
}
// + Promise runner engine`;

  readonly codeClosureLeak = `// ❌ Memory Leak Pattern
function badComponent() {
  const HUGE_DATA = new Array(1_000_000).fill(0);

  window.addEventListener('click', function handler() {
    // handler giữ closure reference đến HUGE_DATA
    // Dù không dùng, HUGE_DATA không thể GC được!
    console.log('clicked');
  });
  // Không gọi removeEventListener -> LEAK
}

// ✅ Fixed Pattern
function goodComponent() {
  const HUGE_DATA = new Array(1_000_000).fill(0);

  const handler = () => console.log('clicked');
  window.addEventListener('click', handler);

  return () => window.removeEventListener('click', handler); // cleanup fn
}`;

  readonly codeArrowThis = `@Component({ ... })
export class TimerComponent implements OnInit {
  count = 0;

  ngOnInit() {
    // ✅ Arrow function — \`this\` là component instance
    setInterval(() => {
      this.count++;  // \`this\` = TimerComponent OK
    }, 1000);

    // ❌ Regular function — \`this\` mất ngữ cảnh
    setInterval(function() {
      this.count++;  // \`this\` = undefined hoặc window
    }, 1000);
  }
}`;

  readonly codeSignalProxy = `// Angular Signals dùng cơ chế tương tự Proxy:
const count = signal(0); // Bọc trong reactive wrapper

// Khi bạn đọc count() trong effect/computed:
effect(() => {
  console.log(count()); // -> "track" dependency
});
// -> count() kích hoạt getter -> ghi nhận effect là "subscriber"

count.set(1); // -> "trigger" -> notify tất cả subscribers -> chạy lại effect`;

  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  ngOnInit(): void {
    this.addLog('info', 'System', '🚀 Day049 Advanced JavaScript Lab khởi động!');
    this.addLog('info', 'System', '📚 Chọn tab để bắt đầu khám phá từng chủ đề');
    this.initProxy();
    this.buildPrototypeChain();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.isEventLoopRunning = false;
    this.isAsyncRunning = false;
    this.leakyClosures = [];
  }

  // ============================================================================
  // SHARED HELPERS
  // ============================================================================
  setTab(tab: TabId): void {
    this.activeTab = tab;
  }

  setScenario(s: string): void {
    this.selectedScenario = s as 'basic' | 'nested-promise' | 'mixed' | 'zone-angular';
  }

  clearLogs(): void {
    this.logs = [];
    this.triggerRender();
  }

  private triggerRender(): void {
    if (!this.isDestroyed) {
      try {
        this.cdr.detectChanges();
      } catch {
        // Safe fallback in case CD is already running or component destroyed
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private addLog(
    type: LogEntry['type'],
    label: string,
    message: string
  ): void {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    this.logs.unshift({ id: this.logId++, time, type, label, message });
    if (this.logs.length > 50) this.logs.pop();
    this.triggerRender();
  }

  getLogClass(type: LogEntry['type']): string {
    const map: Record<string, string> = {
      info: 'log-info',
      microtask: 'log-micro',
      macrotask: 'log-macro',
      stack: 'log-stack',
      warn: 'log-warn',
      success: 'log-success',
      error: 'log-error'
    };
    return map[type] ?? 'log-info';
  }

  getTrapClass(trap: ProxyLog['trap']): string {
    const map: Record<string, string> = {
      get: 'trap-get', set: 'trap-set', has: 'trap-has', delete: 'trap-delete'
    };
    return map[trap] ?? 'trap-get';
  }

  getTrapIcon(trap: ProxyLog['trap']): string {
    const map: Record<string, string> = {
      get: '📖', set: '✏️', has: '🔍', delete: '🗑️'
    };
    return map[trap] ?? '❓';
  }

  getProxyStateKeys(): string[] {
    return Object.keys(this.proxyState);
  }
}
