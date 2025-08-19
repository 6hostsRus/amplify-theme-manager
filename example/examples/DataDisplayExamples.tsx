import React from 'react';
import {
     Flex,
     Card,
     Heading,
     Text,
     Badge,
     Divider,
     Tabs,
     Table,
     TableHead,
     TableBody,
     TableRow,
     TableCell,
     Avatar,
     Icon,
     Image,
     Placeholder,
     Rating,
     Collection,
} from '@aws-amplify/ui-react';

export const DataDisplayExamples: React.FC = () => {
     return (
          <Flex direction="column" gap="1.5rem">
               <Flex gap="0.5rem" wrap="wrap">
                    <Badge variation="info">Info</Badge>
                    <Badge variation="success">Success</Badge>
                    <Badge variation="warning">Warning</Badge>
                    <Badge variation="error">Error</Badge>
               </Flex>
               <Flex gap="0.5rem" alignItems="center" wrap="wrap">
                    <Avatar src="https://via.placeholder.com/40" alt="User Avatar" />
                    <Rating value={4} maxValue={5} />
                    <Icon
                         ariaLabel="Star Icon"
                         viewBox={{ minX: 0, minY: 0, width: 24, height: 24 }}
                         paths={[
                              {
                                   d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
                              },
                         ]}
                    />
               </Flex>
               <Image
                    src="https://via.placeholder.com/150x80"
                    alt="Example image"
               />
               <Placeholder width="100%" height="20px" />
               <Collection type="list" items={['One', 'Two', 'Three']}>
                    {(item, index) => <Text key={index}>{item}</Text>}
               </Collection>
               <Card variation="elevated">
                    <Heading level={4}>Card Title</Heading>
                    <Text variation="tertiary">
                         Secondary text inside a card.
                    </Text>
                    <Divider />
                    <Text>
                         Body content with <strong>emphasis</strong>.
                    </Text>
               </Card>
               <Tabs
                    defaultValue="First"
                    items={[
                         {
                              label: 'First',
                              value: 'First',
                              content: 'First tab content.',
                         },
                         {
                              label: 'Second',
                              value: 'Second',
                              content: 'Disabled tab.',
                              isDisabled: true,
                         },
                         {
                              label: 'Third',
                              value: 'Third',
                              content: 'Third tab content.',
                         },
                    ]}
               />
               <Table highlightOnHover variation="striped" size="small">
                    <TableHead>
                         <TableRow>
                              <TableCell as="th">ID</TableCell>
                              <TableCell as="th">Name</TableCell>
                              <TableCell as="th">Status</TableCell>
                         </TableRow>
                    </TableHead>
                    <TableBody>
                         <TableRow>
                              <TableCell>1</TableCell>
                              <TableCell>Alpha</TableCell>
                              <TableCell>
                                   <Badge variation="success">Active</Badge>
                              </TableCell>
                         </TableRow>
                         <TableRow>
                              <TableCell>2</TableCell>
                              <TableCell>Beta</TableCell>
                              <TableCell>
                                   <Badge variation="warning">Pending</Badge>
                              </TableCell>
                         </TableRow>
                         <TableRow isDisabled>
                              <TableCell>3</TableCell>
                              <TableCell>Gamma</TableCell>
                              <TableCell>
                                   <Badge variation="error">Disabled</Badge>
                              </TableCell>
                         </TableRow>
                    </TableBody>
               </Table>
          </Flex>
     );
};
