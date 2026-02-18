import { dom } from '../dom';
import sipConnectorFacade from './sipConnectorFacade';

type TState =
  | {
      role: 'participant';
    }
  | {
      role: 'spectatorSynthetic';
      isAvailableSendingMedia: boolean;
    }
  | {
      role: 'spectator';
      isAvailableSendingMedia: boolean;
    };

/**
 * Тип обработчика изменений роли участника
 */
export type TParticipantRoleHandler = (state?: TState) => void;

/**
 * Класс для управления состоянием роли участника
 * Отслеживает текущую роль участника (участник/зритель) и подписывается на события
 */
class ParticipantRoleManager {
  private state?: TState = undefined;

  private readonly handlers: Set<TParticipantRoleHandler> = new Set<TParticipantRoleHandler>();

  private unsubscribeMoveToSpectatorsSynthetic: (() => void) | undefined = undefined;

  private unsubscribeMoveToSpectators: (() => void) | undefined = undefined;

  private unsubscribeMoveToParticipants: (() => void) | undefined = undefined;

  /**
   * Возвращает текущую роль участника
   */
  public getState(): TState | undefined {
    return this.state;
  }

  /**
   * Подписывается на события изменения роли участника
   */
  public subscribe(): void {
    // Подписываемся на событие перемещения в участники
    this.unsubscribeMoveToParticipants = sipConnectorFacade.on(
      'api:participant:move-request-to-participants',
      () => {
        this.setState({ role: 'participant' });
      },
    );

    // Подписываемся на событие перемещения в зрители для старых серверов
    this.unsubscribeMoveToSpectatorsSynthetic = sipConnectorFacade.on(
      'api:participant:move-request-to-spectators-synthetic',
      ({ isAvailableSendingMedia }) => {
        this.setState({ isAvailableSendingMedia, role: 'spectatorSynthetic' });
      },
    );

    // Подписываемся на событие перемещения в зрители
    this.unsubscribeMoveToSpectators = sipConnectorFacade.on(
      'api:participant:move-request-to-spectators-with-audio-id',
      ({ isAvailableSendingMedia }) => {
        this.setState({ isAvailableSendingMedia, role: 'spectator' });
      },
    );

    this.onChange(this.handleParticipantRoleChange);
  }

  /**
   * Отписывается от событий изменения роли участника
   */
  public unsubscribe(): void {
    if (this.unsubscribeMoveToSpectatorsSynthetic) {
      this.unsubscribeMoveToSpectatorsSynthetic();
      this.unsubscribeMoveToSpectatorsSynthetic = undefined;
    }

    if (this.unsubscribeMoveToSpectators) {
      this.unsubscribeMoveToSpectators();
      this.unsubscribeMoveToSpectators = undefined;
    }

    if (this.unsubscribeMoveToParticipants) {
      this.unsubscribeMoveToParticipants();
      this.unsubscribeMoveToParticipants = undefined;
    }
  }

  /**
   * Подписывается на изменения роли участника
   */
  public onChange(handler: TParticipantRoleHandler): () => void {
    this.handlers.add(handler);

    // Возвращаем функцию для отписки
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Сбрасывает роль участника
   */
  public reset(): void {
    this.setState(undefined);
  }

  /**
   * Устанавливает новую роль участника
   */
  private setState(state?: TState): void {
    if (state === undefined) {
      this.state = undefined;
    } else {
      const currentState = this.state;
      const isRoleChanged = currentState?.role !== state.role;
      const isAvailableSendingMediaChanged =
        (currentState?.role === 'spectatorSynthetic' || currentState?.role === 'spectator') &&
        (state.role === 'spectatorSynthetic' || state.role === 'spectator') &&
        currentState.isAvailableSendingMedia !== state.isAvailableSendingMedia;

      if (isRoleChanged || isAvailableSendingMediaChanged) {
        this.state = state;
        this.notifyHandlers();
      }
    }
  }

  /**
   * Уведомляет всех подписчиков об изменении роли
   */
  private notifyHandlers(): void {
    this.handlers.forEach((handler) => {
      handler(this.state);
    });
  }

  /**
   * Обрабатывает изменения роли участника
   */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  private readonly handleParticipantRoleChange = (state: TState | undefined): void => {
    if (state === undefined) {
      dom.participantRoleElement.textContent = '';

      return;
    }

    const { role } = state;
    let roleText = '';

    switch (role) {
      case 'participant': {
        roleText = 'Участник';

        break;
      }

      case 'spectatorSynthetic': {
        roleText = `Зритель (синтетический) (isAvailableSendingMedia: ${state.isAvailableSendingMedia})`;

        break;
      }

      case 'spectator': {
        roleText = `Зритель (isAvailableSendingMedia: ${state.isAvailableSendingMedia})`;

        break;
      }

      default: {
        roleText = '';
      }
    }

    dom.participantRoleElement.textContent = roleText;
  };
}

export default ParticipantRoleManager;
