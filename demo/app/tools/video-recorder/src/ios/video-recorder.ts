import { Color } from 'tns-core-modules/color';
import * as fs from 'tns-core-modules/file-system';
import { layout, Property, View } from 'tns-core-modules/ui/core/view';
import * as frame from 'tns-core-modules/ui/frame';
import * as types from 'tns-core-modules/utils/types';
import '../async-await';

let listener;
export class VideoRecorder {
  public record(
    options = {
      saveToGallery: false,
      hd: false,
      format: 'default',
      position: 'back',
      size: 0,
      duration: 0
    }
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      listener = null;
      const picker = UIImagePickerController.new();
      const sourceType = UIImagePickerControllerSourceType.Camera;
      picker.mediaTypes = <any>[kUTTypeMovie];
      picker.sourceType = sourceType;
      options.saveToGallery = Boolean(options.saveToGallery) ? true : false;
      options.hd = Boolean(options.hd) ? true : false;
      picker.cameraCaptureMode = UIImagePickerControllerCameraCaptureMode.Video;

      picker.allowsEditing = false;
      picker.videoQuality = options.hd
        ? UIImagePickerControllerQualityType.TypeHigh
        : UIImagePickerControllerQualityType.TypeLow;

      picker.videoMaximumDuration =
        types.isNumber(options.duration) && options.duration > 0
          ? Number(options.duration)
          : Number.POSITIVE_INFINITY;

      if (options && options.saveToGallery) {
        const authStatus = PHPhotoLibrary.authorizationStatus();
        if (authStatus === PHAuthorizationStatus.Authorized) {
          options.saveToGallery = true;
        }
      }

      if (options) {
        listener = UIImagePickerControllerDelegateImpl.initWithOwnerCallbackOptions(
          new WeakRef(this),
          resolve,
          options
        );
      } else {
        listener = UIImagePickerControllerDelegateImpl.initWithCallback(
          resolve
        );
      }

      picker.delegate = listener;
      picker.modalPresentationStyle = UIModalPresentationStyle.CurrentContext;

      const topMostFrame = frame.topmost();
      if (topMostFrame) {
        const viewController =
          topMostFrame.currentPage && topMostFrame.currentPage.ios;
        if (viewController) {
          viewController.presentViewControllerAnimatedCompletion(
            picker,
            true,
            null
          );
        }
      }
    });
  }
}
export type VideoFormat = 'default' | 'mp4';
class UIImagePickerControllerDelegateImpl extends NSObject
  implements UIImagePickerControllerDelegate {
    /* tslint:disable */
  public static ObjCProtocols = [UIImagePickerControllerDelegate];
  /* tslint:enable */
  private _saveToGallery: boolean;
  private _callback: (result?) => void;
  private _format: VideoFormat = 'default';
  private _hd: boolean;
  public static initWithCallback(
    callback: (result?) => void
  ): UIImagePickerControllerDelegateImpl {
    const delegate = new UIImagePickerControllerDelegateImpl();
    delegate._callback = callback;

    return delegate;
  }
  public static initWithOwnerCallbackOptions(
    owner: any /*WeakRef<VideoRecorder>*/,
    callback: (result?) => void,
    options?: any
  ): UIImagePickerControllerDelegateImpl {
    const delegate = new UIImagePickerControllerDelegateImpl();
    if (options) {
      delegate._saveToGallery = options.saveToGallery;
      delegate._format = options.format;
      delegate._hd = options.hd;
    }
    delegate._callback = callback;

    return delegate;
  }
  imagePickerControllerDidCancel(picker: any /*UIImagePickerController*/) {
    picker.presentingViewController.dismissViewControllerAnimatedCompletion(
      true,
      null
    );
    listener = null;
  }

  imagePickerControllerDidFinishPickingMediaWithInfo(
    picker: any /*UIImagePickerController*/,
    info: any /*NSDictionary<string, any>*/
  ) {
    if (info) {
      const currentDate: Date = new Date();
      if (this._saveToGallery) {
        const source = info.objectForKey(UIImagePickerControllerMediaURL);
        if (this._format === 'mp4') {
          const asset = AVAsset.assetWithURL(source);
          const preset = this._hd
            ? AVAssetExportPresetHighestQuality
            : AVAssetExportPresetLowQuality;
          const session = AVAssetExportSession.exportSessionWithAssetPresetName(
            asset,
            preset
          );
          session.outputFileType = AVFileTypeMPEG4;
          const fileName = `VID_${+new Date()}.mp4`;
          const path = fs.path.join(fs.knownFolders.documents().path, fileName);
          const nativePath = NSURL.fileURLWithPath(path);
          session.outputURL = nativePath;
          session.exportAsynchronouslyWithCompletionHandler(() => {
            const assetLibrary = ALAssetsLibrary.alloc().init();
            assetLibrary.writeVideoAtPathToSavedPhotosAlbumCompletionBlock(
              nativePath,
              (file, error) => {
                if (!error) {
                  this._callback({ file: file.path });
                }
                fs.File.fromPath(path).remove();
              }
            );
          });
        } else {
          const assetLibrary = ALAssetsLibrary.alloc().init();
          assetLibrary.writeVideoAtPathToSavedPhotosAlbumCompletionBlock(
            source,
            (file, error) => {
              if (!error) {
                this._callback();
              } else {
                console.log(error.localizedDescription);
              }
            }
          );
        }
      } else {
        const source = info.objectForKey(UIImagePickerControllerMediaURL);
        if (this._format === 'mp4') {
          const asset = AVAsset.assetWithURL(source);
          const preset = this._hd
            ? AVAssetExportPresetHighestQuality
            : AVAssetExportPresetLowQuality;
          const session = AVAssetExportSession.exportSessionWithAssetPresetName(
            asset,
            preset
          );
          session.outputFileType = AVFileTypeMPEG4;
          const fileName = `videoCapture_${+new Date()}.mp4`;
          const path = fs.path.join(fs.knownFolders.documents().path, fileName);
          const nativePath = NSURL.fileURLWithPath(path);
          session.outputURL = nativePath;
          session.exportAsynchronouslyWithCompletionHandler(() => {
            fs.File.fromPath(source.path).remove();
            this._callback({ file: path });
          });
        } else {
          this._callback({ file: source.path });
        }
      }
      picker.presentingViewController.dismissViewControllerAnimatedCompletion(
        true,
        null
      );
      listener = null;
    }
  }
}
export type CameraPosition = 'front' | 'back';
export const requestPermissions = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const authStatus = PHPhotoLibrary.authorizationStatus();
    if (authStatus === PHAuthorizationStatus.NotDetermined) {
      PHPhotoLibrary.requestAuthorization((auth) => {
        if (auth === PHAuthorizationStatus.Authorized) {
          resolve();
        }
      });
    } else if (authStatus !== PHAuthorizationStatus.Authorized) {
      reject();
    }
  });
};
