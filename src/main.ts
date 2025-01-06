import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {SearchComponent} from './app/search/search.component';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

