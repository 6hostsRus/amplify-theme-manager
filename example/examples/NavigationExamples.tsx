import React, { useState } from 'react';
import {
    Flex,
    Pagination,
    Breadcrumbs,
    Menu,
    MenuButton,
    MenuItem,
} from '@aws-amplify/ui-react';

export const NavigationExamples: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);

    return (
        <Flex direction="column" gap="1.5rem">
            <Breadcrumbs
                items={[
                    { label: 'Home', href: '#' },
                    { label: 'Library', href: '#library' },
                    { label: 'Data', href: '#data' },
                ]}
            />
            <Menu trigger={<MenuButton>Menu</MenuButton>}>
                <MenuItem>Profile</MenuItem>
                <MenuItem isDisabled>Settings</MenuItem>
                <MenuItem>Sign out</MenuItem>
            </Menu>
            <Pagination
                currentPage={currentPage}
                totalPages={5}
                onChange={(page) => setCurrentPage(page ?? 1)}
            />
        </Flex>
    );
};
