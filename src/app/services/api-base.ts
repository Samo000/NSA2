import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export function injectApiBaseUrl(): string {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId) && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3000/api`;
  }

  return 'http://localhost:3000/api';
}
