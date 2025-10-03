import React, { useRef } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Grid from './components/Grid';
import SubGoalDetail from './components/SubGoalDetail';
import MasterCalendar from './components/MasterCalendar';
import StatisticsPage from './components/StatisticsPage';
import { useGrid } from './context/GridContext';

const MainPage: React.FC = () => {
  const { 
    gridStack, 
    currentGridState,
    allEvents,
    loadDataFromFile,
    handleMainGridChange, 
    handleSubGridChange, 
    handleGridDoubleClick,
    handleBack,
    colorMap
  } = useGrid();
  
  const navigate = useNavigate();
  const { mainGrid, subGrids } = currentGridState;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        loadDataFromFile(text);
      }
    };
    reader.readAsText(file);
    // Reset the file input value to allow loading the same file again
    event.target.value = '';
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveData = () => {
    const dataToSave = {
      gridStack,
      allEvents,
    };
    const jsonString = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mandalArt_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

    return (

      <>

        <input

          type="file"

          ref={fileInputRef}

          style={{ display: 'none' }}

          accept=".json"

          onChange={handleFileLoad}

        />

        <Container fluid className="mt-4">

          <Row className="justify-content-center mb-4">

            <Col xs="auto" className="d-flex align-items-center">

              {gridStack.length > 1 && <Button onClick={handleBack} className="mb-3 me-3">Back</Button>}

              <h1 className="text-center mb-0">Mandal-Art</h1>

              <Button variant="primary" onClick={handleLoadClick} className="ms-4">Load Data</Button>

              <Button variant="success" onClick={handleSaveData} className="ms-2">Save Data</Button>

              <Button variant="secondary" onClick={() => navigate('/calendar')} className="ms-2">Calendar</Button>

              <Button variant="info" onClick={() => navigate('/statistics')} className="ms-2">Statistics</Button>

            </Col>

          </Row>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '1rem', justifyContent: 'center' }}>
          {[0, 1, 2].map(metaRow =>
            [0, 1, 2].map(metaCol => {
              const key = `${metaRow}-${metaCol}`;
              if (metaRow === 1 && metaCol === 1) {
                return (
                  <div key={key}>
                    <h5 className="text-center text-muted">{mainGrid[1][1] || 'Main Goal'}</h5>
                    <Grid
                      gridData={mainGrid}
                      onCellChange={handleMainGridChange}
                      onCellClick={() => {}}
                      selectedCell={null}
                    />
                  </div>
                );
              }
              const subGridData = subGrids[key];
              return (
                <div key={key} style={{ backgroundColor: colorMap[key], padding: '1rem', borderRadius: '0.5rem' }}>
                  <h5 className="text-center text-muted">{mainGrid[metaRow][metaCol] || 'Sub-Goal'}</h5>
                  <Grid
                    gridData={subGridData}
                    onCellChange={(r, c, v) => handleSubGridChange(key, r, c, v)}
                    onCellClick={() => {}}
                    onGridDoubleClick={() => handleGridDoubleClick(key, navigate)}
                    selectedCell={null}
                  />
                </div>
              );
            })
          )}
        </div>
      </Container>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/subgoal/:subGridKey" element={<SubGoalDetail />} />
        <Route path="/calendar" element={<MasterCalendar />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>
    </Router>
  );
};

export default App;