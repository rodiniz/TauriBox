import { DropBoxItem } from './models/DropBoxItem';
import { DropBoxService } from './drop-box.service';
import { Component, inject, OnInit } from "@angular/core";
import { MyTreeNode } from './models/treenode';
import { open } from '@tauri-apps/api/dialog'
@Component({
  
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]  
})
export class AppComponent implements OnInit {
  dropboxService=inject(DropBoxService);
  folders:MyTreeNode[]=[];
  files:DropBoxItem[]=[];
  currentExpanded:MyTreeNode | undefined;
  async ngOnInit() {
    var accessToken = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
    if(accessToken!==null && accessToken!==""){
      localStorage.setItem('access_token', accessToken);
    }
    if(localStorage.getItem('access_token')===null){
      this.dropboxService.login();
      return;
    }
    let data= await this.dropboxService.getFolders('');
  
    let tempFolders=data.entries.filter(c=> c['.tag']==='folder');    
    this.folders=tempFolders.map(
      ({name})=> { 
      
        return { name, children:[] ,isExpanded:false} as MyTreeNode    
      });      
  
    this.files=data.entries.filter(c=> c['.tag']==='file');     
 
  }
  hasChild = (_: number, node: MyTreeNode) => !!node.children ;

  async listFiles(node:MyTreeNode){
    this.currentExpanded=node;
    node.isExpanded=true;
    let data= await this.dropboxService.getFolders('/'+node.name);
    this.files=data.entries.filter(c=> c['.tag']==='file');   
    let subfolders=data.entries.filter(c=> c['.tag']==='folder');
    node.children=subfolders.map(
      ({name})=> { 
      
        return { name, children:[] ,isExpanded:false} as MyTreeNode    
      });     
  }
  async uploadFile(node?:MyTreeNode){ 
    let path='';
    if(node){
      path='/'+node.name;
    }
    const selected = await open({
      multiple: false
    });
    if(selected!==null){
      const fileUploaded= await this.dropboxService.UploadFile(path, selected as string);
      if(fileUploaded!==null){
       this.files= [...this.files, fileUploaded];
      }
    }
    
  }
  async createFolder(node?:MyTreeNode){
    let path='';
    if(node){
      path='/'+node.name;
    }
    let folderName = prompt("Please enter folder name", "TauriBox");
    path+='/'+folderName;
    let sucesss= await this.dropboxService.createFolder(path);
    if(sucesss){
      this.currentExpanded?.children?.push({ name:folderName }as MyTreeNode);
    }
  }

}
