import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { NoopAnimationsModule }  from '@angular/platform-browser/animations';
import { FileListComponent } from './file-list/file-list.component';
@NgModule({
  declarations: [AppComponent, FileListComponent],
  imports: [
    BrowserModule,  
    NoopAnimationsModule
   
    ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
