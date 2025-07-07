import React, { useState, useRef } from 'react';
import { Layout, message } from 'antd';
import FieldCanvas from './components/FieldCanvas';
import Sidebar from './components/Sidebar';
import { FieldStrategyProvider } from './context/FieldStrategyContext';
import './App.css';

const { Sider, Content } = Layout;

function App() {
  const fieldContainerRef = useRef(null);
  const [konvaStage, setKonvaStage] = useState(null);
  // State to control visibility of text overlays on the live canvas
  const [showOverlayText, setShowOverlayText] = useState(false);

  // Callback function to receive the Konva Stage instance from FieldCanvas
  const onStageReady = (stageInstance) => {
    setKonvaStage(stageInstance);
  };

  const handleDownload = async (format) => {
    if (!konvaStage) {
      message.error('Canvas is not ready for download.');
      return;
    }

    message.loading('Generating image...', 0);
    try {
      // Temporarily make the overlay text visible on the Konva Stage
      // This will trigger a re-render within Konva
      setShowOverlayText(true);

      // Wait for Konva to render the text. Konva's rendering is synchronous,
      // but a small delay can sometimes help ensure the DOM is fully updated
      // if there are any React-level asynchronous updates.
      // For Konva, this timeout is often not strictly necessary if `visible` is set synchronously,
      // but it's a good safeguard.
      await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay

      // Get the image data directly from the Konva Stage
      const image = konvaStage.toDataURL({
        mimeType: `image/${format}`,
        quality: 1, // Max quality
        pixelRatio: 2, // Increase pixel ratio for higher resolution image
      });

      const link = document.createElement('a');
      link.href = image;
      link.download = `cricket_field_strategy.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Hide the overlay text again after capture
      setShowOverlayText(false);

      message.destroy();
      message.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      setShowOverlayText(false); // Ensure text is hidden even on error
      message.destroy();
      message.error('Failed to generate image. Please try again.');
    }
  };
  return (
    <FieldStrategyProvider>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Overall Title for the Application */}

        <span
          style={{
            textAlign: 'center',
            width: '906.5px',
            marginRight: '-700px',
            fontSize: '20px',
            marginTop: '-10px',
            marginLeft: '-8px',
            height: '100px',
          }}
          className="span"
        >
          <h3
            style={{
              marginRight: '-24.5px',
              marginTop: '30px',
              paddingBottom: '10px',
              fontFamily: 'Public Sans',
              fontSize: '25px',
            }}
          >
            Cricket Field Strategizer 🏏
          </h3>
        </span>

        <Content style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
          <div
            ref={fieldContainerRef}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: 'white',
              display: 'flex',
              // Align items to start (top) to move the stage upwards slightly
              alignItems: 'flex-start', // Changed from 'center'
              justifyContent: 'center',
              position: 'relative',
              minHeight: '500px',
              height: '100%',
              boxSizing: 'border-box',
              marginTop: '90px',
              marginLeft: '-208px',
            }}
            className="div"
          >
            <FieldCanvas
              onStageReady={onStageReady}
              showOverlayText={showOverlayText}
            />
          </div>

          <Sider
            width={350}
            style={{
              backgroundColor: '#fff',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              overflowY: 'auto',
            }}
            breakpoint="lg"
            collapsedWidth="0"
            onBreakpoint={(broken) => {
              console.log(broken);
            }}
            onCollapse={(collapsed, type) => {
              console.log(collapsed, type);
            }}
          >
            <Sidebar onDownload={handleDownload} />
          </Sider>
        </Content>
      </Layout>
    </FieldStrategyProvider>
  );
}

export default App;
