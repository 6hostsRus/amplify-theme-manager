import React from 'react';
import ReactDOM from 'react-dom/client';
import '@aws-amplify/ui-react/styles.css';
import App from './App';
import {
     AmplifyIconsProvider,
     AmplifyThemeManagerProvider,
     createIconsManager,
     DevThemePanelV3,
} from '../../src';

const iconsManager = createIconsManager();

ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
          <AmplifyThemeManagerProvider>
               <AmplifyIconsProvider manager={iconsManager}>
                    <App />
                    {process.env.NODE_ENV !== 'production' && (
                         <DevThemePanelV3 />
                    )}
               </AmplifyIconsProvider>
          </AmplifyThemeManagerProvider>
     </React.StrictMode>
);
