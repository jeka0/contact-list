import { ToastContainerComponent } from '../components/toast-container-component/toast-container-component';

export class ToastService {
    showSuccessToast(message: string){
        const toastContainer: ToastContainerComponent | null = document.querySelector('toast-container');
        if (toastContainer) {
            toastContainer.show({ message, type: 'success' });
        }
    }

    showErrorToast(message: string){
        const toastContainer: ToastContainerComponent | null = document.querySelector('toast-container');
        if (toastContainer) {
            toastContainer.show({ message, type: 'error' });
        }
    }
}