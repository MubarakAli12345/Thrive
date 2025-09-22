import { Stage, Layer, Text, Rect } from 'react-konva';

function KonvaImage() {
  const stageWidth = 500;
  const stageHeight = 500;

  return (
    <Stage width={stageWidth} height={stageHeight} className='bg-gray-300 w-[500px]'>
      <Layer>
        {/* Border around the entire Stage */}
        <Rect
          x={0}
          y={0}
          width={stageWidth}
          height={stageHeight}
          stroke="blue"          // border color
          strokeWidth={2}        // thickness
          listening={false}      // not draggable / no events
        />

        <Text text="Try to drag shapes" fontSize={15} x={10} y={10} />

        <Rect
          x={20}
          y={50}
          width={100}
          height={100}
          fill="red"
          shadowBlur={10}
          draggable
        />
      </Layer>
    </Stage>
  );
}

export default KonvaImage;
