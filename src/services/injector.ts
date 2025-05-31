type ServiceType<T> = new (...args: any[]) => T;

export class Injector {
    private static instances = new Map<ServiceType<any>, any>();
    private static factories = new Map<ServiceType<any>, () => any>();

    static registerSingleton<T>(serviceClass: ServiceType<T>): void {
        if (!this.instances.has(serviceClass)) {
            const instance = this.instantiate(serviceClass);
            this.instances.set(serviceClass, instance);
        }
    }

    static registerFactory<T>(serviceClass: ServiceType<T>, factory: () => T): void {
        this.factories.set(serviceClass, factory);
    }


    static get<T>(serviceClass: ServiceType<T>): T {
        if (this.instances.has(serviceClass)) {
            return this.instances.get(serviceClass);
        }

        if (this.factories.has(serviceClass)) {
            return this.factories.get(serviceClass)!();
        }
        return this.instantiate(serviceClass);
    }

    private static instantiate<T>(serviceClass: ServiceType<T>): T {
        return new serviceClass();
    }

    static reset(): void {
        this.instances.clear();
        this.factories.clear();
    }
}