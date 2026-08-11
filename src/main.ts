import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

(window as typeof window & { global: typeof window }).global = window;

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
