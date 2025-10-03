import React from 'react';
import { Form } from 'react-bootstrap';

interface CellProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCenter: boolean;
  isSelected: boolean;
}

const Cell: React.FC<CellProps> = ({ value, onChange, isCenter, isSelected }) => {
  return (
    <Form.Control
      as="textarea"
      value={value}
      onChange={onChange}
      style={{
        width: '110px',
        height: '110px',
        backgroundColor: isCenter ? '#e0e0e0' : 'white',
        fontWeight: isCenter ? 'bold' : 'normal',
        border: isSelected ? '3px solid #007bff' : '1px solid #ccc',
        borderRadius: '0',
        boxSizing: 'border-box',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        resize: 'none',
        overflow: 'hidden',
      }}
    />
  );
};

export default Cell;