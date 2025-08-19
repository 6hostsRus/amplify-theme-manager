import React from 'react';
import { ThemeProvider } from '@aws-amplify/ui-react';
import { useThemeManager } from './react';

export function AmplifyManagedProvider({ children }: React.PropsWithChildren) {
     const tm = useThemeManager();
     const [, force] = React.useState(0);
     React.useEffect(() => tm.subscribe(() => force((x) => x + 1)), [tm]);
     return <ThemeProvider theme={tm.get()}>{children}</ThemeProvider>;
}
