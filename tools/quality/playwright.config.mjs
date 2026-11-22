import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const HERE = dirname(fileURLToPath(import.meta.url));
const CAMERA_FILE = join(HERE, 'fixtures', 'qr-camera.y4m');
const FACE_CAMERA_FILE = join(HERE, 'fixtures', 'face-camera.y4m');
const hasCamera = existsSync(CAMERA_FILE);
const hasFaceCamera = existsSync(FACE_CAMERA_FILE);

const COMMON_ARGS = [
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  '--autoplay-policy=no-user-gesture-required'
];
const QR_ARGS = [...COMMON_ARGS, ...(hasCamera ? [`--use-file-for-fake-video-capture=${CAMERA_FILE}`] : [])];
const FACE_ARGS = [...COMMON_ARGS, ...(hasFaceCamera ? [`--use-file-for-fake-video-capture=${FACE_CAMERA_FILE}`] : [])];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 35000,
  expect: { timeout: 8000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    permissions: ['camera', 'geolocation', 'clipboard-read', 'clipboard-write']
  },
  webServer: {
    command: 'node serve.mjs',
    url: 'http://127.0.0.1:4173/projects/qr-studio/',
    reuseExistingServer: !process.env.CI,
    timeout: 20000
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: '**/vision-lab.spec.mjs',
      use: { ...devices['Desktop Chrome'], launchOptions: { args: QR_ARGS } }
    },
    {
      name: 'mobile-chromium',
      testIgnore: '**/vision-lab.spec.mjs',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
        launchOptions: { args: QR_ARGS }
      }
    },
    {
      name: 'vision-chromium',
      testMatch: '**/vision-lab.spec.mjs',
      timeout: 90000,
      use: { ...devices['Desktop Chrome'], launchOptions: { args: FACE_ARGS } }
    },
    {
      name: 'vision-mobile',
      testMatch: '**/vision-lab.spec.mjs',
      timeout: 90000,
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
        launchOptions: { args: FACE_ARGS }
      }
    }
  ]
});
