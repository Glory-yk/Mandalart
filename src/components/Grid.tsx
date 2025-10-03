import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Cell from './Cell';

interface GridProps {
  gridData: string[][];
  onCellChange: (row: number, col: number, value: string) => void;
  onCellClick: (row: number, col: number) => void;
  onGridDoubleClick?: () => void;
  selectedCell: { row: number; col: number } | null;
}

const Grid: React.FC<GridProps> = ({ gridData, onCellChange, onCellClick, onGridDoubleClick, selectedCell }) => {
  return (
    <div style={{ width: '336px' }} onDoubleClick={onGridDoubleClick}>
      {gridData.map((row, rowIndex) => (
        <Row key={rowIndex} className="no-gutters">
          {row.map((cellValue, colIndex) => (
            <Col key={colIndex} onClick={() => onCellClick(rowIndex, colIndex)} style={{ padding: '0' }}>
              <Cell
                value={cellValue}
                onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)}
                isCenter={rowIndex === 1 && colIndex === 1}
                isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
              />
            </Col>
          ))}
        </Row>
      ))}
    </div>
  );
};

export default Grid;