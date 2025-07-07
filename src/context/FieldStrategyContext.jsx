import React, { createContext, useState, useContext, useCallback } from 'react';

const FieldStrategyContext = createContext();

export const FieldStrategyProvider = ({ children }) => {
  // Adjusted initial positions for a slightly smaller square canvas (e.g., ~350x350px)
  // Centered around x=175, y=175 (approx)
  const initialFielderPositions = [
    { id: 'fielder-1', name: 'Slip', x: 450, y: 600 }, // Close-in, top-center
    { id: 'fielder-2', name: 'Point', x: 750, y: 510 }, // Mid-off
    { id: 'fielder-3', name: 'Cover', x: 550, y: 375 }, // Mid-on
    { id: 'fielder-4', name: 'Long Off', x: 550, y: 130 }, // Point
    { id: 'fielder-5', name: 'Extra Cover', x: 700, y: 250 }, // Square leg
    { id: 'fielder-6', name: 'Mid-Wicket', x: 250, y: 350 }, // Long-on/off (deep)
    { id: 'fielder-7', name: 'Square Leg', x: 80, y: 510 }, // Third man (deep)
    { id: 'fielder-8', name: 'Fine Leg', x: 300, y: 700 }, // Deep extra cover
    { id: 'fielder-9', name: 'Long-On', x: 300, y: 130 }, // Close-in, center (e.g., silly mid-on/off)
  ];

  const [strategy, setStrategy] = useState({
    fieldPlacementName: 'My Cricket Strategy',
    teamName: 'My Team',
    batsmanHand: 'Right-Handed',
    bowlerType: 'Right-Arm Fast',
    wicketkeeperName: 'WK',
    bowlerName: 'Bowler',
    fielders: initialFielderPositions,
    fieldStrategy: 'Standard',
    matchFormat: 'T20 (20 Overs)',
    customOvers: 20,
    scenarioNotes: 'Notes for this field placement...',
  });

  const updateStrategy = useCallback((key, value) => {
    setStrategy((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateFielderPosition = useCallback((id, newX, newY) => {
    setStrategy((prev) => ({
      ...prev,
      fielders: prev.fielders.map((fielder) =>
        fielder.id === id ? { ...fielder, x: newX, y: newY } : fielder
      ),
    }));
  }, []);

  const updateFielderName = useCallback((id, newName) => {
    setStrategy((prev) => ({
      ...prev,
      fielders: prev.fielders.map((fielder) =>
        fielder.id === id ? { ...fielder, name: newName } : fielder
      ),
    }));
  }, []);

  const resetFielders = useCallback(() => {
    setStrategy((prev) => ({
      ...prev,
      fielders: initialFielderPositions.map((f) => ({ ...f })), // Deep copy to ensure new objects
    }));
  }, [initialFielderPositions]);

  return (
    <FieldStrategyContext.Provider
      value={{
        strategy,
        updateStrategy,
        updateFielderPosition,
        updateFielderName,
        resetFielders,
      }}
    >
      {children}
    </FieldStrategyContext.Provider>
  );
};

export const useFieldStrategy = () => useContext(FieldStrategyContext);
