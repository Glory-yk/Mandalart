import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Event } from 'react-big-calendar';

// --- TYPES AND INITIAL STATE ---
const initialGrid = (): string[][] => Array(3).fill(null).map(() => Array(3).fill(''));

interface GridState {
  mainGrid: string[][];
  subGrids: Record<string, string[][]>;
}

export interface MyEvent extends Event {
  id: number;
  cellKey: string; // To identify which sub-goal the event belongs to
  subGridKey: string;
}

export interface AllEvents {
  [cellKey: string]: MyEvent[];
}

const initialGridState = (): GridState => ({
  mainGrid: initialGrid(),
  subGrids: {
    ...[0, 1, 2].flatMap(i =>
      [0, 1, 2].map(j => `${i}-${j}`)
    )
    .filter(key => key !== '1-1')
    .reduce((acc, key) => ({ ...acc, [key]: initialGrid() }), {}),
  },
});

interface GridContextType {
  gridStack: GridState[];
  currentGridState: GridState;
  colorMap: Record<string, string>;
  allEvents: AllEvents;
  addEvent: (cellKey: string, newEvent: MyEvent) => void;
  deleteEvent: (cellKey: string, eventToDelete: MyEvent) => void;
  loadDataFromFile: (jsonData: string) => void;
  handleMainGridChange: (row: number, col: number, value: string) => void;
  handleSubGridChange: (subGridKey: string, row: number, col: number, value: string) => void;
  handleGridDoubleClick: (subGridKey: string, navigate: (path: string, options: any) => void) => void;
  handleBack: () => void;
}

// --- CONTEXT CREATION ---
export const GridContext = createContext<GridContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
interface GridProviderProps {
  children: ReactNode;
}

export const GridProvider: React.FC<GridProviderProps> = ({ children }) => {
  const [gridStack, setGridStack] = useState<GridState[]>([initialGridState()]);
  const [allEvents, setAllEvents] = useState<AllEvents>({});

  const saveData = useCallback((dataToSave: { gridStack: GridState[], allEvents: AllEvents }) => {
    fetch('http://localhost:3001/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSave),
    });
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/data')
      .then(response => response.json())
      .then(data => {
        if (data.gridStack) {
          setGridStack(data.gridStack);
        }
        if (data.allEvents) {
          const parsedEvents = data.allEvents;
          for (const cellKey in parsedEvents) {
            parsedEvents[cellKey] = parsedEvents[cellKey].map((event: MyEvent) => ({
              ...event,
              id: event.id || Date.now(),
              start: new Date(event.start as unknown as string),
              end: new Date(event.end as unknown as string),
            }));
          }
          setAllEvents(parsedEvents);
        }
      });
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      saveData({ gridStack, allEvents });
    }, 1000);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [gridStack, allEvents, saveData]);

  // --- COLOR LOGIC ---
  const rainbowColors = [
    '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF',
    '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
  ];
  const subGridKeys = [
    '0-0', '0-1', '0-2',
    '1-0',       '1-2',
    '2-0', '2-1', '2-2'
  ];
  const colorMap = subGridKeys.reduce((acc, key, index) => {
    acc[key] = rainbowColors[index];
    return acc;
  }, {} as Record<string, string>);

  const currentGridState = gridStack[gridStack.length - 1];

  const loadDataFromFile = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.gridStack && data.allEvents) {
        const parsedEvents = data.allEvents;
        for (const cellKey in parsedEvents) {
          parsedEvents[cellKey] = parsedEvents[cellKey].map((event: MyEvent) => ({
            ...event,
            id: event.id || Date.now(),
            start: new Date(event.start as unknown as string),
            end: new Date(event.end as unknown as string),
          }));
        }
        setGridStack(data.gridStack);
        setAllEvents(parsedEvents);
        saveData({ gridStack: data.gridStack, allEvents: parsedEvents });
      }
    } catch (error) {
      console.error("Failed to parse or load data from file", error);
      alert("Error: Could not load the data file. It may be corrupted.");
    }
  };

  const handleMainGridChange = (row: number, col: number, value: string) => {
    const newGridStack = [...gridStack];
    const newCurrentGridState = { ...newGridStack[newGridStack.length - 1] };
    newCurrentGridState.mainGrid = newCurrentGridState.mainGrid.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? value : c))
    );

    if (row !== 1 || col !== 1) {
      const subGridKey = `${row}-${col}`;
      newCurrentGridState.subGrids[subGridKey][1][1] = value;
    }
    
    newGridStack[newGridStack.length - 1] = newCurrentGridState;
    setGridStack(newGridStack);
  };

  const handleSubGridChange = (subGridKey: string, row: number, col: number, value: string) => {
    const newGridStack = [...gridStack];
    const newCurrentGridState = { ...newGridStack[newGridStack.length - 1] };
    const newSubGrid = newCurrentGridState.subGrids[subGridKey].map((r, i) =>
      r.map((c, j) => (i === row && j === col ? value : c))
    );
    newCurrentGridState.subGrids[subGridKey] = newSubGrid;

    if (row === 1 && col === 1) {
      const [mainGridRow, mainGridCol] = subGridKey.split('-').map(Number);
      newCurrentGridState.mainGrid[mainGridRow][mainGridCol] = value;
    }

    newGridStack[newGridStack.length - 1] = newCurrentGridState;
    setGridStack(newGridStack);
  };

  const handleGridDoubleClick = (subGridKey: string, navigate: (path: string, options: any) => void) => {
    navigate(`/subgoal/${subGridKey}`, {}); 
  };

  const handleBack = () => {
    if (gridStack.length > 1) {
      setGridStack(gridStack.slice(0, -1));
    }
  };

  const addEvent = (cellKey: string, newEvent: MyEvent) => {
    setAllEvents(prev => ({
      ...prev,
      [cellKey]: [...(prev[cellKey] || []), newEvent],
    }));
  };

  const deleteEvent = (cellKey: string, eventToDelete: MyEvent) => {
    console.log('Deleting event:', { cellKey, eventToDelete });
    setAllEvents(prev => {
      console.log('Events in cell:', prev[cellKey]);
      const newCellEvents = (prev[cellKey] || []).filter(event => event.id !== eventToDelete.id);
      console.log('New events in cell:', newCellEvents);
      return {
        ...prev,
        [cellKey]: newCellEvents,
      };
    });
  };

  const value = {
    gridStack,
    currentGridState,
    colorMap,
    allEvents,
    addEvent,
    deleteEvent,
    loadDataFromFile,
    handleMainGridChange,
    handleSubGridChange,
    handleGridDoubleClick,
    handleBack,
  };

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useGrid = () => {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error('useGrid must be used within a GridProvider');
  }
  return context;
};
