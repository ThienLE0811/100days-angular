import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { adminChunkElapsedMs, adminChunkStatus, loadAdminPanelModule, resetAdminChunkDemo } from '../admin-chunk-loader';

@Component({
  selector: 'app-day029-lazy-load-home',
  imports: [RouterLink],
  templateUrl: './lazy-load-home.html',
  styleUrl: './lazy-load-home.scss',
})
export class LazyLoadHome {
  readonly adminChunkStatus = adminChunkStatus;
  readonly adminChunkElapsedMs = adminChunkElapsedMs;

  preloadAdminChunk(): void {
    loadAdminPanelModule();
  }

  resetDemo(): void {
    resetAdminChunkDemo();
  }
}
