import { Component, OnInit } from '@angular/core';
import { Image } from 'src/app/models/image';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  images: Image[] = [];
  email: string = "";

  constructor(private authService: AuthService, private imageService: ImageService) { }

  ngOnInit(): void {
    this.authService.getUserById(this.authService.getUserId())?.subscribe((res) => {
      this.email = res.email;
    });
    this.imageService.getImages().subscribe((res) => {
      this.images = (res as Image[]);
    });
  }

}
