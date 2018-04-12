import * as Permissions from 'nativescript-permissions';
import * as app from 'tns-core-modules/application';
import { File } from 'tns-core-modules/file-system';
import * as utils from 'tns-core-modules/utils/utils';

import { Callback, Common } from './ffmpeg.common';

declare const android: any;
declare const com: any;
const bundle = com.github.hiteshsondhi88.libffmpeg;
const ffmpeg = bundle.FFmpeg.getInstance(app.android.context);

export class FFmpeg extends Common {
  static execute(command: string | Array<string>, callback?: Callback, debug: boolean = false): void {
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
          if (callback) { callback('FFmpeg is not supported by device'); }
          return;
        }
        const ExecuteBinaryResponseHandler = bundle.ExecuteBinaryResponseHandler.extend({
          onStart: () => { if (debug) { console.log('Running FFmpeg'); } },
          onProgress: (message) => { if (debug) { console.log(message); } },
          onFailure: (message) => {
            if (debug) { console.log(message); }
            if (callback) { callback(message); }
            return;
          },
          onSuccess: (message) => {
            if (debug) { console.log('Successfully run FFmpeg'); }
            if (callback) { callback(); }
            return;
          },
          onFinish: () => {
            if (callback) { callback(); }
            return;
          }
        });
        try {
          ffmpeg.execute(command, new ExecuteBinaryResponseHandler());
        } catch (e) {
          if (callback) { callback(`Could not execute: ${command.join(' ')}`); }
          return;
        }
      }).catch(() => { if (callback) { callback('Permissions denied'); } });
  }
}