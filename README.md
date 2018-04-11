# Nativescript FFmpeg
[![Build Status](https://travis-ci.org/MichaelSolati/nativeScript-ffmpeg.svg?branch=master)](https://travis-ci.org/MichaelSolati/nativeScript-ffmpeg)

A Nativescript wrapper for the FFmpeg library. (ONLY SUPPORTS ANDROID)

## Installation

Run the following command from the root of your project:

```
tns plugin add nativescript-ffmpeg
```

This command automatically installs the necessary files, as well as stores `nativescript-ffmpeg` as a dependency in your project's package.json file.

## API

### Static Properties
* **execute** - *string | Array<string>*  
Executes a FFmpeg command.

## Usage
```typescript
import { Component, OnInit } from "@angular/core";
import { FFmpeg } from "nativescript-ffmpeg";
import { VideoRecorder } from "nativescript-videorecorder";
import * as Permissions from "nativescript-permissions";
import { isAndroid } from "tns-core-modules/platform";
import * as dialogs from "tns-core-modules/ui/dialogs";


declare const android: any;

@Component({
  selector: "Home",
  moduleId: module.id,
  templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
  private _recorder = new VideoRecorder({
    format: "mp4",
    saveToGallery: true,
    hd: true,
    explanation: "We need to be able to record video"
  });

  constructor() {
  }

  ngOnInit(): void {
  }

  private _compress(src: string): void {
    const out = src.replace(/\.[^/.]+$/, "_COMPRESSED.mp4");
    FFmpeg.execute(["-i", src, "-vcodec", "h264", "-acodec", "mp3", out]).then(() => console.log("Compressed file size " + this._getSize(out))).catch(this._error);
  }

  private _error(error: string | Error): Promise<void> {
    return dialogs.alert({
      title: "Uh oh...",
      message: (error instanceof Error) ? error.message : error,
      okButtonText: "OK, got it"
    });
  }

  private _getSize(path: string): string {
    let length: number = 0;
    if (isAndroid) {
      const file = new java.io.File(path);
      length = file.length();
    } else {
      const defManager = NSFileManager.defaultManager;
      const fileAttributes = defManager.attributesOfItemAtPathError(path);
      length = fileAttributes.objectForKey(NSFileSize);
    }
    return `${(length / (1000 * 1000)).toFixed(2)} MB`;
  }

  private _takeVideo(): void {
    this._recorder.record()
      .then((data) => {
        console.log("Original file size " + this._getSize(data.file));
        this._compress(data.file);
      })
      .catch((error) => { if (error.event !== "cancelled") { this._error("Couldn't record your video"); } });
  }

  public takeVideo(): void {
    if (isAndroid) {
      Permissions.requestPermission([android.Manifest.permission.RECORD_AUDIO, android.Manifest.permission.CAMERA],
        "Demo needs Audio and Camera permissions to record a video")
        .then(() => {
          this._takeVideo();
        }, (error) => this._error("Demo needs Audio and Camera permissions to record a video"));
    } else {
      this._takeVideo();
    }
  }
}

```
    
## License

Apache License Version 2.0, January 2004
