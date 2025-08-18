import React, { useState } from 'react';
import { Flex, Alert, Button } from '@aws-amplify/ui-react';

export const FeedbackExamples: React.FC = () => {
     const [visible, setVisible] = useState(true);
     return (
          <Flex direction="column" gap="1rem">
               <Button onClick={() => setVisible((v) => !v)}>
                    Toggle Alerts
               </Button>
               {visible && (
                    <Flex direction="column" gap="0.75rem">
                         <Alert
                              variation="info"
                              isDismissible={true}
                              heading="Info Alert"
                         >
                              General informational message.
                         </Alert>
                         <Alert variation="success" heading="Success Alert">
                              Action completed successfully.
                         </Alert>
                         <Alert variation="warning" heading="Warning Alert">
                              Something may require attention.
                         </Alert>
                         <Alert variation="error" heading="Error Alert">
                              An error occurred.
                         </Alert>
                    </Flex>
               )}
          </Flex>
     );
};
