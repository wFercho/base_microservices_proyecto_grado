interface PrecisionSliderProps {
  value: number;
  onChange: (value: number) => void;
  possibleValues: number[];
  unit?: string;
  className?: string;
}

export const PrecisionSlider: React.FC<PrecisionSliderProps> = ({
  value,
  onChange,
  possibleValues,
  unit = '',
  className = ''
}) => {
  // Encuentra el índice del valor actual
  const currentIndex = possibleValues.findIndex(v => v === value);
  const minValue = Math.min(...possibleValues);
  const maxValue = Math.max(...possibleValues);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = Number(e.target.value);
    onChange(possibleValues[newIndex]);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max={possibleValues.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          step="1"
          className="flex-1"
        />
        <span className="text-sm font-medium bg-blue-100 px-2 py-1 rounded w-20 text-center">
          {value.toFixed(2)}{unit}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{minValue.toFixed(2)}{unit}</span>
        <span>{maxValue.toFixed(2)}{unit}</span>
      </div>
      <div className="text-xs text-gray-400 text-center">
        {currentIndex + 1}/{possibleValues.length} opciones
      </div>
    </div>
  );
};