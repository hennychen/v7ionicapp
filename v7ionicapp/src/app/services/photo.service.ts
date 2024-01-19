import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  GalleryPhoto,
  Photo,
} from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { UserGalleryPhoto } from './UserGalleryPhotos';
import { UserPhoto } from './UserPhoto';
@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos: UserPhoto[] = [];

  public galleryPhotos:UserGalleryPhoto[] = [];

  private PHOTO_STORAGE: string = 'photos';
  constructor() {}

  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    // //1.获取拍摄的图片
    // this.photos.unshift({
    //   filepath: "soon...",
    //   webviewPath: capturedPhoto.webPath!
    // });

    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    // Function, add a call to Preferences.set() to save the Photos array. By adding it here, the Photos array is stored each time a new photo is taken. This way, it doesn’t matter when the app user closes or switches to a different app - all photo data is saved.
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  private async savePicture(photo: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = Date.now() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    };
  }

  private async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return (await this.convertBlobToBase64(blob)) as string;
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  public async loadSaved() {
    // Retrieve cached photo array data
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    // more to come...

    // Display the photo by reading into base64 format
    for (let photo of this.photos) {
      // Read each saved photo's data from the Filesystem
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });

      // Web platform only: Load the photo as base64 data
      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }

  public async pickPhoto(){
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      
      quality: 100,
    });

    // //1.获取拍摄的图片
    this.photos.unshift({
      filepath: "soon...",
      webviewPath: capturedPhoto.webPath!
    });

    // Save the picture and add it to photo collection
    // const savedImageFile = await this.savePicture(capturedPhoto);
    // this.photos.unshift(savedImageFile);
  }
  public async pickImage() {
    const GalleryPhotostemp = await Camera.pickImages({
      quality: 50,
    });
    GalleryPhotostemp.photos.forEach((e:GalleryPhoto) => {
      this.galleryPhotos.unshift({
        filepath:"",
        webviewPath:e.webPath!,
      })
    });
   

  }
}

function GalleryImageOptions(GalleryImageOptions: any) {
  throw new Error('Function not implemented.');
}
