import React, { useEffect } from 'react';
import { Form, Input, Select, Radio, Button, Space, InputNumber } from 'antd';
import { useFieldStrategy } from '../context/FieldStrategyContext';

const { Option } = Select;
const { TextArea } = Input;

const Sidebar = ({ onDownload }) => {
  const { strategy, updateStrategy, updateFielderName, resetFielders } =
    useFieldStrategy();
  const [form] = Form.useForm();

  // Set initial form values from context strategy when component mounts or strategy changes
  // This useEffect will now ONLY set values for non-fielder-name fields.
  // Fielder names are controlled directly on their Input components.
  useEffect(() => {
    const formValuesToSet = {
      fieldPlacementName: strategy.fieldPlacementName,
      teamName: strategy.teamName,
      batsmanHand: strategy.batsmanHand,
      bowlerType: strategy.bowlerType,
      wicketkeeperName: strategy.wicketkeeperName,
      bowlerName: strategy.bowlerName,
      fieldStrategy: strategy.fieldStrategy,
      matchFormat: strategy.matchFormat,
      customOvers: strategy.customOvers,
      scenarioNotes: strategy.scenarioNotes,
      // Fielder names are now controlled directly on the Input,
      // so no need to map them into form.setFieldsValue here.
      // However, if you want 'reset' to also clear fielder names,
      // you might still want to include them here or handle them in resetFielders.
      // For now, let's remove them from here as they are directly controlled.
    };
    form.setFieldsValue(formValuesToSet);
    console.log(
      'Sidebar useEffect: Setting form values (excluding fielders):',
      formValuesToSet
    ); // Add for debugging
  }, [strategy, form]); // Re-run effect if strategy or form instance changes

  // Handler for general form value changes (Ant Design's onValuesChange)
  // This will now ONLY handle non-fielder-name fields.
  const handleValuesChange = (changedValues, allValues) => {
    console.group('Sidebar onValuesChange triggered'); // Debug Group
    console.log('Changed values:', changedValues); // Debug
    console.log('All current form values:', allValues); // Debug

    for (const key in changedValues) {
      // Fielder names are now handled by their individual Input's onChange,
      // so we explicitly skip them here.
      if (!key.startsWith('fielderName-')) {
        console.log(
          `Updating general strategy key '${key}' with value: '${changedValues[key]}'`
        ); // Debug
        updateStrategy(key, changedValues[key]);
      }
    }
    console.groupEnd(); // Debug Group
  };

  // NEW: Handler for individual fielder name changes
  const handleFielderNameChange = (fielderId, e) => {
    const newName = e.target.value;
    console.log(
      `Direct Input Change: Fielder ${fielderId} name to: '${newName}'`
    ); // Debug
    updateFielderName(fielderId, newName);
    // Also manually update the form's internal state for this specific field
    // This is crucial to keep Ant Design's form validation/state in sync
    form.setFieldsValue({ [`fielderName-${fielderId}`]: newName });
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '30px',
          color: '#333',
          marginTop: '-10px',
        }}
      >
        Cricket Field Strategizer Controls
      </h2>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange} // Handle changes to update context for non-fielder fields
      >
        <Form.Item label="Field Placement Name" name="fieldPlacementName">
          <Input placeholder="e.g., T20 Death Overs vs. Finisher" />
        </Form.Item>

        <Form.Item label="Your Team Name" name="teamName">
          <Input placeholder="e.g., Delhi Capitals" />
        </Form.Item>

        <Form.Item label="Batsman Hand" name="batsmanHand">
          <Radio.Group>
            <Radio value="Right-Handed">Right-Handed</Radio>
            <Radio value="Left-Handed">Left-Handed</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Bowler Type" name="bowlerType">
          <Select>
            <Option value="Right-Arm Fast">Right-Arm Fast</Option>
            <Option value="Right-Arm Medium">Right-Arm Medium</Option>
            <Option value="Right-Arm Spin (Off-break)">
              Right-Arm Spin (Off-break)
            </Option>
            <Option value="Right-Arm Spin (Leg-break)">
              Right-Arm Spin (Leg-break)
            </Option>
            <Option value="Left-Arm Fast">Left-Arm Fast</Option>
            <Option value="Left-Arm Medium">Left-Arm Medium</Option>
            <Option value="Left-Arm Spin (Orthodox)">
              Left-Arm Spin (Orthodox)
            </Option>
            <Option value="Left-Arm Spin (Chinaman)">
              Left-Arm Spin (Chinaman)
            </Option>
          </Select>
        </Form.Item>

        <Form.Item label="Wicketkeeper Name" name="wicketkeeperName">
          <Input placeholder="e.g., MS Dhoni" />
        </Form.Item>

        <Form.Item label="Bowler Name" name="bowlerName">
          <Input placeholder="e.g., Jasprit Bumrah" />
        </Form.Item>

        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            marginTop: '16px',
            marginBottom: '8px',
            color: '#555',
          }}
        >
          Fielder Names
        </h3>
        {strategy.fielders.map((fielder, index) => (
          <Form.Item
            key={fielder.id}
            label={`Fielder ${index + 1} Name`}
            name={`fielderName-${fielder.id}`} // Keep name for form.setFieldsValue in handleFielderNameChange
          >
            <Input
              value={fielder.name} // Explicitly control the value from state
              onChange={(e) => handleFielderNameChange(fielder.id, e)} // Direct onChange handler
              placeholder={`e.g., ${fielder.name}`}
            />
          </Form.Item>
        ))}

        <Form.Item label="Field Strategy" name="fieldStrategy">
          <Radio.Group>
            <Radio value="Attacking">Attacking</Radio>
            <Radio value="Defensive">Defensive</Radio>
            <Radio value="Standard">Standard</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Match Format" name="matchFormat">
          <Select
            onChange={(value) => {
              updateStrategy('matchFormat', value);
              if (value !== 'Custom') {
                updateStrategy('customOvers', null);
              }
            }}
          >
            <Option value="Test Match">Test Match</Option>
            <Option value="ODI (50 Overs)">ODI (50 Overs)</Option>
            <Option value="T20 (20 Overs)">T20 (20 Overs)</Option>
            <Option value="Custom">Custom</Option>
          </Select>
        </Form.Item>

        {strategy.matchFormat === 'Custom' && (
          <Form.Item label="Custom Overs" name="customOvers">
            <InputNumber
              min={1}
              placeholder="Enter number of overs"
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}

        <Form.Item label="Scenario Notes" name="scenarioNotes">
          <TextArea
            rows={4}
            placeholder="Add specific instructions, target areas, or tactical thoughts..."
          />
        </Form.Item>

        <Space
          style={{
            marginTop: '24px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="default"
            onClick={resetFielders}
            style={{ flex: 1, marginRight: '8px' }}
          >
            Reset Fielders
          </Button>
          <Button
            type="primary"
            onClick={() => onDownload('png')}
            style={{ flex: 1, marginLeft: '8px' }}
          >
            Download Field (PNG)
          </Button>
        </Space>
        <Button
          type="primary"
          onClick={() => onDownload('jpeg')}
          style={{ width: '100%', marginTop: '8px' }}
        >
          Download Field (JPG)
        </Button>
      </Form>
    </div>
  );
};

export default Sidebar;
