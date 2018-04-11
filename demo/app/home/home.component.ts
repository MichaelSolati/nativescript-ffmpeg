import { Component, OnInit } from "@angular/core";
import * as Permissions from "nativescript-permissions";
import { FFmpeg } from "nativescript-ffmpeg";
import { isAndroid } from "tns-core-modules/platform";
import * as dialogs from "tns-core-modules/ui/dialogs";

const vr = require("../tools/video-recorder");

declare const android: any;

@Component({
  selector: "Home",
  moduleId: module.id,
  templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
  private _compressed: number;
  private _message: string;
  private _original: number;
  private _percent: string;
  private _recorder = new vr.VideoRecorder({
    format: "mp4",
    saveToGallery: true,
    hd: true,
    explanation: "We need to be able to record video"
  });

  constructor() {
  }

  ngOnInit(): void {
  }

  get compressed(): number {
    return this._compressed;
  }

  get message(): string {
    return this._message;
  }

  get original(): number {
    return this._original;
  }

  get percent(): string {
    return this._percent;
  }

  private _compress(src: string): void {
    const out = src.replace(/\.[^/.]+$/, "_COMPRESSED.mp4");
    const command: string = `-i ${src} -vcodec h264 -acodec mp3 -vf scale=320:240 ${out}`;
    this._message = "Processing video";
    FFmpeg.execute(command).then(() => {
      this._message = null;
      this._compressed = this._getSize(out);
      this._percent = "Reduced by " + (100 - (this._compressed * 100 / this.original)).toFixed(2) + "%";
    }).catch(() => this._message = "Couldn't compress video");
  }

  private _error(error: string | Error): Promise<void> {
    return dialogs.alert({
      title: "Uh oh...",
      message: (error instanceof Error) ? error.message : error,
      okButtonText: "OK, got it"
    });
  }

  private _getSize(path: string): number {
    let length: number = 0;
    if (isAndroid) {
      const file = new java.io.File(path);
      length = file.length();
    } else {
      const defManager = NSFileManager.defaultManager;
      const fileAttributes = defManager.attributesOfItemAtPathError(path);
      length = fileAttributes.objectForKey(NSFileSize);
    }
    return Number((length / (1000 * 1000)).toFixed(2));
  }

  private _takeVideo(): void {
    this._recorder.record()
      .then((data) => {
        this._original = this._getSize(data.file);
        this._compress(data.file);
      })
      .catch((error) => { if (error.event !== "cancelled") { this._error("Couldn't record your video"); } });
  }

  public takeVideo(): void {
    this._original = null;
    this._message = null;
    this._compressed = null;
    this._percent = null;
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
