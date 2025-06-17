import { useState, useEffect } from 'react';

export const usePWAInstallPrompt = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState(null);

    useEffect(() => {
        const beforeInstallHandler = (event) => {
            console.log('event: ', event);
            event.preventDefault(); // Prevent automatic prompt
            setInstallPromptEvent(event); // Save the event for later
        };

        window.addEventListener('beforeinstallprompt', beforeInstallHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
        };
    }, []);

    return installPromptEvent;
};
