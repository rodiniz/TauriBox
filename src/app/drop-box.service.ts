import { DropBoxItem } from './models/DropBoxItem';
import { DropBoxResult } from './models/dropboxResult';
import { Injectable } from '@angular/core';
import { fetch ,Body, ResponseType} from '@tauri-apps/api/http';
import {  BaseDirectory, readBinaryFile, writeBinaryFile } from '@tauri-apps/api/fs';
import { message } from '@tauri-apps/api/dialog';
import { homeDir } from '@tauri-apps/api/path';
@Injectable({
  providedIn: 'root'
})
export class DropBoxService {
 
  clientId = 'ub2qs8d4hbwxvp4';
  redirectUri = 'http://localhost:4200'; 
  constructor() { }
  login(){
     
      var authUrl = 'https://www.dropbox.com/oauth2/authorize' +
        '?response_type=token' +
        '&client_id=' + encodeURIComponent(this.clientId) +
        '&redirect_uri=' + encodeURIComponent(this.redirectUri);

      // Redirect the user to the Dropbox authorization page
      window.location.href = authUrl;
  }
   async getFolders(path:string):Promise<DropBoxResult>{
    const accessToken =localStorage.getItem('access_token');
    const url = 'https://api.dropboxapi.com/2/files/list_folder';         
    var response=await fetch(url, {
      method: 'POST',      
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: Body.json({
        "path": path
      })
    })  
    
    if(response.status===401){
      localStorage.removeItem('access_token');
      this.login();
      return {}as DropBoxResult;
    }
    if(response.status!==200){
      await message(`Error listing files :${response.data}`, {type:'error'});
      return {}as DropBoxResult;
    }
    return response.data as DropBoxResult;
  }
  async downloadFile(item:DropBoxItem){
    const url = "https://content.dropboxapi.com/2/files/download";
    const accessToken =localStorage.getItem('access_token');
    const homeDirPath = await homeDir()
    var response=await fetch(url, {
      method: 'POST',  
      responseType:ResponseType.Binary,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        "Dropbox-API-Arg": `{"path": "${item.path_lower}"}`
      }
     });
     if(response.status==200){
       
      await writeBinaryFile(item.name, response.data as Uint8Array, { dir: BaseDirectory.Home });
      await message(`File saved at ${homeDirPath}${item.name}`, 'TauriBox');
     }    
  }

  async deleteFile(element: DropBoxItem) : Promise<boolean>{
    const url='https://api.dropboxapi.com/2/files/delete_v2';
    const accessToken =localStorage.getItem('access_token');
    var response=await fetch(url, {
      method: 'POST',      
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      
      body: Body.json({
        'path': element.path_lower
      })
     });     
     if(response.status==200){
         await message(`File deleted`, 'TauriBox');
         return true;
     }
     else{
      await message(`Error deleting file :${response.data}`, {type:'error'});
     }
     return false;    
  }
  async UploadFile(dropboxPath: string, localPath:string):Promise<DropBoxItem|null>{
    const accessToken =localStorage.getItem('access_token');
    const filename = localPath.replace(/^.*[\\\/]/, '');    
   
    const contents = await readBinaryFile(localPath);
    const response=await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Dropbox-API-Arg': `{"autorename":false,"mode":"add","mute":false,"path":"${dropboxPath}/${filename}","strict_conflict":false}`,
        'Content-Type': 'application/octet-stream'
      },
      body: Body.bytes(
        contents as Uint8Array
      )
     
    });
    if(response.status==200){
      await message(`File uploaded successfully`, 'TauriBox');
      return response.data as DropBoxItem;
    }
    else{
      await message(`Error uploading file :${response.data}`, {type:'error'});
      return null;
    }
  }
  async createFolder(path:string):Promise<boolean|null>{
    const url='https://api.dropboxapi.com/2/files/create_folder_v2';
    const accessToken =localStorage.getItem('access_token');
    var response=await fetch(url, {
      method: 'POST',      
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      
      body: Body.json({
        'path': path
      })
     });     
     debugger;
     if(response.status==200){
         await message(`Folder ${path} created`, 'TauriBox');
         return true;
     }
     else{
      await message(`Error creating folder :${response.data}`, {type:'error'});
     }
     return false;    
  }
}
