import { Common } from './ffmpeg.common';
export declare class FFmpeg extends Common {
  static execute(command: string | Array<string>, debug?: boolean): Promise<any>;
}
