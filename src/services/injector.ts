type ServiceType<T> = new (...args: any[]) => T;

export class Injector {
    private static instances = new Map<string, any>();
    private static factories = new Map<string, () => any>();

    static registerSingleton<T>(serviceClass: ServiceType<T>): void {
        if (!this.instances.has(serviceClass.name)) {
            const instance = this.instantiate(serviceClass);
            this.instances.set(serviceClass.name, instance);
        }
    }

    static registerFactory<T>(serviceClass: ServiceType<T>, factory: () => T): void {
        this.factories.set(serviceClass.name, factory);
    }

    static get<T>(serviceClass: ServiceType<T>): T {
        if (this.instances.has(serviceClass.name)) {
            return this.instances.get(serviceClass.name);
        }
        if (this.factories.has(serviceClass.name)) {
            return this.factories.get(serviceClass.name)!();
        }

        const instance = this.instantiate(serviceClass);
        this.instances.set(serviceClass.name, instance);
        return instance;
    }

    private static instantiate<T>(serviceClass: ServiceType<T>): T {
        return new serviceClass();
    }

    static reset(): void {
        this.instances.clear();
        this.factories.clear();
    }
}