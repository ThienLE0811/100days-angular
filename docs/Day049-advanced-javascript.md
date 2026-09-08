# Day 49: JavaScript Nâng Cao — Hiểu Sâu Runtime Engine

## Mục lục

1. [Event Loop, Concurrency Model & Task Queues](#1-event-loop-concurrency-model--task-queues)
2. [Execution Context, Closures & Memory Management](#2-execution-context-closures--memory-management)
3. [`this` Keyword & Prototype Chain](#3-this-keyword--prototype-chain)
4. [Async/Await Internals & Generator/Iterator Protocol](#4-asyncawait-internals--generatoriterator-protocol)
5. [Property Descriptors & Decorator Mechanism](#5-property-descriptors--decorator-mechanism)
6. [Functional Programming: Currying, Composition & Memoization](#6-functional-programming-currying-composition--memoization)
7. [ESM Module System Internals](#7-esm-module-system-internals)
8. [Metaprogramming với Proxy & Reflect](#8-metaprogramming-với-proxy--reflect)
9. [WeakMap, WeakSet & Memory Safety](#9-weakmap-weakset--memory-safety)
10. [Quick Decision Guide & Câu hỏi phỏng vấn Senior](#10-quick-decision-guide--câu-hỏi-phỏng-vấn-senior)

---

## 1. Event Loop, Concurrency Model & Task Queues

### JavaScript là Single-threaded

JavaScript chỉ có **một Call Stack duy nhất**, tức là tại bất kỳ thời điểm nào nó chỉ thực thi được một đoạn code. Vậy tại sao `setTimeout`, HTTP request, hay animation lại không block UI? Đó là nhờ **Event Loop**.

### Mô hình Concurrency

```
┌─────────────────────────────────────────────────────────┐
│                    JavaScript Runtime                    │
│                                                         │
│  ┌──────────────┐     ┌─────────────────────────────┐  │
│  │  Call Stack  │     │          Web APIs            │  │
│  │              │     │  setTimeout, fetch, DOM      │  │
│  │ main()       │     │  Events, requestAnimFrame    │  │
│  │ greet()      │     └──────────────┬──────────────┘  │
│  │ console.log  │                    │                  │
│  └──────────────┘                    ▼                  │
│                         ┌────────────────────────────┐  │
│                         │     Microtask Queue        │  │
│  ┌─────────────┐        │  Promise.then, queueMicro  │  │
│  │ Event Loop  │◄───────│  task, MutationObserver    │  │
│  └─────────────┘        ├────────────────────────────┤  │
│         │               │     Macrotask Queue        │  │
│         └──────────────►│  setTimeout, setInterval   │  │
│                         │  I/O callbacks, UI render  │  │
│                         └────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Thứ tự xử lý trong một Tick (vòng lặp Event Loop)

```
1. Lấy 1 Macrotask từ Macrotask Queue (nếu có)
   ↓
2. Thực thi Macrotask đó → đẩy vào Call Stack → chạy đến hết
   ↓
3. Xử lý TOÀN BỘ Microtask Queue (đến khi trống hoàn toàn)
   ↓
4. Render lại UI nếu cần (browser rendering step)
   ↓
5. Quay lại bước 1
```

> ⚠️ **Điểm mấu chốt**: Microtask Queue **luôn được xử lý hết** trước khi sang Macrotask tiếp theo. Nếu bạn queue quá nhiều microtask trong microtask (đệ quy Promise), UI sẽ bị **block hoàn toàn**.

### Ví dụ minh họa thứ tự thực thi

```typescript
console.log('1 - Synchronous');

setTimeout(() => console.log('2 - Macrotask (setTimeout 0ms)'), 0);

Promise.resolve().then(() => {
  console.log('3 - Microtask (Promise.then)');
  Promise.resolve().then(() => console.log('4 - Nested Microtask'));
});

queueMicrotask(() => console.log('5 - Microtask (queueMicrotask)'));

console.log('6 - Synchronous');

// Output theo thứ tự:
// 1 - Synchronous
// 6 - Synchronous
// 3 - Microtask (Promise.then)
// 4 - Nested Microtask
// 5 - Microtask (queueMicrotask)
// 2 - Macrotask (setTimeout 0ms)
```

### Liên hệ với Angular

Angular sử dụng **Zone.js** để monkey-patch các Web APIs (setTimeout, fetch, addEventListener...) nhằm tự động kích hoạt Change Detection sau mỗi async operation.

```typescript
// Zone.js patch setTimeout:
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(fn, delay) {
  return originalSetTimeout(() => {
    fn(); // Chạy callback gốc
    zone.onMicrotaskEmpty.emit(); // Kích hoạt Angular CD
  }, delay);
};
```

**Angular Zoneless (v17+)**: Thay vì Zone.js, Angular hiện đại dùng Microtask-based scheduling thông qua Signals để chỉ cập nhật đúng phần UI thay đổi:

```typescript
// Zoneless - chỉ update khi Signal thay đổi, không cần patch toàn bộ
const count = signal(0);
effect(() => console.log(count())); // reactive, không cần Zone.js
```

---

## 2. Execution Context, Closures & Memory Management

### Execution Context là gì?

Mỗi khi JavaScript thực thi một hàm, nó tạo ra một **Execution Context** mới được đẩy vào Call Stack. Context này gồm:

- **Variable Environment**: Lưu trữ biến và khai báo hàm.
- **Lexical Environment**: Tham chiếu đến Scope cha (Scope Chain).
- **`this` binding**: Giá trị `this` trong context này.

```typescript
// Quá trình tạo Execution Context có 2 phase:

// --- CREATION PHASE ---
// Hoisting xảy ra ở đây
// var → undefined (hoisted)
// function declarations → hoisted hoàn toàn
// let/const → Temporal Dead Zone (TDZ), không dùng được trước khi khai báo

console.log(x); // undefined (var hoisted)
// console.log(y); // ReferenceError: Cannot access 'y' before initialization (TDZ)

var x = 10;
let y = 20;

// --- EXECUTION PHASE ---
// Gán giá trị thực sự, chạy code từng dòng
```

### Scope Chain & Closure

**Closure** là một hàm "ghi nhớ" môi trường Lexical nơi nó được tạo ra, ngay cả khi hàm đó được gọi ở nơi khác.

```typescript
function makeCounter() {
  let count = 0;          // Biến trong môi trường của makeCounter

  return {
    increment() {
      count++;            // "Nhớ" tham chiếu đến count trong outer scope
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = makeCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
// Hàm makeCounter đã return, nhưng `count` vẫn còn sống trong closure!
```

> 🔑 **Closure giữ REFERENCE, không phải VALUE**. Đây là cạm bẫy phổ biến:

```typescript
// BUG phổ biến với closure trong vòng lặp
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // In ra: 3 3 3 (không phải 0 1 2!)
}

// FIX 1: Dùng let (mỗi iteration có scope riêng)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0 1 2 ✅
}

// FIX 2: IIFE để tạo scope mới
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 0))(i); // 0 1 2 ✅
}
```

### Memory Leak trong SPA — Các cạm bẫy thực tế

#### Cạm bẫy 1: Event Listener không được gỡ bỏ

```typescript
// ❌ Memory leak: component bị destroy nhưng listener vẫn giữ reference đến component
@Component({ ... })
export class BadComponent implements OnInit {
  ngOnInit() {
    window.addEventListener('resize', this.onResize.bind(this)); // Leak!
  }
  // Không có ngOnDestroy → listener không bao giờ bị remove
}

// ✅ Đúng
@Component({ ... })
export class GoodComponent implements OnInit, OnDestroy {
  private resizeHandler = this.onResize.bind(this);

  ngOnInit() {
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler); // Dọn sạch
  }
}
```

#### Cạm bẫy 2: Observable chưa unsubscribe

```typescript
// ❌ Memory leak
@Component({ ... })
export class BadComponent {
  ngOnInit() {
    interval(1000).subscribe(val => console.log(val)); // Không bao giờ dừng!
  }
}

// ✅ Đúng — dùng takeUntilDestroyed (Angular 16+)
@Component({ ... })
export class GoodComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => console.log(val));
  }
}
```

### Garbage Collection — Mark and Sweep

JavaScript dùng thuật toán **Mark-and-Sweep**:

1. GC bắt đầu từ **root** (biến global, Call Stack hiện tại).
2. **Mark**: Đánh dấu tất cả object reachable từ root.
3. **Sweep**: Xóa toàn bộ object không được đánh dấu.

```typescript
let user = { name: 'Thien' }; // Object được tạo, user là reference

let admin = user;               // 2 references đến cùng object

user = null;                    // Object vẫn sống vì admin còn trỏ đến nó

admin = null;                   // Bây giờ không còn reference nào → GC có thể thu hồi
```

---

## 3. `this` Keyword & Prototype Chain

### 4 Quy tắc xác định `this`

#### Quy tắc 1: Default Binding

```typescript
function greet() {
  console.log(this); // window (browser) hoặc global (Node) | undefined (strict mode)
}
greet();
```

#### Quy tắc 2: Implicit Binding

```typescript
const user = {
  name: 'Thien',
  greet() {
    console.log(this.name); // 'Thien' — `this` là object gọi method
  }
};
user.greet(); // ✅ Thien

const fn = user.greet; // Lấy reference ra
fn(); // ❌ undefined — mất implicit binding!
```

#### Quy tắc 3: Explicit Binding — `call`, `apply`, `bind`

```typescript
function greet(greeting: string) {
  return `${greeting}, ${this.name}!`;
}

const user = { name: 'Thien' };

greet.call(user, 'Hello');        // 'Hello, Thien!' — gọi ngay, truyền args riêng lẻ
greet.apply(user, ['Hello']);      // 'Hello, Thien!' — gọi ngay, truyền args dạng array
const boundGreet = greet.bind(user); // Tạo function mới với `this` cố định
boundGreet('Hi');                  // 'Hi, Thien!'
```

#### Quy tắc 4: `new` Binding

```typescript
function Person(name: string) {
  // `this` là object mới được tạo bởi `new`
  this.name = name;
}

const p = new Person('Thien');
console.log(p.name); // 'Thien'
```

#### Arrow Function — Lexical `this`

Arrow function **không tạo `this` của riêng mình** mà kế thừa từ lexical scope bao quanh:

```typescript
@Component({ ... })
export class TimerComponent implements OnInit, OnDestroy {
  count = 0;
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    // ✅ Arrow function — `this` là component instance
    this.timer = setInterval(() => {
      this.count++;           // `this` đúng!
    }, 1000);

    // ❌ Regular function — `this` sẽ là undefined (strict mode)
    // this.timer = setInterval(function() {
    //   this.count++;         // TypeError!
    // }, 1000);
  }
}
```

### Prototype Chain

Mọi object trong JavaScript đều có một **hidden link** `[[Prototype]]` trỏ đến object cha:

```typescript
const animal = {
  breathe() { return 'Breathing...'; }
};

const dog = Object.create(animal); // dog.[[Prototype]] = animal
dog.bark = function() { return 'Woof!'; };

console.log(dog.bark());    // 'Woof!' — tìm thấy trên dog
console.log(dog.breathe()); // 'Breathing...' — tra lên [[Prototype]] → tìm thấy trên animal
console.log(dog.toString()); // '[object Object]' — tra lên Object.prototype
// dog → animal → Object.prototype → null
```

**ES6 class là syntactic sugar** của prototype:

```typescript
class Animal {
  breathe() { return 'Breathing...'; }
}

class Dog extends Animal {
  bark() { return 'Woof!'; }
}

// Dưới hood thực ra là:
// Dog.prototype.[[Prototype]] === Animal.prototype
```

---

## 4. Async/Await Internals & Generator/Iterator Protocol

### Iterator Protocol

Bất kỳ object nào implement `Symbol.iterator` đều là **Iterable** và có thể dùng với `for...of`:

```typescript
// Tự tạo một Iterable range
function range(start: number, end: number) {
  return {
    [Symbol.iterator]() {
      let current = start;
      return {
        next() {
          if (current <= end) {
            return { value: current++, done: false };
          }
          return { value: undefined, done: true };
        }
      };
    }
  };
}

for (const num of range(1, 5)) {
  console.log(num); // 1 2 3 4 5
}
```

### Generator Functions

Generator là một hàm đặc biệt có thể **tạm dừng** giữa chừng và **tiếp tục** sau đó:

```typescript
function* numberGenerator() {
  console.log('Start');
  yield 1;            // Tạm dừng, trả về 1
  console.log('Resumed after 1');
  yield 2;            // Tạm dừng, trả về 2
  console.log('Resumed after 2');
  yield 3;            // Tạm dừng, trả về 3
  console.log('Done');
}

const gen = numberGenerator();

console.log(gen.next()); // 'Start' → { value: 1, done: false }
console.log(gen.next()); // 'Resumed after 1' → { value: 2, done: false }
console.log(gen.next()); // 'Resumed after 2' → { value: 3, done: false }
console.log(gen.next()); // 'Done' → { value: undefined, done: true }
```

### async/await là Generator + Promise

Dưới hood, `async/await` về cơ bản được transpile thành:

```typescript
// Code bạn viết:
async function fetchUser(id: number) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user;
}

// Cách runtime engine hiểu (tương đương):
function fetchUser(id: number) {
  return new Promise((resolve, reject) => {
    fetch(`/api/users/${id}`)
      .then(response => response.json())
      .then(user => resolve(user))
      .catch(reject);
  });
}

// Hoặc với Generator (Babel polyfill style):
function* fetchUserGen(id: number) {
  const response = yield fetch(`/api/users/${id}`);
  const user = yield response.json();
  return user;
}
```

### Async Iterable — Liên hệ với Observable

```typescript
// Async Generator — tương đương với Observable nhưng là pull-based
async function* streamNumbers() {
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    yield i;
  }
}

// Tiêu thụ async iterable
for await (const num of streamNumbers()) {
  console.log(num); // 0, 1, 2, 3, 4 (mỗi số cách nhau 500ms)
}

// RxJS Observable ~ Push-based Async Iterable
// Observable: Producer chủ động đẩy data cho Consumer (push)
// Async Iterable: Consumer chủ động kéo data từ Producer (pull)
```

---

## 5. Property Descriptors & Decorator Mechanism

### Object.defineProperty

Mọi thuộc tính của object đều có **Property Descriptor** ẩn gồm:

```typescript
const obj = { name: 'Thien' };

// Xem descriptor của thuộc tính
console.log(Object.getOwnPropertyDescriptor(obj, 'name'));
// {
//   value: 'Thien',
//   writable: true,     ← có thể gán lại giá trị
//   enumerable: true,   ← hiện trong for...in và Object.keys()
//   configurable: true  ← có thể xóa hoặc thay đổi descriptor
// }
```

**Tạo thuộc tính tùy chỉnh:**

```typescript
const config = {};

Object.defineProperty(config, 'API_KEY', {
  value: 'secret-key-123',
  writable: false,      // Không thể gán lại
  enumerable: false,    // Không hiện khi console.log(config)
  configurable: false   // Không thể xóa
});

config.API_KEY = 'hack';  // Silently fail (hoặc TypeError trong strict mode)
console.log(config.API_KEY); // 'secret-key-123'
```

**Getter / Setter thông qua Descriptor:**

```typescript
const temperature = {
  _celsius: 0
};

Object.defineProperty(temperature, 'fahrenheit', {
  get() {
    return this._celsius * 9/5 + 32;
  },
  set(value: number) {
    this._celsius = (value - 32) * 5/9;
  },
  enumerable: true,
  configurable: true
});

temperature.fahrenheit = 100;
console.log(temperature._celsius); // 37.77...
console.log(temperature.fahrenheit); // 100
```

### Decorator Mechanism trong Angular

Angular `@Component`, `@Input` là **Class/Property Decorators** — các hàm được gọi tại thời điểm **define class** (compile time):

> ⚠️ **Lưu ý**: `Reflect.defineMetadata` / `Reflect.getMetadata` bên dưới **không phải API chuẩn** của object `Reflect` trong JavaScript (khác với `Reflect.get/set/has` ở mục 8, vốn là API thật). Đây là hai hàm đến từ polyfill **`reflect-metadata`**, được dùng cùng flag `experimentalDecorators` thời **Angular View Engine**. Angular hiện đại (Ivy) đã compile decorator tĩnh lúc build, **không còn phụ thuộc `reflect-metadata`** để đọc metadata nữa — ví dụ dưới đây mang tính minh họa nguyên lý lịch sử, không phải cách Ivy hoạt động thực tế.

```typescript
// Decorator thực chất là một Higher-Order Function:
function Component(metadata: ComponentMetadata) {
  return function(constructor: Function) {
    // Gắn metadata vào class bằng reflect-metadata (cần cài package 'reflect-metadata')
    Reflect.defineMetadata('annotations', [metadata], constructor);

    // Angular (View Engine) đọc metadata này để tạo ComponentFactory
  };
}

// @Input() cũng dùng Property Descriptor
function Input() {
  return function(target: any, propertyKey: string) {
    const existingInputs = Reflect.getMetadata('propDecorators', target.constructor) || {};
    existingInputs[propertyKey] = [{ type: Input }];
    Reflect.defineMetadata('propDecorators', existingInputs, target.constructor);
  };
}

// Khi bạn viết:
@Component({ selector: 'app-root', template: '...' })
class AppComponent {
  @Input() title = '';
}

// Angular đọc metadata → biết AppComponent là component có selector 'app-root'
// và có input property 'title'
```

---

## 6. Functional Programming: Currying, Composition & Memoization

### Currying

**Currying** là biến một hàm nhiều tham số thành chuỗi hàm mỗi hàm nhận một tham số:

```typescript
// Hàm thông thường
function add(a: number, b: number, c: number): number {
  return a + b + c;
}

// Curried version
const curriedAdd = (a: number) => (b: number) => (c: number) => a + b + c;

const add5 = curriedAdd(5);           // Partially applied
const add5and3 = add5(3);             // Partially applied
console.log(add5and3(2));             // 10

// Ứng dụng trong Angular/RxJS — operator factories:
const multiply = (factor: number) => (source$: Observable<number>) =>
  source$.pipe(map(n => n * factor));

// Sử dụng:
of(1, 2, 3).pipe(multiply(3)).subscribe(console.log); // 3 6 9
```

### Function Composition

**Composition** là kết hợp nhiều hàm nhỏ thành hàm lớn:

```typescript
// Compose: áp dụng từ phải sang trái
const compose = <T>(...fns: Array<(x: T) => T>) =>
  (x: T): T => fns.reduceRight((v, f) => f(v), x);

// Pipe: áp dụng từ trái sang phải (giống rxjs pipe)
const pipe = <T>(...fns: Array<(x: T) => T>) =>
  (x: T): T => fns.reduce((v, f) => f(v), x);

const double = (x: number) => x * 2;
const addOne = (x: number) => x + 1;
const square = (x: number) => x * x;

const transform = pipe(double, addOne, square);
// double(5) = 10 → addOne(10) = 11 → square(11) = 121
console.log(transform(5)); // 121

// RxJS pipe() là biến thể của pattern này cho Observable:
of(5).pipe(
  map(x => x * 2),    // double
  map(x => x + 1),    // addOne
  map(x => x * x),    // square
).subscribe(console.log); // 121
```

### Memoization

**Memoization** là kỹ thuật cache kết quả hàm để tránh tính toán lại:

```typescript
function memoize<T extends any[], R>(fn: (...args: T) => R): (...args: T) => R {
  const cache = new Map<string, R>();

  return (...args: T): R => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('Cache hit!');
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Fibonacci không memoize: O(2^n)
const slowFib = (n: number): number => n <= 1 ? n : slowFib(n - 1) + slowFib(n - 2);

// Fibonacci với memoize: O(n)
const fastFib = memoize((n: number): number =>
  n <= 1 ? n : fastFib(n - 1) + fastFib(n - 2)
);

// Angular liên hệ: Pure Pipe tự động memoize
@Pipe({ name: 'expensiveCalc', pure: true }) // pure: true = memoize theo input
export class ExpensiveCalcPipe implements PipeTransform {
  transform(value: number): number {
    // Chỉ chạy lại khi value thay đổi
    return heavyComputation(value);
  }
}
```

---

## 7. ESM Module System Internals

### ESM vs CommonJS

```typescript
// CommonJS (Node.js truyền thống)
const fs = require('fs');           // Đồng bộ, thực thi lúc runtime
module.exports = { myFunction };    // Export lúc runtime

// ESM (JavaScript hiện đại, Angular)
import { Component } from '@angular/core';  // Tĩnh, phân tích lúc parse time
export { myFunction };                       // Live binding
```

**Sự khác biệt quan trọng:**

| Đặc điểm | CJS (`require`) | ESM (`import`) |
|---|---|---|
| Thời điểm resolve | Runtime | Parse time (static) |
| Circular deps | Partial values | Live bindings |
| Tree-shaking | ❌ Khó | ✅ Dễ (static analysis) |
| Top-level await | ❌ | ✅ |
| Synchronous | ✅ | ❌ (async loading) |

### Tree-shaking

ESM cho phép bundler (Webpack/esbuild) phân tích **statically** những gì được import và loại bỏ code không dùng đến:

```typescript
// utils.ts
export function usedFunction() { return 'used'; }
export function unusedFunction() { return 'never called'; }

// main.ts
import { usedFunction } from './utils'; // Chỉ import hàm này
usedFunction();
// Build output: unusedFunction sẽ bị loại khỏi bundle ✅

// ❌ CJS không tree-shakeable:
const utils = require('./utils');
utils.usedFunction(); // Bundler không biết utils.unusedFunction có được dùng không
```

### Dynamic Import & Code Splitting

```typescript
// Static import — luôn tải ngay
import { HeavyModule } from './heavy-module';

// Dynamic import — tải theo yêu cầu (lazy loading)
const { HeavyModule } = await import('./heavy-module');

// Angular Router lazy loading sử dụng dynamic import:
const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  }
];
```

### Tránh Circular Dependencies

```typescript
// ❌ Circular — A imports B, B imports A
// a.ts: import { b } from './b';
// b.ts: import { a } from './a'; // Circular!

