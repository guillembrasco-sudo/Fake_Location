import { registerPlugin } from '@capacitor/core';

export interface MockConfigStatus {
  isGpsEnabled: boolean;
  isMockAppSelected: boolean;
}

export interface MockLocationPlugin {
  startMocking(options: { lat: number; lng: number }): Promise<void>;
  stopMocking(): Promise<void>;
  checkConfig(): Promise<MockConfigStatus>;
  openDeveloperSettings(): Promise<void>;
  openLocationSettings(): Promise<void>;
}

const MockLocation = registerPlugin<MockLocationPlugin>('MockLocation');

export default MockLocation;