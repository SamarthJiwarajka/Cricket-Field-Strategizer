import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Circle, Rect, Line, Text, Group } from 'react-konva';
import { useFieldStrategy } from '../context/FieldStrategyContext';

const FieldCanvas = ({ onStageReady, showOverlayText }) => {
  const { strategy, updateFielderPosition } = useFieldStrategy();
  const stageRef = useRef(null);
  // Initial default for Stage - adjusted to reflect the new target size (e.g., 800 + 10 = 810)
  const [dimensions, setDimensions] = useState({ width: 810, height: 810 });

  useEffect(() => {
    const updateCanvasSize = () => {
      let newWidth = 810; // Fallback default
      let newHeight = 810; // Fallback default

      if (stageRef.current && stageRef.current.container()) {
        const container = stageRef.current.container().parentElement;
        if (container) {
          const padding = 20; // Match padding from App.jsx
          const availableWidth = container.offsetWidth - padding * 2;
          const availableHeight = container.offsetHeight - padding * 2;

          let baseSize = Math.min(availableWidth, availableHeight);
          // Decrease by another 20px from previous +30px, so now it's +10px
          newWidth = baseSize + 10;
          newHeight = baseSize + 10; // Force height to be equal to new width

          if (newWidth < 0) newWidth = 0;
          if (newHeight < 0) newHeight = 0;
        }
      }

      setDimensions({
        width: newWidth,
        height: newHeight,
      });
      console.log(
        'Konva Stage Dimensions (Even Smaller Square):',
        newWidth,
        newHeight
      );
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Pass the Konva Stage instance back to the parent (App.jsx)
    if (stageRef.current) {
      onStageReady(stageRef.current);
    }

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [onStageReady]); // Add onStageReady to dependency array

  // Calculate dynamic positions based on the CURRENT 'dimensions' state
  const fieldCenter = { x: dimensions.width / 2, y: dimensions.height / 2 };

  // Main green field circle radius - fills almost all available space of the square stage
  const mainFieldRadius = dimensions.width * 0.49;

  // Pitch dimensions relative to the main field's radius
  const pitchLength = mainFieldRadius * 0.6;
  const pitchWidth = mainFieldRadius * 0.1;

  // Dashed boundary radius - slightly smaller than the main green field
  const boundaryRadius = mainFieldRadius * 0.95;

  // Wicketkeeper and Bowler fixed positions relative to field center and pitch
  const wicketkeeperPos = {
    x: fieldCenter.x,
    y: fieldCenter.y + pitchLength / 2 + mainFieldRadius * 0.1,
  };
  const bowlerPos = {
    x: fieldCenter.x,
    y: fieldCenter.y - pitchLength / 2 - mainFieldRadius * 0.1,
  };

  const fielderRadius = 8;
  const labelFontSize = 0;
  const nameFontSize = 10;

  console.log('Current Strategy:', strategy);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        ref={stageRef}
        style={{
          backgroundColor: 'transparent',
          borderRadius: '8px',
          boxShadow: 'inset 0 0 0px rgba(0,0,0,0.3)',
          marginTop: '50px', // Keep this to move the stage upwards
        }}
      >
        <Layer>
          {/* Main Green Field Circle (fills the Stage) */}
          <Circle
            x={fieldCenter.x}
            y={fieldCenter.y}
            radius={mainFieldRadius}
            fill="#8BC34A"
            shadowColor="black"
            shadowBlur={5}
            shadowOffset={{ x: 0, y: 5 }}
            shadowOpacity={0.2}
          />

          {/* Dashed Boundary Circle */}
          <Circle
            x={fieldCenter.x}
            y={fieldCenter.y}
            radius={boundaryRadius}
            stroke="white"
            strokeWidth={2}
            dash={[10, 5]}
          />
          {showOverlayText && (
            <Text
              text="Boundary"
              x={fieldCenter.x + boundaryRadius - 80}
              y={fieldCenter.y - 10}
              fill="white"
              fontSize={14}
              fontStyle="italic"
            />
          )}

          {/* Pitch */}
          <Rect
            x={fieldCenter.x - pitchWidth / 2}
            y={fieldCenter.y - pitchLength / 2}
            width={pitchWidth}
            height={pitchLength}
            fill="#c7ac75"
            stroke="white"
            strokeWidth={0.5}
          />

          {/* Creases (approximate) */}
          <Line
            points={[
              fieldCenter.x - pitchWidth / 2,
              fieldCenter.y - pitchLength / 2 + pitchLength * 0.1,
              fieldCenter.x + pitchWidth / 2,
              fieldCenter.y - pitchLength / 2 + pitchLength * 0.1,
            ]}
            stroke="white"
            strokeWidth={1}
          />
          <Line
            points={[
              fieldCenter.x - pitchWidth / 2,
              fieldCenter.y + pitchLength / 2 - pitchLength * 0.1,
              fieldCenter.x + pitchWidth / 2,
              fieldCenter.y + pitchLength / 2 - pitchLength * 0.1,
            ]}
            stroke="white"
            strokeWidth={1}
          />

          {/* Wicketkeeper */}
          <Group x={wicketkeeperPos.x} y={wicketkeeperPos.y}>
            <Circle radius={fielderRadius} fill="#1890ff" strokeWidth={1} />
            <Text
              text={strategy.wicketkeeperName || 'WK'}
              fontSize={nameFontSize}
              fill="white"
              align="center"
              verticalAlign="top"
              width={fielderRadius * 4}
              x={-(fielderRadius * 2)}
              y={fielderRadius + 2}
            />
          </Group>

          {/* Bowler */}
          <Group x={bowlerPos.x} y={bowlerPos.y}>
            <Circle radius={fielderRadius} fill="#ff4d4f" strokeWidth={1} />
            <Text
              text={strategy.bowlerName || 'Bowler'}
              fontSize={nameFontSize}
              fill="white"
              align="center"
              verticalAlign="top"
              width={fielderRadius * 4}
              x={-(fielderRadius * 2)}
              y={fielderRadius + 2}
            />
          </Group>

          {/* Fielders */}
          {strategy.fielders.map((fielder) => (
            <Group
              key={fielder.id}
              x={fielder.x}
              y={fielder.y}
              draggable
              onDragEnd={(e) => {
                updateFielderPosition(fielder.id, e.target.x(), e.target.y());
              }}
            >
              <Circle radius={fielderRadius} fill="#722ed1" strokeWidth={1} />
              <Text
                text={fielder.name || 'Fielder'}
                fontSize={nameFontSize}
                fill="white"
                align="center"
                verticalAlign="top"
                width={fielderRadius * 4}
                x={-(fielderRadius * 2)}
                y={fielderRadius + 2}
              />
            </Group>
          ))}

          {/* Info Overlay (for screenshot) - CONDITIONAL RENDERING */}
          {showOverlayText && (
            <Group x={10} y={10}>
              <Text
                text={strategy.fieldPlacementName || 'Unnamed Strategy'}
                fontSize={24}
                fontStyle="bold"
                fill="white"
                shadowColor="black"
                shadowBlur={5}
              />
              <Text
                text={`Team: ${strategy.teamName || 'N/A'}`}
                fontSize={16}
                fill="white"
                y={30}
              />
              <Text
                text={`Batsman: ${strategy.batsmanHand || 'N/A'}`}
                fontSize={16}
                fill="white"
                y={50}
              />
              <Text
                text={`Bowler Type: ${strategy.bowlerType || 'N/A'}`}
                fontSize={16}
                fill="white"
                y={70}
              />
              <Text
                text={`Format: ${
                  strategy.matchFormat === 'Custom' && strategy.customOvers
                    ? `${strategy.customOvers} Overs (Custom)`
                    : strategy.matchFormat || 'N/A'
                }`}
                fontSize={16}
                fill="white"
                y={90}
              />
              <Text
                text={`Strategy: ${strategy.fieldStrategy || 'N/A'}`}
                fontSize={16}
                fill="white"
                y={110}
              />
            </Group>
          )}

          {/* Scenario Notes Overlay (for screenshot) - CONDITIONAL RENDERING */}
          {showOverlayText &&
            strategy.scenarioNotes &&
            strategy.scenarioNotes.trim() !== '' && (
              <Group
                x={10}
                y={
                  dimensions.height -
                  10 -
                  (strategy.scenarioNotes.split('\n').length * 20 + 20)
                }
              >
                <Rect
                  x={0}
                  y={0}
                  width={dimensions.width - 20}
                  height={strategy.scenarioNotes.split('\n').length * 20 + 20}
                  fill="rgba(0,0,0,0.5)"
                  cornerRadius={5}
                />
                <Text
                  text="Scenario Notes:"
                  fontSize={16}
                  fill="white"
                  fontStyle="bold"
                  x={10}
                  y={10}
                />
                <Text
                  text={strategy.scenarioNotes}
                  fontSize={14}
                  fill="white"
                  x={10}
                  y={30}
                  width={dimensions.width - 40}
                  wrap="word"
                />
              </Group>
            )}
        </Layer>
      </Stage>
    </div>
  );
};

export default FieldCanvas;
