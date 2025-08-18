import React from 'react';
import { Button, Card, Flex, Text, View, Rating } from '@aws-amplify/ui-react';
import KitchenSink from './KitchenSink';

export default function App() {
     return (
          <View padding="1rem">
               <Flex direction="column" gap="1rem">
                    <Text as="h1">Amplify Theme Manager – Playground</Text>
                    <Card>
                         <Flex gap="1rem" alignItems="center">
                              <Button variation="primary">Primary</Button>
                              <Button variation="link">Link</Button>
                              <Rating value={4} maxValue={5} />
                         </Flex>
                    </Card>
                    <KitchenSink />
               </Flex>
          </View>
     );
}
