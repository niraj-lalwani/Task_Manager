import React from 'react';
import { usePWAInstallPrompt } from '../hooks/usePWAInstallPrompt';

const InstallButton = () => {
    const installPrompt = usePWAInstallPrompt();
    console.log('installPrompt: ', installPrompt);

    alert("Install Button")

    const handleInstall = () => {
        if (installPrompt) {
            installPrompt.prompt(); // Show install prompt

            installPrompt.userChoice.then((choice) => {
                console.log('User choice:', choice.outcome);
                // 'accepted' or 'dismissed'
            });
        }
    };

    return (
        installPrompt && (
            <button onClick={handleInstall} style={{ padding: '10px 20px', margin: '10px' }}>
                Install App
            </button>
        )
    );
};

export default InstallButton;
