import * as Permissions from 'nativescript-permissions';
import * as app from 'tns-core-modules/application';
import { File } from 'tns-core-modules/file-system';
import * as utils from 'tns-core-modules/utils/utils';

import { Common } from './ffmpeg.common';

declare const android: any;
declare const com: any;
const bundle = com.github.hiteshsondhi88.libffmpeg;
const ffmpeg = bundle.FFmpeg.getInstance(app.android.context);

export class FFmpeg extends Common {
  static execute(command: string | Array<string>): Promise<void> {
    return new Promise((resolve, reject) => {
      Permissions.requestPermission(
        [android.Manifest.permission.READ_EXTERNAL_STORAGE,
        android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
        'We need access to the file system to save your file').then(() => {
          if (typeof command === 'string') {
            command.replace('ffmpeg ', '');
            command = command.split(' ');
          } else if (Array.isArray(command) && command[0] === 'ffmpeg') {
            command.shift();
          }
          try {
            ffmpeg.loadBinary(new bundle.LoadBinaryResponseHandler());
          } catch (e) {
            reject('FFmpeg is not supported by device');
          }
          const ExecuteBinaryResponseHandler = bundle.ExecuteBinaryResponseHandler.extend({
            onStart: () => { },
            onProgress: (message) => console.log(message),
            onFailure: (message) => reject(message),
            onSuccess: (message) => resolve(),
            onFinish: () => { }
          });
          try {
            ffmpeg.execute(command, new ExecuteBinaryResponseHandler());
          } catch (e) {
            reject(`Could not execute: ${command.join(' ')}`);
          }
        }).catch(reject);
    });
  }
}