import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingServiceService {
  private activeRequest:number = 0
  isLoading = signal(false)

  show(){
    if(this.activeRequest === 0){
      this.isLoading.set(true)
      this.activeRequest ++
    }
  }

  hide(){
    this.activeRequest--
    if(this.activeRequest<=0){
      this.isLoading.set(false)
      this.activeRequest = 0
    }
  }
  constructor() { }
}
