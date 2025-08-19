import React, { useState } from 'react';
import {
     Button,
     ButtonGroup,
     Flex,
     ToggleButton,
     ToggleButtonGroup,
} from '@aws-amplify/ui-react';

export const ButtonExamples: React.FC = () => {
     const [loading, setLoading] = useState(false);
     const [alignment, setAlignment] = useState('left');
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
               </Flex>
               <Flex wrap="wrap" gap="0.5rem">
                    <Button width="100%">Full Width</Button>
               </Flex>
               <ButtonGroup>
                    <Button>First</Button>
                    <Button>Second</Button>
               </ButtonGroup>
               <ToggleButtonGroup
                    value={alignment}
                    isExclusive
                    onChange={(value) => setAlignment(value as string)}
               >
                    <ToggleButton value="left">Left</ToggleButton>
                    <ToggleButton value="center">Center</ToggleButton>
                    <ToggleButton value="right">Right</ToggleButton>
               </ToggleButtonGroup>
          </Flex>
     );
};
