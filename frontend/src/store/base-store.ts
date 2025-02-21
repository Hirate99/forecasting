import EventEmitter from 'events';

type StoreEvents = string;

type StoreEventPlayloads<T extends StoreEvents> = Record<T, unknown>;

export type TStoreSubscriptionPayloads<
  T extends StoreEvents,
  U extends StoreEventPlayloads<T>,
> = {
  [key in T]: U[key];
};

export type TStoreSubscriptionListener<
  T extends StoreEvents,
  U extends StoreEventPlayloads<T>,
> = { [key in T]: (event: TStoreSubscriptionPayloads<T, U>[key]) => void };

export class BaseStore<
  T extends StoreEvents,
  U extends StoreEventPlayloads<T>,
> {
  private emitter = new EventEmitter();

  on<E extends T>(event: E, listener: TStoreSubscriptionListener<T, U>[E]) {
    this.emitter.on(event, listener);
    return () => {
      this.emitter.off(event, listener);
    };
  }

  off<E extends T>(event: E, listener: TStoreSubscriptionListener<T, U>[E]) {
    this.emitter.off(event, listener);
    return this;
  }

  emit<E extends T>(
    event: E,
    payload: TStoreSubscriptionPayloads<T, U>[E],
  ): boolean {
    return this.emitter.emit(event, payload);
  }
}
