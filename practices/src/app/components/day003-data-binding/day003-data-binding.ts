import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface UserProfile {
  name: string;
  age: number;
  role: string;
  avatar: string;
  bio: string;
  website: string;
  followers: number;
  likes: number;
  isFollowing: boolean;
}

export interface ActionLog {
  id: number;
  time: string;
  type: 'event' | 'property' | 'twoway';
  action: string;
  desc: string;
}

@Component({
  selector: 'app-day003-data-binding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day003-data-binding.html',
  styleUrl: './day003-data-binding.scss',
})
export class Day003DataBinding {
  // 1. Data Model (Dữ liệu người dùng: Thien Le, age 30)
  readonly defaultAvatar = '/avatar.jpg';

  user: UserProfile = {
    name: 'Thien Le',
    age: 25,
    role: 'Fullstack Developer',
    avatar: this.defaultAvatar,
    bio: 'Đam mê chia sẻ kiến thức Angular và TypeScript cho cộng đồng lập trình viên Việt Nam. Tác giả chuỗi 100 Days of Angular.',
    website: 'https://github.com/ThienLE0811',
    followers: 1250,
    likes: 384,
    isFollowing: false,
  };

  readonly currentYear: number = new Date().getFullYear();

  // 2. Property Binding States
  isInputDisabled: boolean = false;
  cardTheme: 'indigo' | 'emerald' | 'rose' | 'amber' = 'indigo';
  buttonHoverState: boolean = false;
  customFontSize: number = 15;

  // 3. Event Binding & Activity Log States
  toastMessage: string = '';
  showToast: boolean = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  lastKeystroke: string = '';
  lastKeyEventCode: string = '';
  actionLogs: ActionLog[] = [];
  private logIdCounter: number = 1;

  // 4. Two-Way Binding & Deconstructed Demo
  deconstructedRole: string = this.user.role;

  constructor() {
    this.addLog('event', 'Init Component', 'Component Day003DataBinding khởi tạo thành công');
  }

  // --- EVENT BINDING HANDLERS ---
  /**
   * Phương thức mô phỏng theo ví dụ chính xác trong tài liệu Day 3:
   * showInfo() { alert('Inside Angular Component method'); }
   * Ở đây vừa hiển thị Toast thông báo hiện đại, vừa log thông tin
   */
  showInfo(useNativeAlert: boolean = false): void {
    const msg = `🎉 Inside Angular Component method! Tên: ${this.user.name}, Tuổi: ${this.user.age}`;
    if (useNativeAlert) {
      alert(msg);
    }
    this.triggerToast(msg);
    this.addLog('event', 'showInfo()', 'Người dùng đã click vào nút [Click me!]');
  }

  onLike(): void {
    this.user.likes++;
    this.triggerToast(`Cảm ơn bạn! Đã nhận được ${this.user.likes} lượt thích ❤️`);
    this.addLog('event', 'onLike()', `Lượt thích tăng lên: ${this.user.likes}`);
  }

  onToggleFollow(): void {
    this.user.isFollowing = !this.user.isFollowing;
    if (this.user.isFollowing) {
      this.user.followers++;
      this.triggerToast(`Đã theo dõi ${this.user.name} thành công!`);
      this.addLog(
        'event',
        'onToggleFollow()',
        `Đã theo dõi. Tổng followers: ${this.user.followers}`,
      );
    } else {
      this.user.followers--;
      this.triggerToast(`Đã hủy theo dõi ${this.user.name}.`);
      this.addLog(
        'event',
        'onToggleFollow()',
        `Hủy theo dõi. Còn lại followers: ${this.user.followers}`,
      );
    }
  }

  onKeyInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    this.lastKeystroke = inputEl.value;
    this.addLog('event', '(input) event', `Dữ liệu nhập từ DOM: "${inputEl.value}"`);
  }

  onKeyDownCapture(event: KeyboardEvent): void {
    this.lastKeyEventCode = event.key;
  }

  // --- PROPERTY BINDING HANDLERS ---
  toggleDisabled(): void {
    this.isInputDisabled = !this.isInputDisabled;
    this.addLog(
      'property',
      'toggleDisabled()',
      `Thuộc tính [disabled] đổi thành: ${this.isInputDisabled}`,
    );
  }

  setTheme(theme: 'indigo' | 'emerald' | 'rose' | 'amber'): void {
    this.cardTheme = theme;
    this.addLog('property', 'setTheme()', `Class màu card đổi thành: ${theme}`);
  }

  increaseAge(): void {
    this.user.age++;
    this.addLog('event', 'increaseAge()', `Tuổi tăng lên: ${this.user.age}`);
  }

  decreaseAge(): void {
    if (this.user.age > 1) {
      this.user.age--;
      this.addLog('event', 'decreaseAge()', `Tuổi giảm xuống: ${this.user.age}`);
    }
  }

  // --- TWO-WAY BINDING DECONSTRUCTED HANDLER ---
  onDeconstructedRoleChange(newRole: string): void {
    this.deconstructedRole = newRole;
    this.user.role = newRole;
    this.addLog(
      'twoway',
      '(ngModelChange)',
      `Tách rời Two-Way: Role được cập nhật thành: "${newRole}"`,
    );
  }

  // --- UTILITIES ---
  resetProfile(): void {
    this.user = {
      name: 'Thien Le',
      age: 30,
      role: 'Google Developer Expert & Fullstack Architect',
      avatar: this.defaultAvatar,
      bio: 'Đam mê chia sẻ kiến thức Angular và TypeScript cho cộng đồng lập trình viên Việt Nam. Tác giả chuỗi 100 Days of Angular.',
      website: 'https://github.com/ThienLE0811',
      followers: 1250,
      likes: 384,
      isFollowing: false,
    };
    this.deconstructedRole = this.user.role;
    this.isInputDisabled = false;
    this.cardTheme = 'indigo';
    this.lastKeystroke = '';
    this.triggerToast('Đã khôi phục dữ liệu ban đầu theo Day 003!');
    this.addLog('event', 'resetProfile()', 'Reset trạng thái user về dữ liệu mặc định');
  }

  clearLogs(): void {
    this.actionLogs = [];
  }

  triggerToast(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  addLog(type: 'event' | 'property' | 'twoway', action: string, desc: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;

    this.actionLogs.unshift({
      id: this.logIdCounter++,
      time: timeStr,
      type,
      action,
      desc,
    });

    if (this.actionLogs.length > 20) {
      this.actionLogs.pop();
    }
  }
}
