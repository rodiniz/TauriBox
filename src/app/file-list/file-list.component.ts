import { DropBoxService } from './../drop-box.service';
import { inject } from '@angular/core';
import { DropBoxItem } from './../models/DropBoxItem';
import { Component, Input } from '@angular/core';
import { confirm } from '@tauri-apps/api/dialog';
@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent {
  @Input()
  dataSource!: DropBoxItem[];
  displayedColumns: string[] = ['name','action'];
  service= inject(DropBoxService);
  async downloadFile(element:DropBoxItem){
    await this.service.downloadFile(element);
   
  }
  async deleteFile(element:DropBoxItem){
    const confirmed = await confirm('Are you sure you want to delete the file ?', { title: 'TauriBox', type: 'warning' });
    if(confirmed){
      const deleted= await this.service.deleteFile(element);
      if(deleted){
        this.dataSource= this.dataSource.filter(c=> c.id!==element.id);
        
      }
    }
   
  }
}
