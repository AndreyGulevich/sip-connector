# Компоненты SIP Connector

Детальное описание всех менеджеров и их внутренних компонентов.

Документация разбита по отдельным файлам для каждого компонента:

## Основные менеджеры

- [ConnectionManager](./components/ConnectionManager.md) - Управление SIP-соединениями и регистрацией на сервере
- [ConnectionQueueManager](./components/ConnectionQueueManager.md) - Очередь операций подключения
- [AutoConnectorManager](./components/AutoConnectorManager.md) - Автоматическое переподключение
- [CallManager](./components/CallManager.md) - Управление WebRTC-звонками
- [ApiManager](./components/ApiManager.md) - Обработка SIP INFO сообщений и взаимодействие с сервером
- [PresentationManager](./components/PresentationManager.md) - Управление демонстрацией экрана
- [IncomingCallManager](./components/IncomingCallManager.md) - Обработка входящих SIP-звонков

## Вспомогательные компоненты

- [StatsManager](./components/StatsManager.md) - Сбор и мониторинг WebRTC статистики
- [MainStreamHealthMonitor](./components/MainStreamHealthMonitor.md) - Мониторинг здоровья видеопотока
- [MainStreamRecovery](./components/MainStreamRecovery.md) - Восстановление видеопотока
- [VideoSendingBalancerManager](./components/VideoSendingBalancerManager.md) - Балансировка видео