// Kết quả: Một trong hai sẽ nhận được `undefined` tại initialization time

// ✅ Giải pháp: Tách phần chung ra file thứ ba
// shared.ts: export const sharedValue = ...;
// a.ts: import { sharedValue } from './shared';
// b.ts: import { sharedValue } from './shared';
```

---

## 8. Metaprogramming với Proxy & Reflect

### Proxy — Bắt chặn mọi thao tác với Object

```typescript
const handler: ProxyHandler<Record<string, any>> = {
  get(target, prop) {
    console.log(`GET: ${String(prop)}`);
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    console.log(`SET: ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value);
  },
  has(target, prop) {
    console.log(`HAS: ${String(prop)}`);
    return Reflect.has(target, prop);
  },
  deleteProperty(target, prop) {
    console.log(`DELETE: ${String(prop)}`);
    return Reflect.deleteProperty(target, prop);
  }
};

const user = new Proxy({ name: 'Thien', age: 24 }, handler);

user.name;            // GET: name
user.email = 'test';  // SET: email = test
'name' in user;       // HAS: name
delete user.age;      // DELETE: age
```

### Tự xây dựng Reactive State System

Đây chính xác là nguyên lý đằng sau **Vue 3 Reactivity** (Vue 3 dùng `Proxy` thật để intercept get/set như dưới đây).

> ⚠️ **Angular Signals thì khác**: Signals **không** dùng `Proxy`. `signal()` trả về một getter function tường minh, và Angular tự xây một **dependency graph** (mỗi `computed`/`effect` tự đăng ký là consumer khi gọi signal bên trong nó) để biết khi nào cần re-run — không có bước intercept `get`/`set` qua Proxy. Điểm chung với ví dụ dưới đây chỉ là **ý tưởng track/trigger** (theo dõi ai đọc, thông báo lại khi đổi), còn cách hiện thực thì khác nhau.

```typescript
type EffectFn = () => void;

let activeEffect: EffectFn | null = null;
const deps = new WeakMap<object, Map<string | symbol, Set<EffectFn>>>();

function track(target: object, key: string | symbol) {
  if (!activeEffect) return;
  let depsMap = deps.get(target);
  if (!depsMap) deps.set(target, (depsMap = new Map()));
  let keyDeps = depsMap.get(key);
  if (!keyDeps) depsMap.set(key, (keyDeps = new Set()));
  keyDeps.add(activeEffect);
}

function trigger(target: object, key: string | symbol) {
  const depsMap = deps.get(target);
  if (!depsMap) return;
  depsMap.get(key)?.forEach(fn => fn());
}

function reactive<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      trigger(target, key);
      return result;
    }
  });
}

function effect(fn: EffectFn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// Sử dụng:
const state = reactive({ count: 0 });

effect(() => {
  console.log('Count is:', state.count); // Tự động chạy lại khi count thay đổi
});

state.count = 1; // Count is: 1
state.count = 2; // Count is: 2
```

---

## 9. WeakMap, WeakSet & Memory Safety

### Strong Reference vs Weak Reference

```typescript
// Strong Reference (Map thông thường) — ngăn GC
const cache = new Map();
let bigObject = { data: new Array(1000000).fill(0) };
cache.set(bigObject, 'metadata');

bigObject = null; // Muốn giải phóng, nhưng...
// cache vẫn giữ reference đến bigObject → GC KHÔNG thu hồi được → LEAK!

// Weak Reference (WeakMap) — GC có thể thu hồi
const weakCache = new WeakMap();
let bigObject2 = { data: new Array(1000000).fill(0) };
weakCache.set(bigObject2, 'metadata');

bigObject2 = null; // WeakMap không ngăn GC
// GC thu hồi bigObject2 → weakCache entry tự động bị xóa ✅
```

### Ứng dụng trong Angular CDK

```typescript
// Lưu metadata cho DOM elements mà không gây memory leak
const elementMetadata = new WeakMap<Element, { tooltip: string; isActive: boolean }>();

@Directive({ selector: '[appTooltip]' })
export class TooltipDirective implements OnInit {
  @Input() appTooltip = '';

  constructor(private el: ElementRef<Element>) {}

  ngOnInit() {
    // Lưu metadata vào WeakMap
    elementMetadata.set(this.el.nativeElement, {
      tooltip: this.appTooltip,
      isActive: false
    });
  }

  // Khi directive bị destroy, element bị remove khỏi DOM
  // WeakMap tự động dọn sạch entry → không leak
}
```

### WeakSet — Track object không gây leak

```typescript
// Track xem object nào đã được xử lý
const processed = new WeakSet<object>();

function processOnce(request: object) {
  if (processed.has(request)) {
    console.log('Already processed, skip');
    return;
  }
  // ... xử lý request
  processed.add(request);
}
```

---

## 10. Quick Decision Guide & Câu hỏi phỏng vấn Senior

### Bảng quyết định nhanh

| Vấn đề gặp phải | Giải pháp |
|---|---|
| UI bị giật/lag sau thao tác async | Dùng `NgZone.runOutsideAngular()` cho tác vụ không cần CD |
| Memory tăng dần khi navigate | Kiểm tra unsubscribed Observable, Event Listener chưa gỡ |
| `this` là `undefined` trong callback | Dùng Arrow Function hoặc `.bind(this)` |
| `this` bị sai trong setTimeout | Dùng Arrow Function trong timeout callback |
| Bundle size quá lớn | Kiểm tra circular deps, dùng dynamic import, pure ESM |
| Cần cache API response | `shareReplay({ bufferSize: 1, refCount: true })` |
| Tính toán nặng trong Pipe | Dùng `pure: true` pipe (memoize tự động) |
| Cần reactive state đơn giản | Angular Signals (`signal()`, `computed()`, `effect()`) |
| Lưu metadata cho DOM element | `WeakMap` để tránh memory leak |
| Hàm gọi nhiều lần với cùng input | Memoize để tối ưu hiệu năng |

### Câu hỏi phỏng vấn Senior thường gặp

**Q1:** Tại sao `Promise.then` luôn chạy trước `setTimeout` dù `setTimeout(fn, 0)`?
> **A:** Promise.then là Microtask, xử lý ngay sau Macrotask hiện tại. setTimeout là Macrotask, xếp hàng đợi sau tất cả Microtask.

**Q2:** Explain tại sao Arrow Function không có `arguments` object và `this` của riêng nó?
> **A:** Arrow Function không có own Execution Context. Nó kế thừa `this` và `arguments` từ lexical (surrounding) scope khi được định nghĩa.

**Q3:** Sự khác biệt giữa `Object.freeze()` và Property Descriptor `writable: false`?
> **A:** `writable: false` chỉ ngăn gán lại giá trị cho thuộc tính đó. `Object.freeze()` làm `writable: false` + `configurable: false` cho tất cả thuộc tính + ngăn thêm thuộc tính mới. Cả hai đều **shallow** — không ảnh hưởng đến object lồng nhau.

**Q4:** Tại sao RxJS Observable là lazy nhưng Promise thì không?
> **A:** Promise executor chạy ngay khi `new Promise()` được gọi. Observable chỉ bắt đầu khi có `subscribe()`. Observable ~ Async Iterator (pull), Promise ~ đã chạy rồi mới lấy kết quả (push once).

**Q5:** Giải thích Temporal Dead Zone (TDZ)?
> **A:** `let` và `const` được hoisting nhưng không được khởi tạo. Vùng từ đầu block đến dòng khai báo là TDZ. Truy cập biến trong TDZ → `ReferenceError`.

**Q6:** Khi nào nên dùng `WeakMap` thay vì `Map`?
> **A:** Khi key là object và bạn không muốn nó ngăn GC thu hồi object đó. Phù hợp lưu metadata gắn với DOM element hoặc class instance, vì khi object bị GC, entry trong WeakMap cũng tự mất.

---

## Link tham khảo

- [Jake Archibald — In the Loop (JSConf Asia)](https://www.youtube.com/watch?v=cCOL7MC4Pl0)
- [MDN — Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)
- [You Don't Know JS — Scope & Closures](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/README.md)
- [MDN — Property Descriptors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- [MDN — Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [Angular Signals RFC](https://github.com/angular/angular/discussions/49685)

`#100DaysOfCodeAngular` `#100DaysOfCode` `#AngularVietNam100DoC_Day49`
