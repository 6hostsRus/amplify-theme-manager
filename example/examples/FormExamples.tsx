import React, { useState } from 'react';
import {
     Flex,
     TextField,
     PasswordField,
     TextAreaField,
     SelectField,
     CheckboxField,
     RadioGroupField,
     Radio,
     SwitchField,
     SliderField,
     StepperField,
     PhoneNumberField,
     SearchField,
     Autocomplete,
} from '@aws-amplify/ui-react';

export const FormExamples: React.FC = () => {
     const [value, setValue] = useState('');
     const fruitOptions = [
          { id: 'apple', label: 'Apple' },
          { id: 'banana', label: 'Banana' },
          { id: 'cherry', label: 'Cherry' },
     ];
     return (
          <Flex direction="column" gap="1.5rem">
               <TextField
                    label="TextField"
                    descriptiveText="Standard text input"
                    placeholder="Type here"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    hasError={value.length > 12}
                    errorMessage="Max 12 chars"
                    isRequired
               />
               <PasswordField label="PasswordField" placeholder="Password" />
               <TextAreaField
                    label="TextAreaField"
                    rows={3}
                    descriptiveText="Multiline input"
                    placeholder="Enter description"
               />
               <PhoneNumberField
                    label="PhoneNumberField"
                    defaultDialCode="+1"
               />
               <SelectField label="SelectField" placeholder="Choose one">
                    <option value="a">Option A</option>
                    <option value="b" disabled>
                         Option B (disabled)
                    </option>
                    <option value="c">Option C</option>
               </SelectField>
               <CheckboxField
                    label="CheckboxField (default checked)"
                    name="check1"
                    value="yes"
                    defaultChecked
               />
               <RadioGroupField legend="RadioGroupField" name="radioGroup">
                    <Radio value="one">One</Radio>
                    <Radio value="two">Two</Radio>
               </RadioGroupField>
               <SwitchField label="SwitchField (on)" defaultChecked />
               <SliderField
                    label="SliderField"
                    min={0}
                    max={100}
                    step={5}
                    defaultValue={50}
                    isDisabled={false}
                    orientation="horizontal"
                    isValueHidden={false}
               />
               <StepperField
                    label="StepperField"
                    min={0}
                    max={10}
                    step={1}
                    defaultValue={3}
                    isDisabled={false}
               />
               <SearchField label="SearchField" placeholder="Search here" />
               <Autocomplete label="Autocomplete" options={fruitOptions} />
          </Flex>
     );
};
