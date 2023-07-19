import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Image } from '../models/image';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private webReqService: WebRequestService, private httpClient: HttpClient) { }

  getImages() {
    return this.webReqService.get<Image[]>('images');
  }

  getImageById(id: string) {
    return this.webReqService.get<Image>(`images/${id}`);
  }

  createImage(image: File, authorId: string, description: string) {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('authorId', authorId);
    formData.append('description', description);
    return this.webReqService.post('images', formData);
  }

  updateImageDescription(id: string, description: string) {
    return this.webReqService.patch(`images/${id}`, { description });
  }

  deleteImage(id: string) {
    return this.webReqService.delete(`images/${id}`);
  }
}
