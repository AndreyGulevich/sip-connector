import getMediaStream from '../utils/getMediaStream';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import VideoPlayer from '../VideoPlayer';
import { createEvents } from './events';

import type { TEvents, TState } from './events';

/**
 * Класс для управления MediaStream
 * Инициализирует и управляет медиа-потоком с помощью getUserMedia
 */
export class LocalMediaStreamManager {
  private readonly state: TState = { isEnabledCam: false, isEnabledMic: false };

  private mediaStream: MediaStream | undefined = undefined;

  private videoPlayer: VideoPlayer | undefined = undefined;

  private readonly events: TEvents;

  public constructor() {
    this.events = createEvents();
  }

  /**
   * Инициализирует MediaStream
   * @returns Promise с MediaStream
   */
  public async initialize(): Promise<MediaStream> {
    if (this.mediaStream) {
      return this.mediaStream;
    }

    this.mediaStream = await getMediaStream();

    if (this.videoPlayer) {
      this.videoPlayer.setStream(this.mediaStream);
    }

    this.state.isEnabledCam = true;
    this.state.isEnabledMic = true;

    return this.mediaStream;
  }

  /**
   * Возвращает текущий MediaStream
   */
  public getStream(): MediaStream | undefined {
    return this.mediaStream;
  }

  /**
   * Подключает VideoPlayer для отображения потока
   */
  public setVideoPlayer(videoPlayer: VideoPlayer): void {
    this.videoPlayer = videoPlayer;

    if (this.mediaStream) {
      videoPlayer.setStream(this.mediaStream);
    }
  }

  /**
   * Останавливает все треки в MediaStream
   */
  public stop(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });

      this.mediaStream = undefined;

      if (this.videoPlayer) {
        this.videoPlayer.clear();
      }
    }
  }

  /**
   * Останавливает конкретный трек по типу
   */
  public stopTrack(kind: 'audio' | 'video'): void {
    if (this.mediaStream) {
      const tracks =
        kind === 'audio' ? this.mediaStream.getAudioTracks() : this.mediaStream.getVideoTracks();

      tracks.forEach((track) => {
        track.stop();
      });
    }
  }

  /**
   * Проверяет, инициализирован ли MediaStream
   */
  public isInitialized(): boolean {
    return this.mediaStream !== undefined;
  }

  /**
   * Получает активные треки по типу
   */
  public getTracks(kind?: 'audio' | 'video'): MediaStreamTrack[] {
    if (!this.mediaStream) {
      return [];
    }

    if (kind === 'audio') {
      return this.mediaStream.getAudioTracks();
    }

    if (kind === 'video') {
      return this.mediaStream.getVideoTracks();
    }

    return this.mediaStream.getTracks();
  }

  /**
   * Включает камеру
   */
  public enableCamera({ silent = false }: { silent?: boolean }): boolean {
    console.log(
      '🚀 temp  ~ LocalMediaStreamManager.ts:126 ~ LocalMediaStreamManager ~ enableCamera ~ silent:',
      { silent },
      this.isEnabledCam(),
    );

    if (this.isEnabledCam()) {
      return false;
    }

    if (!this.mediaStream) {
      throw new Error('MediaStream не инициализирован');
    }

    const { mediaStream } = { mediaStream: this.mediaStream };
    const videoTracks = mediaStream.getVideoTracks();

    // Если трек есть и он активен, просто размучиваем его
    if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
      for (const track of videoTracks) {
        track.enabled = true;
      }

      this.state.isEnabledCam = true;

      if (!silent) {
        console.log(
          '🚀 temp  ~ LocalMediaStreamManager.ts:153 ~ LocalMediaStreamManager ~ enableCamera ~ this.state:',
          this.state,
        );
        this.events.emit('cam:enable', this.state);
      }
    }

    return true;
  }

  /**
   * Выключает камеру
   */
  public disableCamera({ silent = false }: { silent?: boolean }): boolean {
    if (!this.mediaStream || !this.isEnabledCam()) {
      return false;
    }

    const { mediaStream } = { mediaStream: this.mediaStream };
    const videoTracks = mediaStream.getVideoTracks();

    for (const track of videoTracks) {
      track.enabled = false;
    }

    this.state.isEnabledCam = false;

    if (!silent) {
      this.events.emit('cam:disable', this.state);
    }

    return true;
  }

  /**
   * Включает микрофон
   */
  public enableMic({ silent = false }: { silent?: boolean }): boolean {
    if (this.isEnabledMic()) {
      return false;
    }

    if (!this.mediaStream) {
      throw new Error('MediaStream не инициализирован');
    }

    const { mediaStream } = { mediaStream: this.mediaStream };
    const audioTracks = mediaStream.getAudioTracks();

    // Если трек есть и он активен, просто размучиваем его
    if (audioTracks.length > 0 && audioTracks[0].readyState === 'live') {
      for (const track of audioTracks) {
        track.enabled = true;
      }

      this.state.isEnabledMic = true;

      if (!silent) {
        this.events.emit('mic:enable', this.state);
      }
    }

    return true;
  }

  /**
   * Выключает микрофон
   */
  public disableMic({ silent = false }: { silent: boolean }): boolean {
    if (!this.mediaStream || !this.isEnabledMic()) {
      return false;
    }

    const { mediaStream } = { mediaStream: this.mediaStream };
    const audioTracks = mediaStream.getAudioTracks();

    for (const track of audioTracks) {
      track.enabled = false;
    }

    this.state.isEnabledMic = false;

    if (!silent) {
      this.events.emit('mic:disable', this.state);
    }

    return true;
  }

  /**
   * Проверяет, включена ли камера
   */
  public isEnabledCam(): boolean {
    if (!this.mediaStream) {
      return false;
    }

    return this.state.isEnabledCam;
  }

  /**
   * Проверяет, включен ли микрофон
   */
  public isEnabledMic(): boolean {
    if (!this.mediaStream) {
      return false;
    }

    return this.state.isEnabledMic;
  }

  /**
   * Обрабатывает переключение камеры
   */
  public toggleCamera(): void {
    const isEnabledCam = this.isEnabledCam();

    if (isEnabledCam) {
      this.disableCamera({ silent: false });
    } else {
      this.enableCamera({ silent: false });
    }
  }

  /**
   * Обрабатывает переключение микрофона
   */
  public toggleMic(): void {
    const isEnabledMic = this.isEnabledMic();

    if (isEnabledMic) {
      this.disableMic({ silent: false });
    } else {
      this.enableMic({ silent: false });
    }
  }

  public enableAll(): void {
    const isEnabledCamera = this.enableCamera({ silent: true });
    const isEnabledMic = this.enableMic({ silent: true });

    if (isEnabledCamera || isEnabledMic) {
      this.events.emit('enable-all', this.state);
    }
  }

  public disableAll(): void {
    const isDisabledCamera = this.disableCamera({ silent: true });
    const isDisabledMic = this.disableMic({ silent: true });

    if (isDisabledCamera || isDisabledMic) {
      this.events.emit('disable-all', this.state);
    }
  }

  public onMediaStateChange(handler: (state: TState) => void): void {
    this.events.on('cam:enable', handler);
    this.events.on('cam:disable', handler);

    this.events.on('mic:enable', handler);
    this.events.on('mic:disable', handler);

    this.events.on('enable-all', handler);
    this.events.on('disable-all', handler);
  }
}
