import React, { ReactNode } from 'react';
import { Flex, Heading, Divider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import {
     ButtonExamples,
     FormExamples,
     DataDisplayExamples,
     FeedbackExamples,
     LayoutExamples,
     NavigationExamples,
} from '../examples';

const Section: React.FC<{ title: string; children: ReactNode }> = ({
     title,
     children,
}) => (
     <Flex direction="column" gap="0.75rem" padding="1.5rem" as="section">
          <Heading level={3}>{title}</Heading>
          {children}
          <Divider />
     </Flex>
);

const KitchenSink = () => (
     <Flex
          direction="column"
          gap="1rem"
          padding="1rem"
          maxWidth="1200px"
          margin="0 auto"
     >
          <Heading level={2}>Amplify Theme Manager Kitchen Sink</Heading>
          <Section title="Buttons">
               <ButtonExamples />
          </Section>
          <Section title="Form Fields">
               <FormExamples />
          </Section>
          <Section title="Data Display">
               <DataDisplayExamples />
          </Section>
          <Section title="Feedback">
               <FeedbackExamples />
          </Section>
          <Section title="Layout">
               <LayoutExamples />
          </Section>
          <Section title="Navigation">
               <NavigationExamples />
          </Section>
     </Flex>
);

export default KitchenSink;
