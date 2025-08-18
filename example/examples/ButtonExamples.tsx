import React, { useState } from 'react';
import { Button, Flex } from '@aws-amplify/ui-react';

export const ButtonExamples: React.FC = () => {
     const [loading, setLoading] = useState(false);
     return (
          <Flex direction="column" gap="1rem">
               <Flex wrap="wrap" gap="0.5rem">
                    <Button>Default</Button>
                    <Button variation="primary">Primary</Button>
                    <Button variation="destructive">Destructive</Button>
                    <Button variation="link">Link</Button>
                    <Button isDisabled>Disabled</Button>
                    <Button variation="warning">Warning</Button>
                    <Button size="small">Small</Button>
                    <Button size="large">Large</Button>
                    <Button
                         loadingText="Loading…"
                         isLoading={loading}
                         onClick={() => {
                              setLoading(true);
                              setTimeout(() => setLoading(false), 1200);
                         }}
                    >
                         Toggle Load
                    </Button>
                    <Button variation="destructive">Destructive</Button>
               </Flex>
               <Flex wrap="wrap" gap="0.5rem">
                    <Button>Full Width</Button>
               </Flex>
          </Flex>
     );
};
