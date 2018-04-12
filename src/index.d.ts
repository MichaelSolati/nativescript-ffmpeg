import { Callback, Common } from './ffmpeg.common';

export { Callback } from './ffmpeg.common';

export declare class FFmpeg extends Common {
  static execute(command: string | Array<string>, callback?: Callback, debug?: boolean): void;
}
