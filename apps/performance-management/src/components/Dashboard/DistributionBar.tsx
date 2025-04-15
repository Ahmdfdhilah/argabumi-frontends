interface DistributionItem {
    value: number;
    color: string;
    textColor: string;
    label: string;
  }
  
  interface DistributionBarProps {
    data: DistributionItem[];
  }
  
  export const DistributionBar: React.FC<DistributionBarProps> = ({ data }) => {
    const total = data.reduce((sum: number, item: DistributionItem) => sum + item.value, 0);
  
    return (
      <div className="mt-4">
        <div className="flex space-x-1">
          {data.map((item: DistributionItem, index: number) => (
            <div
              key={index}
              className={`h-2 ${item.color} ${index === 0 ? 'rounded-l' : ''} ${index === data.length - 1 ? 'rounded-r' : ''}`}
              style={{ width: `${(item.value / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs">
          {data.map((item: DistributionItem, index: number) => (
            <span key={index} className={item.textColor}>{item.label}</span>
          ))}
        </div>
      </div>
    );
  };
  