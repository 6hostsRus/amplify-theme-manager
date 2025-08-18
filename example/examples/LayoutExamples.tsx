import React from 'react';
import { Flex, View, Heading, Text } from '@aws-amplify/ui-react';

const boxStyle: React.CSSProperties = {
     backgroundColor: 'var(--amplify-colors-neutral-20)',
     padding: '0.5rem',
     borderRadius: '0.5rem',
     minWidth: '80px',
     textAlign: 'center',
};

export const LayoutExamples: React.FC = () => {
     return (
          <Flex direction="column" gap="1.5rem">
               <Heading level={4}>Flex (row wrap)</Heading>
               <Flex gap="0.5rem" wrap="wrap">
                    {Array.from({ length: 6 }).map((_, i) => (
                         <View key={i} style={boxStyle}>
                              Item {i + 1}
                         </View>
                    ))}
               </Flex>
               <Heading level={5}>Nested Flex (column)</Heading>
               <Flex direction="row" gap="1rem">
                    <Flex direction="column" gap="0.5rem">
                         <Text variation="tertiary">Column A</Text>
                         <View style={boxStyle}>A1</View>
                         <View style={boxStyle}>A2</View>
                    </Flex>
                    <Flex direction="column" gap="0.5rem">
                         <Text variation="tertiary">Column B</Text>
                         <View style={boxStyle}>B1</View>
                         <View style={boxStyle}>B2</View>
                    </Flex>
               </Flex>
          </Flex>
     );
};
