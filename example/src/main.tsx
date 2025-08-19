import React from 'react';
import ReactDOM from 'react-dom/client';
import '@aws-amplify/ui-react/styles.css';
import App from './App';
import {
     AmplifyIconsProvider,
     AmplifyThemeManagerProvider,
     createIconsManager,
     DevThemePanelV3,
     AmplifyManagedProvider,
} from '../../src';
import { defaultTheme } from '@aws-amplify/ui-react';

const iconsManager = createIconsManager();

ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
          <AmplifyThemeManagerProvider initialTheme={defaultTheme}>
               <AmplifyManagedProvider>
                    <AmplifyIconsProvider manager={iconsManager}>
                         <App />
                         {process.env.NODE_ENV !== 'production' && (
                              <DevThemePanelV3 />
                         )}
                    </AmplifyIconsProvider>
               </AmplifyManagedProvider>
          </AmplifyThemeManagerProvider>
     </React.StrictMode>
);
